import { renderToString } from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';
const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
/**
 * Server-renders an Inertia page using the generated page-module registry.
 *
 * @param {import('@inertiajs/core').Page} page - Serialized Inertia page payload.
 * @returns {Promise<{head: string[], body: string}>} Inertia SSR head elements and application markup.
 * @throws {Error} If the requested page component is absent from the registry.
 */
export function render(page) {
    return createInertiaApp({
        page,
        render: renderToString,
        resolve: (name) => {
            const mod = pages[`./pages/${name}.jsx`];
            if (!mod)
                throw new Error(`SSR: page not found: ${name}`);
            return mod.default;
        },
        setup: ({ App, props }) => <App {...props}/>,
    });
}
