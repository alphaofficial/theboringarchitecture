import { InertiaExpressAdapter, renderHtml } from '../primitives/inertia.js';
import variables from '../../config/variables.js';
/**
 * Attaches the Inertia adapter, shared auth props, and HTML renderer to a request.
 *
 * @param {import('express').Request} req - Request to augment with Inertia state.
 * @param {import('express').Response} res - Response whose `render` method is replaced.
 * @param {import('express').NextFunction} next - Continues the middleware chain or receives render failures.
 * @returns {Promise<void>} Resolves after shared props and rendering hooks are installed.
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
            return;
        renderHtml(page, props._title, props._head)
            .then(html => res.send(html))
            .catch(next);
    });
    next();
}
