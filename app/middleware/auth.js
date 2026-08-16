/**
 * Allows authenticated requests and redirects guests to login.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').NextFunction} next Express callback that continues to the next middleware.
 * @returns {void | import('express').Response} Redirect response for guests, otherwise nothing.
 * @example
 * app.get('/dashboard', auth, DashboardController.index);
 */
export function auth(req, res, next) {
    if (req.is_authenticated()) {
        return next();
    }
    return res.redirect('/login');
}
/**
 * Allows guests and redirects authenticated users to their dashboard.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').NextFunction} next Express callback that continues to the next middleware.
 * @returns {void | import('express').Response} Redirect response for authenticated users, otherwise nothing.
 * @example
 * app.get('/login', guest, AuthController.showLogin);
 */
export function guest(req, res, next) {
    if (req.is_authenticated()) {
        return res.redirect('/home');
    }
    return next();
}
/**
 * Requires an authenticated user whose email address has been verified.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').NextFunction} next Express callback that continues to the next middleware.
 * @returns {Promise<void | import('express').Response>} Redirect response when access is denied, otherwise nothing.
 * @example
 * app.get('/settings', verified, AuthController.showSettings);
 */
export async function verified(req, res, next) {
    if (!req.is_authenticated()) {
        return res.redirect('/login');
    }
    const user = await req.user();
    if (!user?.emailVerifiedAt) {
        return res.redirect('/verify-email');
    }
    return next();
}
