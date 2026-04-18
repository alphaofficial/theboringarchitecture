# Upgrade: add SSR to an existing TBA app

This is a one-time migration. After it's done, `npm run dev` and `npm run build` server-render every Inertia page instead of shipping an empty `<div id="app">` shell.

Prereqs:
- Clean git working tree (so you can review or revert).
- TBA app scaffolded from `install.sh`. If you've heavily customised `src/middleware/inertia.ts` or `src/controllers/BaseController.ts`, merge carefully.

## 1. Create `vite.ssr.config.mjs`

New file at the project root.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    ssr: resolve(__dirname, 'src/views/ssr.tsx'),
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'ssr.mjs',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

## 2. Create `src/views/ssr.tsx`

The SSR entry. Bundled by vite at build time — `import.meta.glob` discovers pages.

```tsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';
import type { InertiaAppResponse, Page } from '@inertiajs/core';

const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<
  string,
  { default: React.ComponentType }
>;

export function render(page: Page): InertiaAppResponse {
  return createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const mod = pages[`./pages/${name}.tsx`];
      if (!mod) throw new Error(`SSR: page not found: ${name}`);
      return mod.default;
    },
    setup: ({ App, props }) => <App {...props} />,
  });
}
```

## 3. Create `src/lib/renderHtml.ts`

Helper that turns the Inertia page object into a full HTML document. Used by the middleware and `BaseController`.

```ts
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import variables from '../config/variables';

const templatePath = path.join(process.cwd(), 'public', 'template.html');
const ssrBundlePath = path.join(process.cwd(), 'dist', 'ssr.mjs');

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

type SsrPayload = { head: string[]; body: string };
type SsrModule = { render: (page: unknown) => Promise<SsrPayload | void> };

async function loadSsrModule(): Promise<SsrModule> {
	const mtime = fs.statSync(ssrBundlePath).mtimeMs;
	const url = `${pathToFileURL(ssrBundlePath).href}?v=${mtime}`;
	return (await import(url)) as SsrModule;
}

async function renderOnSsr(page: unknown): Promise<SsrPayload | null> {
	try {
		const mod = await loadSsrModule();
		const result = await mod.render(page);
		return result ?? null;
	} catch (err) {
		console.error('[SSR] render failed, falling back to client-only:', err);
		return null;
	}
}

export async function renderHtml(
	page: unknown,
	title?: string,
	head?: string,
): Promise<string> {
	const ssr = await renderOnSsr(page);

	const template = fs.readFileSync(templatePath, 'utf-8');
	const app = ssr
		? ssr.body
		: `<div id="app" data-page="${escapeHtml(JSON.stringify(page))}"></div>`;
	const headContent = [head || '', ssr ? ssr.head.join('\n') : ''].filter(Boolean).join('\n');

	return template
		.replace('{{TITLE}}', escapeHtml(title || variables.APP_NAME))
		.replace('{{HEAD}}', headContent)
		.replace('{{APP}}', () => app)
		.replace('{{CLIENT_ENTRY}}', '/app.js');
}
```

## 4. Replace `src/views/main.tsx`

Hydrate if the server rendered markup, otherwise mount fresh. Same file works for both modes.

```tsx
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import './styles/global.css'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<string, { default: React.ComponentType }>;
    return pages[`./pages/${name}.tsx`]?.default;
  },
  setup({ el, App, props }) {
    if (el.hasChildNodes()) {
      hydrateRoot(el, <App {...props} />)
    } else {
      createRoot(el).render(<App {...props} />)
    }
  },
  progress: {
    color: '#4B5563',
  },
})
```

## 5. Patch `public/template.html`

Replace the hardcoded `<div id="app" ...>` with a `{{APP}}` placeholder so the helper can inject either the SSR body or an empty shell.

```diff
-		<div id="app" data-page="{{PAGE_DATA}}"></div>
+		{{APP}}
```

## 6. Replace `src/middleware/inertia.ts`

Drop the inline template rendering; delegate to the shared helper.

```ts
import { type Request, type Response, type NextFunction } from 'express';
import { InertiaExpressAdapter } from '../adapters/InertiaExpressAdapter';
import { renderHtml } from '../lib/renderHtml';
import variables from '../config/variables';

declare module 'express-serve-static-core' {
	interface Request {
		inertia: InertiaExpressAdapter;
	}
}

export class InertiaExpressMiddleware {
	static async apply(req: Request, res: Response, next: NextFunction) {
		const inertia = new InertiaExpressAdapter({ version: '1' });

		const user = await req.user();
		const isAuthenticated = req.is_authenticated();

		inertia.share({
			applicationName: variables.APP_NAME,
			isAuthenticated,
			user: user ? { id: user.id, name: user.name, email: user.email } : null,
		});

		req.inertia = inertia;

		res.render = ((view: string, props: Record<string, any> = {}) => {
			const page = inertia.render(req, res, view, props);

			if (res.headersSent) return;

			renderHtml(page, props._title, props._head)
				.then(html => res.send(html))
				.catch(next);
		}) as any;

		next();
	}
}
```

## 7. Replace `src/controllers/BaseController.ts`

Same idea: no inline template code.

