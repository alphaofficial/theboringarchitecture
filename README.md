# The Boring Architecture

A batteries-included fullstack starter built on **Express**, **InertiaJS**, **React**, **MikroORM**.

## Table of contents
- [Quick start for humans](#quick-start-for-humans)
- [Quick start for agents](#quick-start-for-agents)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication helpers](#authentication-helpers)
- [Queue](#queue)
- [Mailer](#mailer)
- [Scheduler](#scheduler)
- [Events](#events)
- [Cache](#cache)
- [File storage](#file-storage)
- [Building features](#building-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Production checklist](#production-checklist)
- [Releases and versioning](#releases-and-versioning)
- [Contributing](#contributing)
- [License](#license)

## Quick start for humans
```bash
curl -fsSL https://raw.githubusercontent.com/alphaofficial/theboringarchitecture/main/install.sh | bash
```

## Quick start for agents

```bash
curl -fsSL https://raw.githubusercontent.com/alphaofficial/theboringarchitecture/main/install.sh | bash -s -- --quick <your app name>
```

Flags: `--quick`, `--branch <name>`, `--no-install`, `--no-git`.

## Architecture

The Boring Architecture uses [InertiaJS](https://inertiajs.com/) to bridge Express and React. No separate API layer. Every request flows through a single pipeline:

On the first visit the server returns a full HTML document with the initial page component and props embedded. Subsequent navigations are handled client-side by Inertia. 
The browser sends XHR requests and receives only the updated page component name and props as JSON, avoiding full page reloads.


## Scripts

| Command                      | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `npm run dev`                | Start Express server + Vite watch            |
| `npm run build`              | Production build (client + server)           |
| `npm start`                  | Run built server (`dist/index.js`)           |
| `npm test`                   | Run integration + E2E tests                  |
| `npm run test:integration`   | Run integration tests (Vitest + supertest)   |
| `npm run test:typecheck`     | Typecheck integration + Playwright tests     |
| `npm run test:e2e`           | Run Playwright E2E tests                     |
| `npm run work`               | Start the Graphile Worker queue worker       |
| `npm run migrate`            | Generate + apply migrations                  |
| `npm run migration:run`      | Apply pending migrations                     |
| `npm run migration:revert`   | Revert the last applied migration            |
| `npm run migration:create`   | Create a blank migration                     |
| `npm run migration:status`   | Show pending / applied migration status      |
| `npm run db:seed`            | Run seeders                                  |
| `npm run scaffold -- ...`    | Generate pages, controllers, routes          |

## Environment variables

| Variable                    | Default                 | Notes                                                            |
| --------------------------- | ----------------------- | ---------------------------------------------------------------- |
| `NODE_ENV`                  | `development`           | `development` \| `production` \| `test`                          |
| `PORT`                      | `3000`                  |                                                                  |
| `APP_URL`                   | `http://localhost:3000` | Public URL of the app                                            |
| `TRUST_PROXY`               | `loopback`              | Set to your LB CIDR (or `true`) when behind a reverse proxy      |
| `SESSION_SECRET`            | _(dev only default)_    | **Required in production.** Generate with `openssl rand -hex 32` |
| `SESSION_MAX_AGE`           | `86400000`              | Session lifetime in ms (24h default)                             |
| `APP_NAME`                  | `The Boring Architecture` | Display name shown in the UI and `<title>`                     |
| `DB_PATH`                   | `theboringarchitecture.db` | SQLite file path                                               |
| `APP_KEY`                       | _(dev only default)_    | **Required in production.** Used for HMAC token signing. Generate with `openssl rand -hex 32` |
| `RATE_LIMIT_ENABLED`            | `false`                 | Enable per-IP limiter on `/login` and `/register`                                             |
| `RATE_LIMIT_AUTH_MAX`           | `5`                     | Max requests per window on auth routes                                                        |
| `RATE_LIMIT_AUTH_WINDOW_MS`     | `60000`                 | Window size in ms for the auth rate limiter                                                  |
| `RATE_LIMIT_FEATURE_MAX`        | `60`                    | Max requests per window on feature routes                                                     |
| `RATE_LIMIT_FEATURE_WINDOW_MS`  | `60000`                 | Window size in ms for feature rate limiter                                                    |
| `PASSWORD_RESET_EXPIRY`         | `60`                    | Password-reset token expiry in minutes                                                        |
| `EMAIL_VERIFICATION_EXPIRY`     | `60`                    | Email-verification token expiry in minutes                                                    |
| `MAIL_FROM`                     | `noreply@example.com`   | Sender address used in all outgoing emails                                                    |
| `MAIL_HOST`                     | _(none)_                | SMTP hostname — used if you wire the `smtp` driver in bootstrap                               |
| `MAIL_PORT`                     | `587`                   | SMTP port                                                                                     |
| `MAIL_USER`                     | _(none)_                | SMTP username                                                                                 |
| `MAIL_PASS`                     | _(none)_                | SMTP password                                                                                 |
| `STORAGE_PATH`                  | `storage`               | Root directory for the `local` storage driver                                                 |
| `DATABASE_URL`                  | _(none)_                | PostgreSQL connection URL — required to enable the Queue (Graphile Worker)                    |
| `SSR_ENABLED`                   | `true`                  | Server-side render every page. Set to `false` to ship a client-only shell.                    |

## Rendering and SSR

Request exposes a render method that enables server rendered pages in views

```ts
// Controller
res.render('Home', {
  message: 'Hello from Express',
  user: await req.user(),
});
```

```tsx
// src/views/pages/Home.tsx
export default function Home({ message, user }: Props) {
  return <h1>{message}, {user?.name}</h1>;
}
```

`src/config/pages.ts` is autogenerated from `src/views/pages/**/*.tsx` — drop a new `.tsx` file and the `PageName` union updates automatically (live in `npm run dev` via the chokidar watcher, or one-shot via the `predev`/`prebuild` hook).

Skip the boilerplate with the scaffold script:

```bash
npm run scaffold -- page Posts                     # controller + page + GET /posts
npm run scaffold -- page Auth/Profile /profile     # nested page at an explicit path
npm run scaffold -- controller Billing             # controller only
npm run scaffold -- route post /posts Posts.create --auth
npm run scaffold -- model Post --fields "title:string,body:text,publishedAt:datetime?"
npm run scaffold -- page Post --model --fields "title:string,body:text"
```


### How it works

A controller calls `res.render('Home', props)`. The Inertia middleware (`src/middleware/inertia.ts`) has overridden `res.render` to:

1. Call `InertiaExpressAdapter.render` (in `src/primitives/inertia.ts`) to build the Inertia page object (`{ component, props, url, version }`).
2. If the request is an Inertia navigation (`X-Inertia: true` header, e.g. a client-side `router.visit`), the adapter responds with the page object as JSON. **SSR only runs for the initial document request** — partial updates never hit the SSR bundle.
3. Otherwise, call `renderHtml`. If `SSR_ENABLED` is true, it dynamically imports the SSR bundle from `dist/ssr.mjs` (the bundle's `mtimeMs` is appended as a cache-buster, so a fresh build is picked up on the next request) and invokes `render(page)`, which returns `{ head, body }`.
4. Read `public/template.html` and substitute the four placeholders: `{{TITLE}}` (page title or `APP_NAME`), `{{HEAD}}` (controller-supplied head snippets + SSR-emitted head tags), `{{APP}}` (the rendered body, or the client-only `<div id="app" data-page="…">` shell), and `{{CLIENT_ENTRY}}` (`/app.js`).

The SSR module is `src/views/ssr.tsx`. It uses `import.meta.glob('./pages/**/*.tsx', { eager: true })` to resolve page components by name and `renderToString` from `react-dom/server` via Inertia's `createInertiaApp`. If a page name can't be resolved, the module throws `SSR: page not found: <name>` — the adapter catches this and falls back to the client-only shell.

`renderPage(req, res, 'Error', props)` is the lower-level helper that the same pipeline runs. It is exported for middleware (e.g. `src/middleware/errorHandler.ts` renders the `Error` page with it). Controllers should keep using `res.render`.

### Build pipeline

- `predev` runs `pages:generate && build:ssr`, so the SSR bundle is on disk before the watchers start.
- `dev` runs four concurrent watchers — `pages:watch` (regenerates `src/config/pages.ts` on page file change), `dev:server` (nodemon + tsx), `dev:client` (`vite build --watch`, emits `public/app.js` + `public/main.css` + `public/assets/*`), and `dev:ssr` (`vite build --watch` with `vite.ssr.config.mjs`, emits `dist/ssr.mjs`).
- `build` runs the three builders in order: `build:client` → `build:ssr` → `build:server` (tsc + `tsc-alias` for the Node bundle). The Express process reads `dist/ssr.mjs` from disk at request time. See `vite.config.mjs` (client) and `vite.ssr.config.mjs` (server) for the two Vite configs.

### Hydration

The SSR pass writes the rendered HTML plus a `data-page` JSON envelope. The client entry (`src/views/main.tsx`) reads `data-page` and, if `el.hasChildNodes()`, calls `hydrateRoot` to attach event handlers to the existing DOM. If the server didn't render (e.g. SSR was disabled or the bundle failed to load), it falls back to `createRoot` and mounts fresh — a missed server render is still recoverable on the client, so React 19 picks up the same props without a re-fetch.

### Failure mode

If the SSR bundle fails to load or render (e.g. a bad page import, a missing/renamed page, a broken import chain in a `.tsx` file), the adapter logs `[SSR] render failed, falling back to client-only:` and serves the client-only shell. The request still succeeds — a broken SSR pass is never user-visible.

### Troubleshooting

- **Page paints blank for a second, then the client takes over.** Either the page is shipping from a cached client-only shell, or the SSR pass failed. Check the server logs for `[SSR] render failed…` and the error above it.
- **`SSR: page not found: <Name>` in the logs.** The page name passed to `res.render` doesn't match any file under `src/views/pages/`. Check the `PageName` union in `src/config/pages.ts` (regenerated by `pages:generate`) and the casing — Inertia page names are case-sensitive.
- **Stale content after editing a page.** Both `dev:client` and `dev:ssr` watchers should rebuild the bundles; check the watcher logs. After a fresh `predev` rebuild you may need a hard refresh in the browser so the new `dist/ssr.mjs` is re-imported (the `mtimeMs` cache-buster handles this automatically on the next server restart).
- **Want to debug with the client-only shell.** Set `SSR_ENABLED=false`, restart the server, view source — you'll see `<div id="app" data-page="…">` and no server-rendered body.

## Database

This project uses **MikroORM** with the **EntitySchema** pattern mapped to plain domain models. 
See `src/database/mappings/` and `src/models/`.

Switch to Postgres by changing `src/database/orm.config.ts` to use `@mikro-orm/postgresql` and setting connection env vars.

## Authentication helpers

Available on every `req` and can be extended

```ts
req.is_authenticated(): boolean
req.is_guest(): boolean
req.user_id(): string | null
req.user(): Promise<User | null>
req.authenticate(user: User): Promise<void>
req.logout(): Promise<void>
```

### Route guards

Three middleware guards live in `src/middleware/auth.ts`:

| Guard      | Behaviour                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `auth`     | Redirects unauthenticated users to `/login`                                                    |
| `guest`    | Redirects authenticated users to `/home`                                                       |
| `verified` | Requires auth **and** a verified email; redirects unverified users to `/verify-email`          |

```ts
import { auth, guest, verified } from '../middleware/auth';

route.get('/dashboard', verified, dashboard.show); // auth + verified
route.get('/settings',  auth,     settings.show);  // auth only
route.get('/login',     guest,    auth.showLogin);  // guests only
```

### Auth flows

| Route | Method | Guard | Description |
| ----- | ------ | ----- | ----------- |
| `/forgot-password` | GET | `guest` | Render the forgot-password form |
| `/forgot-password` | POST | `guest` | Send a password-reset email |
| `/reset-password/:token` | GET | `guest` | Render the reset-password form |
| `/reset-password` | POST | `guest` | Validate token and update password |
| `/verify-email` | GET | `auth` | Render the email-verification notice page |
| `/verify-email/:token` | GET | `auth` | Verify the token and mark email as verified |
| `/email/resend-verification` | POST | `auth` | Re-send the verification email |

## Queue

Background jobs are powered by **[Graphile Worker](https://worker.graphile.org/)** and require a **PostgreSQL** database (`DATABASE_URL`).

```ts
import { Queue } from './src/primitives/queue';

// Dispatch a job from anywhere in the application
await Queue.dispatch('send-welcome-email', { to: 'user@example.com', name: 'Alice' });
```

Jobs live in `src/jobs/`. Each file exports an `async` function that receives the typed payload:

```ts
// src/jobs/sendWelcomeEmail.ts
export async function sendWelcomeEmail(payload: unknown): Promise<void> {
  const { to, name } = payload as { to: string; name?: string };
  // ... send the email
}
```

Register jobs and start the worker in `src/worker.ts`, then run:

```bash
npm run work
```

> **Note:** If `DATABASE_URL` is not set, `Queue.dispatch` is a safe no-op (logs a warning) so the rest of the app continues to work with SQLite.

## Mailer

Send transactional email via `Mailer.send`:

```ts
import { Mailer } from './src/primitives/mail';

await Mailer.send('user@example.com', 'Welcome!', '<p>Thanks for signing up.</p>');
```

The built-in bootstrap selects the `log` driver by default. If you want a different driver, change your bootstrap code:

| Driver | Description                                              |
| ------ | -------------------------------------------------------- |
| `log`  | Writes mail to the application log (default, no config) |
| `smtp` | Sends via SMTP — requires `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` |

Register a custom driver at boot time:

```ts
import { Mailer, MailTransport, MailMessage } from './src/primitives/mail';

const PostmarkTransport = (): MailTransport => {
  return {
    async sendMail(message: MailMessage): Promise<void> {
      // call Postmark API …
    }
  }
}

Mailer.registerDriver('postmark', new PostmarkTransport());
Mailer.useDriver('postmark');
```

## Scheduler

Register recurring tasks with a cron expression via `Scheduler.on`:

```ts
import { Scheduler } from './src/primitives/scheduler';

Scheduler.on('0 * * * *', async () => {
  // runs at the start of every hour
  await cleanUpExpiredSessions();
});
```

Scheduled tasks are started by the background worker process via `npm run work`.

## Events

An in-process event bus for modular-monolith communication. Feature listeners live under `src/events/`.

```ts
import { Bus } from './src/primitives/bus';

Bus.on('auth.registered', ({ email }) => {
  console.log(`New user: ${email}`);
});

Bus.on('order.placed' as any, ({ orderId, total }: any) => {
  console.log(`Order ${orderId} placed for $${total}`);
});

Bus.publish('order.placed' as any, { orderId: 'abc-123', total: 49.99 });
```

> **Note:** Events are synchronous and in-process — listeners run immediately in the same Node.js event loop tick. For async/background work, dispatch a Queue job from within the listener.

## Cache

A simple key/value cache backed by an in-process `memory` driver by default. Switch drivers in bootstrap code.

```ts
import { Cache } from './src/primitives/cache';

// Store a value (no expiry)
await Cache.set('user:42', { name: 'Alice' });

// Store with a TTL (seconds)
await Cache.set('session:token', 'abc123', 300); // expires in 5 minutes

// Retrieve a value (returns undefined if missing or expired)
const user = await Cache.get<{ name: string }>('user:42');

// Delete a single key
await Cache.delete('user:42');

// Clear the entire cache
await Cache.flush();
```

Register a custom driver that implements the `CacheDriver` interface:

```ts
import { Cache, CacheDriver } from './src/primitives/cache';

const RedisCacheDriver = (): CacheDriver => {
  return {
    async get<T>(key: string): Promise<T | undefined> { /* ... */ }
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> { /* ... */ }
    async delete(key: string): Promise<void> { /* ... */ }
    async flush(): Promise<void> { /* ... */ }
  }
}

Cache.registerDriver('redis', new RedisCacheDriver());
Cache.useDriver('redis');
```

## File storage

File storage is backed by the built-in `local` driver by default. Switch drivers in bootstrap code once you register your own implementation. The local driver writes files under the `STORAGE_PATH` directory and serves them at `/storage/<path>`.

```ts
import { Storage } from './src/primitives/storage';

// Write a file
await Storage.put('uploads/avatar.png', imageBuffer);

// Read a file back
const data: Buffer = await Storage.get('uploads/avatar.png');

// Delete a file
await Storage.delete('uploads/avatar.png');

// Get the public URL for a file
const publicUrl: string = Storage.url('uploads/avatar.png');
// → http://localhost:3000/storage/uploads/avatar.png

// Check whether a file exists
const exists: boolean = await Storage.exists('uploads/avatar.png');
```

| Driver  | Description                                       | Notes                                      |
| ------- | ------------------------------------------------- | ------------------------------------------ |
| `local` | Writes to disk under `STORAGE_PATH` (default `storage/`) | Wired by default in bootstrap         |

Register a custom driver that implements the `StorageDriver` interface:

```ts
import { Storage, StorageDriver } from './src/primitives/storage';

class CloudinaryDriver implements StorageDriver {
    async put(filePath: string, data: Buffer | string): Promise<void> { /* ... */ }
    async get(filePath: string): Promise<Buffer> { /* ... */ }
    async delete(filePath: string): Promise<void> { /* ... */ }
    url(filePath: string): string { return `https://cdn.example.com/${filePath}`; }
    async exists(filePath: string): Promise<boolean> { /* ... */ }
}

Storage.registerDriver('cloudinary', new CloudinaryDriver());
Storage.useDriver('cloudinary');
```

## Building features

Everything in The Boring Architecture is generated, registered, and routed in three places: a React page under `src/views/pages/`, a controller under `src/controllers/`, and a route under `src/router/route.ts`. Data models add a fourth — a plain TS class plus a MikroORM mapping.

### Fast path — scaffold it

The `npm run scaffold` command generates the page, controller, and route in one shot. Subcommands (see `scripts/scaffold.sh` for the full grammar):

| Subcommand | What it generates |
| --- | --- |
| `page <Name>` | React page + controller + `GET /<kebab-name>` route |
| `page <Name> [path]` | Same, with an explicit route path (e.g. `/articles`) |
| `page <Sub/Name> [path]` | Same, with a nested component path (`Auth/Profile` → `src/views/pages/Auth/Profile.tsx`) |
| `page <Name> --model --fields "..."` | Page + controller + route + model + EntitySchema mapping in one step |
| `controller <Name>` | Controller file only |
| `route <method> <path> <Controller.action> [--auth\|--guest]` | Route entry only |
| `model <Name> --fields "..."` | Model class + `*.map.ts` EntitySchema file |
| `job <Name>` | Worker handler stub in `src/jobs/` |
| `mail <Name>` | Mail template stub |
| `event <Name>` | Event listener stub in `src/events/` |

Field types: `string`, `text`, `int`, `bool`, `date`, `datetime`, `decimal`, `uuid`, `json`. Append `?` for nullable (e.g. `publishedAt:datetime?`).

Examples:

```bash
npm run scaffold -- page Posts
npm run scaffold -- page Posts /articles
npm run scaffold -- page Auth/Profile /profile
npm run scaffold -- controller Billing
npm run scaffold -- route get  /health       Public.health
npm run scaffold -- route post /posts        Posts.create --auth
npm run scaffold -- model  Post  --fields "title:string,body:text,publishedAt:datetime?"
npm run scaffold -- page   Post  --model --fields "title:string,body:text"
```

After scaffolding a model, run `npm run migrate` to apply it to the database. The sections below describe what the scaffold produces so you can do it by hand or tweak what was generated.

### Adding a page

A "page" is a React component rendered by a controller. Pages live under `src/views/pages/` and are nested with `/`:

```tsx
// src/views/pages/Posts.tsx
import { Head, Link } from '@inertiajs/react';
import Navigation from '../components/Navigation';

interface Post { id: string; title: string; }
interface Props { posts: Post[]; }

export default function Posts({ posts }: Props) {
  return (
    <>
      <Head title="Posts" />
      <Navigation />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
```

`src/config/pages.ts` is regenerated automatically by `scripts/generate-pages.ts`, which walks `src/views/pages/**/*.tsx` and emits the `PageName` literal-union. Drop a new `Posts.tsx` and:

- `npm run dev` runs a chokidar watcher (`pages:watch`) that regenerates `pages.ts` on file add/remove within ~1s.
- `npm run build` and `npm run dev` both run `pages:generate` as a `pre*` hook, so cold builds and CI are always in sync.

You never edit `pages.ts` by hand. Subdirectories are preserved in the name — `src/views/pages/Auth/Login.tsx` becomes `'Auth/Login'`.

Globally shared props are merged into every page automatically (see `src/middleware/inertia.ts`). Read them with `usePage`:

```tsx
import { usePage } from '@inertiajs/react';

const { props } = usePage<{ applicationName: string; isAuthenticated: boolean; user: { id: string; name: string; email: string } | null }>();
```

Currently shared: `applicationName`, `isAuthenticated`, `user`.

### Adding a controller

Controllers are plain exported functions that match Express handler signatures.

```ts
// src/controllers/posts.ts
import { Request, Response } from 'express';
import { Post } from '../models/Post';

export async function index(req: Request, res: Response) {
  const db =  req.database
  const posts = await  db.findAll(Post);

  return res.render('Posts', { posts });
}

export async function show(req: Request, res: Response) {
  const db =  req.database
  const post = await db.findOne(Post, { id: req.params.id });

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  return res.render('Post', { post });
}

export async function create(req: Request, res: Response) {
  const db =  req.database
  const post = new Post(/* ... */);
  await db.persistAndFlush(post);
  return res.redirect(`/posts/${post.id}`);
}
```

Conventions:

- `req.database` is a forked MikroORM `EntityManager` for interacting with the db.
- `req.user()`, `req.user_id()`, `req.is_authenticated()`, `req.authenticate(user)`, `req.logout()` are auth helpers — see [Authentication helpers](#authentication-helpers).
- `res.render('PageName', props)` is the canonical way to render a page. The page name is type-checked against the autogenerated `PageName` union. The middleware (`src/middleware/inertia.ts`) wires `res.render` to the SSR pipeline; there is no separate `renderPage` call needed in controllers. (`renderPage` is exported from `src/primitives/inertia.ts` and is used by `src/middleware/errorHandler.ts` to render the `Error` page.)
- For redirects, return `res.redirect('/...')`.
- For JSON errors, return `res.status(404).json(...)`.

### Wiring routes

All routes live in `src/router/route.ts`.

```ts
// src/router/route.ts
import * as Posts from '../controllers/posts';
import { auth } from '../middleware/auth';

route.get('/posts',       auth, Posts.index);
route.get('/posts/:id',   auth, Posts.show);
route.post('/posts',      auth, Posts.create);
```

Available guards are documented under [Authentication helpers](#authentication-helpers) → Route guards.

### Adding a data model

Models are plain Active Record style TypeScript classes. The ORM mapping lives in a separate file so the model stays decorator-free.

**Step 1 — Define the class**

```ts
// src/models/Post.ts
import { v4 as uuid } from 'uuid';

export class Post {
  id: string = uuid();
  title!: string;
  body!: string;
  authorId!: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(title: string, body: string, authorId: string) {
    this.title = title;
    this.body = body;
    this.authorId = authorId;
  }
}
```

**Step 2 — Add the EntitySchema mapping**

```ts
// src/database/mappings/post.map.ts
import { EntitySchema } from '@mikro-orm/core';
import { Post } from '../../models/Post';

export const PostMapper = new EntitySchema<Post>({
  class: Post,
  tableName: 'posts',
  properties: {
    id: { type: 'string', primary: true },
    title: { type: 'string' },
    body: { type: 'text' },
    authorId: { type: 'string', index: true },
    createdAt: { type: 'Date', defaultRaw: 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'Date', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() },
  },
});
```

The ORM auto-discovers any file matching `**/mappings/*.map.ts`.

**Step 3 — Generate and run a migration**

The common case is `npm run migrate`, which diffs your entities against the DB and applies the result:

```bash
npm run migrate   # = migration:create (diff) + migration:run (apply)
```

All available migration scripts:

| Script                                 | Purpose                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run migrate`                      | Generate a migration from the entity/DB diff, then apply it. Use after editing entities. |
| `npm run migration:create`             | Diff entities vs. DB and write a new migration file. Does not apply it.                  |
| `npm run migration:run`                | Apply any pending migration files (`migration:up`). Use after pulling teammates' code.   |
| `npm run migration:revert`             | Roll back the last applied migration (`migration:down`).                                 |
| `npm run migration:status`             | Check whether any migrations are pending.                                                |
| `npx mikro-orm migration:fresh`        | Drop the schema and re-run every migration from scratch. Destructive; dev only.          |
| `npx mikro-orm migration:create --blank` | Create an empty migration for hand-written SQL (e.g. data backfills).                  |
| `npm run db:seed`                      | Run the default seeder.                                                                  |

> **Note:** MikroORM's CLI does not have a `migration:generate` command — "generate" is `migration:create` (it writes a migration file containing the entity/DB diff). `--blank` suppresses the diff.

Typical dev loop: edit an entity → `npm run migrate` → commit the new migration file alongside the entity change. Teammates just run `npm run migration:run` after pulling.

**Step 4 — Use that database to run queries**

```ts
const db = req.database;

// Read
const post = await db.findOne(Post, { id });
const all  = await db.findAll(Post);

// Write
const post = new Post('Hello', 'Body', req.user_id()!);
await db.persistAndFlush(post);

// Update
post.title = 'Updated';
await db.flush();

// Delete
await db.removeAndFlush(post);
```

### End-to-end checklist for a new feature

1. `npm run scaffold -- model Foo` (model + mapping).
2. Edit the generated mapping to add your columns.
3. `npm run migrate`.
4. `npm run scaffold -- page Foo` (controller + page + route in one shot).
5. `npm run build`.

## Testing

```bash
npm test                  # integration + E2E
npm run test:typecheck    # typecheck test files
```

## Deployment

### Docker

The included `Dockerfile` builds a production image with PM2 as the process manager.

```bash
# Build the image
docker build -t tba-app .

# Run the container
docker run -d -p 3000:3000 --env-file .env tba-app
```

The image installs dependencies, compiles TypeScript, builds the Vite frontend, and starts the app via `pm2-runtime`. Port 3000 is exposed by default.

### PM2 cluster mode

The `ecosystem.config.js` runs the compiled app (`./dist/index.js`) in PM2 cluster mode. Default settings:

| Option | Value | Notes |
|---|---|---|
| `exec_mode` | `cluster` | Spreads across available CPUs |
| `instances` | `1` | Increase to match your CPU count |
| `max_memory_restart` | `1G` | Auto-restarts if memory exceeds 1 GB |
| `autorestart` | `true` | Restarts on crash |

To scale across all CPUs, set `instances` to `"max"` or a specific number in `ecosystem.config.js`.

The Docker image also configures `pm2-logrotate` to rotate logs at 5 MB, retain one backup, and compress rotated files every three days.

## Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `APP_KEY` (`openssl rand -hex 32`) — used for HMAC token signing
- [ ] Set `SESSION_SECRET` (`openssl rand -hex 32`)
- [ ] Set `TRUST_PROXY` to match your reverse proxy
- [ ] Mount a persistent volume for the SQLite file (or move to Postgres)
- [ ] Run `npm run build && npm run migration:run` on deploy
- [ ] Optionally enable `RATE_LIMIT_ENABLED=true` if your edge doesn't already rate-limit
- [ ] Point liveness probe at `/healthz`, readiness at `/readyz`

## Releases and versioning

The Boring Architecture uses **CalVer** in the form `YYYY.MM.DD` (e.g. `2026.04.07`). When more than one release ships on the same day, a numeric suffix is appended: `2026.04.07.1`, `2026.04.07.2`, …

Releases are produced by [`.github/workflows/release.yml`](./.github/workflows/release.yml):

- Manually triggered from the GitHub Actions tab (`workflow_dispatch`).
- Creates an annotated git tag and a GitHub release with auto-generated notes.

The installer always pulls the **latest released tag** by default. Override with:

```bash
curl -fsSL .../install.sh | bash -s -- --tag 2026.04.07
curl -fsSL .../install.sh | bash -s -- --branch main
```

The cloned project records the version it was scaffolded from in `package.json` under the `tba` field:

```json
{ "tba": { "version": "2026.04.07", "kind": "tag" } }
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes and add tests
4. Run `npm test` to verify everything passes
5. Commit your changes and push to your fork
6. Open a pull request against `main`

## License

MIT — see [LICENSE](./LICENSE).
