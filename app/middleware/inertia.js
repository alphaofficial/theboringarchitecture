import { InertiaExpressAdapter, renderHtml } from '../../lib/primitives/inertia.js';
import variables from '../../config/variables.js';

/**
 * Attaches the Inertia adapter, shared auth props, and HTML renderer to a request.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').Next(...args: never[]) => void} next Express callback that continues to the next middleware.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * applyInertia(req, res, next);
 */
export async function applyInertia(req, res, next) {
    const inertia = new InertiaExpressAdapter({ version: '1' });
    const user = await req.user();
    const isAuthenticated = req.is_authenticated();
    inertia.share({
        applicationName: variables.APP_NAME,
        isAuthenticated,
        user: user ? { id: user.id, name: user.name, email: user.email } : null,
    });
    req.inertia = inertia;
    res.render = ((view, props = {}) => {
        const page = inertia.render(req, res, view, props);
        if (res.headersSent)
            {return;}
        renderHtml(page, props._title, props._head)
            .then(html => res.send(html))
            .catch(next);
    });
    next();
}
