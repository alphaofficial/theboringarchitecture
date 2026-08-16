import { renderToString } from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/react';

const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
/**
 * Server-renders an Inertia page using the generated page-module registry.
 * @param {string} page Inertia page payload containing the component name and props.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <render />
 */
export function render(page) {
    return createInertiaApp({
        page,
        render: renderToString,
        resolve: (name) => {
            const mod = pages[`./pages/${name}.jsx`];
            if (!mod)
                {throw new Error(`SSR: page not found: ${name}`);}
            return mod.default;
        },
        setup: ({ App, props }) => <App {...props}/>,
    });
}