```ts
import { Request, Response } from 'express';
import { PageName } from '../config/pages';
import { renderHtml } from '../lib/renderHtml';

export class BaseController {
	protected req: Request;
	protected res: Response;

	constructor(req: Request, res: Response) {
		this.req = req;
		this.res = res;
	}

	public async render(componentName: PageName, componentProps: any = {}, documentMetadata: any = {}) {
		const { req, res } = this;
		const page = req.inertia.render(req, res, componentName, componentProps);

		if (res.headersSent) {
			return;
		}

		const html = await renderHtml(page, documentMetadata.title, documentMetadata.head);
		return res.send(html);
	}
}
```

## 8. Update `package.json` scripts

```diff
-    "dev": "concurrently --names \"pages,server,client\" --prefix-colors \"yellow,cyan,magenta\" \"npm run pages:watch\" \"npm run dev:server\" \"npm run dev:client\"",
+    "dev": "concurrently --names \"pages,server,client,ssr\" --prefix-colors \"yellow,cyan,magenta,blue\" \"npm run pages:watch\" \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:ssr\"",
     "dev:server": "nodemon --exec tsx src/index.ts",
     "dev:client": "vite build --watch",
+    "dev:ssr": "vite build --config vite.ssr.config.mjs --watch",
     ...
-    "predev": "npm run pages:generate",
+    "predev": "npm run pages:generate && npm run build:ssr",
     ...
-    "build": "npm run build:client && npm run build:server",
+    "build": "npm run build:client && npm run build:ssr && npm run build:server",
     "build:client": "vite build",
+    "build:ssr": "vite build --config vite.ssr.config.mjs",
     "build:server": "tsc --project tsconfig.server.json && tsc-alias -p tsconfig.server.json",
```

## 9. Build + verify

```bash
npm install        # no new deps required; safe to skip if nothing in package.json dependencies changed
npm run build      # should produce dist/ssr.mjs + dist/index.js
npm run dev        # open http://localhost:3000, view source, confirm real markup inside <div id="app" data-page="...">…</div>
```

If something goes wrong:
- If `[SSR] render failed, falling back to client-only:` appears in logs on every request, look at the error — usually a missing/renamed page or a broken import in one of your `.tsx` files.
- `git diff` the five modified files to compare against the snippets above.

## 10. Optional: self-host fonts to fix font flicker

SSR makes font flicker more visible: the page paints instantly with a rendered body, then Google Fonts downloads the webfont and swaps — causing a layout shift a few hundred ms in. Fixing it requires the font binary to be present before first paint. The only reliable way is to self-host and preload it.

The starter uses Fraunces; the same approach works for any Google webfont.

### 10a. Download t
he woff2

Fetch the font CSS from Google with a modern User-Agent (they serve woff2 only to recent browsers), pull out the `latin` subset URL, and save it to `public/fonts/`:

```bash
mkdir -p public/fonts
curl -sSL -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' \
  'https://fonts.googleapis.com/css2?family=Fraunces:wght@100..900&display=swap' \
  | grep -A1 '/\* latin \*/' \
  | grep -oE 'https://fonts\.gstatic\.com[^)]*\.woff2' \
  | head -1 \
  | xargs curl -sSL -o public/fonts/fraunces-latin.woff2
```

(If you're using a different font, swap `Fraunces` for your family name in the URL and pick the subset you need.)

### 10b. Unignore `public/fonts/`

`public/*` is in `.gitignore` — add an exception:

```diff
 # Ignore build output in public but keep template + static assets
 public/*
 !public/template.html
 !public/favicon.svg
+!public/fonts/
```

### 10c. Add `@font-face` in `src/views/styles/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
	font-family: 'Fraunces';
	font-style: normal;
	font-weight: 100 900;
	font-display: swap;
	src: url('/fonts/fraunces-latin.woff2') format('woff2');
	unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

### 10d. Preload in `public/template.html`, drop the Google Fonts links

```diff
-		<link rel="preconnect" href="https://fonts.googleapis.com" />
-		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
-		<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
+		<link rel="preload" as="font" type="font/woff2" href="/fonts/fraunces-latin.woff2" crossorigin />
 		<link rel="stylesheet" href="/main.css" />
```

The `crossorigin` attribute is required even for same-origin font preloads — fonts are always fetched in CORS mode. Omit it and the preload is wasted (the browser re-fetches the font when `@font-face` kicks in).

### Why this kills the flicker

- **Preload** starts downloading the woff2 during `<head>` parsing, in parallel with `main.css` and `app.js`, at high priority.
- **Self-hosting** removes a third-party DNS + TCP + TLS round-trip to `fonts.gstatic.com`.
- **Variable font (weights 100–900 in one file)** means one ~65 KB fetch covers every heading weight on the page.

By the time first paint happens, the font is in the HTTP cache. `@font-face` resolves immediately, `font-display: swap` never has a fallback to swap from.

## Known caveat

`@types/express-serve-static-core` 5.1+ widened `req.params` from `string` to `string | string[]`, which makes `tsc` fail in `npm run build` on any `req.params.x` use unless the handler types its params explicitly: `req: Request<{ id: string }>` or similar. If your `build:server` step fails with `TS2345: 'string | string[]' is not assignable to 'string'`, that's why — unrelated to SSR but triggered by fresh npm installs that resolve the newer types package. Either annotate the affected handlers, or pin `"@types/express-serve-static-core": "5.0.7"` via `"overrides"` in `package.json`. User should confirm this first
