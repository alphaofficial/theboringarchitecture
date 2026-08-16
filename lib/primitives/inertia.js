import fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import variables from '../../config/variables.js';

const templatePath = path.join(process.cwd(), 'public', 'template.html');
const ssrBundlePath = path.join(process.cwd(), '.ssr', 'ssr.mjs');
const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * @typedef InertiaPage
 * @property {string} component - Page component name.
 * @property {Record<string, string|number|boolean|null|undefined>} props - Shared and page-specific properties.
 * @property {string} url - Original request URL.
 * @property {string} version - Asset version used for client reload checks.
 */

/**
 * @typedef SsrPayload
 * @property {string[]} head - Server-rendered document head elements.
 * @property {string} body - Server-rendered application markup.
 */

/**
 * Escapes text for safe interpolation into the HTML document template.
 *
 * @param {string} value Primary metric value to display.
 * @returns {string} Text with HTML-significant characters replaced by entities.
 */
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

/**
 * Imports the current SSR bundle using its modification time as a cache buster.
 *
 * @returns {Promise<{render: (page: unknown) => Promise<SsrPayload|void>}>} Current server-rendering module.
 * @throws {Error} If the SSR bundle cannot be read or imported.
 */
async function loadSsrModule() {
    const mtime = (await fs.stat(ssrBundlePath)).mtimeMs;
    const url = `${pathToFileURL(ssrBundlePath).href}?v=${mtime}`;
    return import(url);
}

/**
 * Attempts to server-render an Inertia page.
 *
 * Failures are logged and converted to `null` so callers can fall back to the
 * client-rendered application shell.
 *
 * @param {string} page Inertia page payload containing the component name and props.
 * @returns {Promise<SsrPayload|null>} Rendered head/body content, or `null` on failure.
 */
async function renderOnSsr(page) {
    try {
        const mod = await loadSsrModule();
        const result = await mod.render(page);
        return result ?? null;
    }
    catch (err) {
        process.emitWarning(`SSR render failed, falling back to client-only: ${err instanceof Error ? err.message : String(err)}`);
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
 * SSR output is used when enabled and available; otherwise the page payload is
 * safely embedded for client-side hydration.
 * @param {string} page Inertia page payload containing the component name and props.
 * @param title Document title rendered for the Inertia page.
 * @param {import('react').ReactNode} head React elements collected for the document head.
 * @example
 * renderHtml(page, title, head);
 * @returns {Record<string, string|number|boolean|null>} Value produced from the supplied inputs.
 */
export async function renderHtml(page, title, head) {
    const ssr = variables.DISABLE_SSR ? null : await renderOnSsr(page);
    const template = await fs.readFile(templatePath, 'utf-8');
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
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {string} componentName Registered Inertia page component name to render.
 * @param componentProps Serializable props supplied to the selected page component.
 * @param {string} documentMetadata Optional title and head elements for the initial HTML document.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * renderPage(req, res, componentName, componentProps, documentMetadata);
 */
export async function renderPage(req, res, componentName, componentProps = {}, documentMetadata = {}) {
    const page = req.inertia.render(req, res, componentName, componentProps);
    if (res.headersSent) {
        return undefined;
    }
    const html = await renderHtml(page, documentMetadata.title, documentMetadata.head);
    return res.send(html);
}
