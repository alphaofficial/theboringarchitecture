import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import variables from '../../config/variables.js';
const templatePath = path.join(process.cwd(), 'public', 'template.html');
const ssrBundlePath = path.join(process.cwd(), 'app', '.ssr', 'ssr.mjs');
const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * @typedef {Object} InertiaPage
 * @property {string} component - Page component name.
 * @property {Record<string, unknown>} props - Shared and page-specific properties.
 * @property {string} url - Original request URL.
 * @property {string} version - Asset version used for client reload checks.
 */

/**
 * @typedef {Object} SsrPayload
 * @property {string[]} head - Server-rendered document head elements.
 * @property {string} body - Server-rendered application markup.
 */

/**
 * Escapes text for safe interpolation into the HTML document template.
 *
 * @param {string} value - Untrusted text or serialized page data.
 * @returns {string} Text with HTML-significant characters replaced by entities.
 */
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}
const importSsrModule = new Function('specifier', 'return import(specifier)');
/**
 * Imports the current SSR bundle using its modification time as a cache buster.
 *
 * @returns {Promise<{render: (page: unknown) => Promise<SsrPayload|void>}>} The current server-rendering module.
 * @throws {Error} If the SSR bundle cannot be read or imported.
 */
async function loadSsrModule() {
    const mtime = fs.statSync(ssrBundlePath).mtimeMs;
    const url = `${pathToFileURL(ssrBundlePath).href}?v=${mtime}`;
    return importSsrModule(url);
}
/**
 * Attempts to server-render an Inertia page.
 *
 * Failures are logged and converted to `null` so callers can fall back to the
 * client-rendered application shell.
 *
 * @param {unknown} page - Inertia page payload.
 * @returns {Promise<SsrPayload|null>} Rendered head/body content, or `null` on failure.
 */
async function renderOnSsr(page) {
    try {
        const mod = await loadSsrModule();
        const result = await mod.render(page);
        return result ?? null;
    }
    catch (err) {
        console.error('[SSR] render failed, falling back to client-only:', err);
        return null;
    }
}
/**
 * Translates Express requests into Inertia protocol responses or page objects.
 *
 * The adapter merges shared props, handles asset-version conflicts, and honors
 * partial-data requests for the active component.
 */
export class InertiaExpressAdapter {
    version;
    sharedData = {};
    constructor(options) {
        this.version = options.version;
    }
    share(keyOrData, value) {
        if (typeof keyOrData === 'string') {
            this.sharedData[keyOrData] = value;
        }
        else {
            this.sharedData = { ...this.sharedData, ...keyOrData };
        }
    }
    render(req, res, component, props = {}) {
        const finalProps = { ...this.sharedData, ...props };
        const isInertiaRequest = req.headers['x-inertia'] === 'true';
        if (isInertiaRequest) {
            const currentVersion = req.headers['x-inertia-version'];
            if (currentVersion !== this.version) {
                return res.status(409).set('X-Inertia-Location', req.originalUrl).end();
            }
            const partialData = req.headers['x-inertia-partial-data'];
            const partialComponent = req.headers['x-inertia-partial-component'];
            let responseProps = finalProps;
            if (partialData && partialComponent === component) {
                const only = partialData.split(',').map(key => key.trim());
                responseProps = {};
                only.forEach(key => {
                    if (key in finalProps) {
                        responseProps[key] = finalProps[key];
                    }
                });
            }
            return res.set({
                Vary: 'Accept',
                'X-Inertia': 'true',
            }).json({
                component,
                props: responseProps,
                url: req.originalUrl,
                version: this.version,
            });
        }
        return {
            component,
            props: finalProps,
            url: req.originalUrl,
            version: this.version,
        };
    }
}
/**
 * Renders a complete HTML document for an Inertia page.
 *
 * SSR output is used when enabled and available; otherwise the page payload is
 * safely embedded for client-side hydration.
 *
 * @param {unknown} page - Inertia page payload.
 * @param {string} [title] - Document title; defaults to the configured application name.
 * @param {string} [head] - Additional trusted markup for the document head.
 * @returns {Promise<string>} Fully populated HTML document.
 */
export async function renderHtml(page, title, head) {
    const ssr = variables.DISABLE_SSR ? null : await renderOnSsr(page);
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
/**
 * Sends an Inertia protocol response or renders its initial HTML document.
 *
 * @param {import('express').Request} req - Request with an attached Inertia adapter.
 * @param {import('express').Response} res - HTTP response.
 * @param {string} componentName - Page component name.
 * @param {Record<string, unknown>} [componentProps={}] - Page-specific properties.
 * @param {{title?: string, head?: string}} [documentMetadata={}] - Initial document metadata.
 * @returns {Promise<import('express').Response|void>} The HTML response, or nothing when the adapter already sent a protocol response.
 */
export async function renderPage(req, res, componentName, componentProps = {}, documentMetadata = {}) {
    const page = req.inertia.render(req, res, componentName, componentProps);
    if (res.headersSent) {
        return;
    }
    const html = await renderHtml(page, documentMetadata.title, documentMetadata.head);
    return res.send(html);
}
