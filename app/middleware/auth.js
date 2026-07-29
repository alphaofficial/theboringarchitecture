/**
 * Allows authenticated requests and redirects guests to login.
 *
 * @param {import('express').Request} req - Request with injected auth helpers.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Continues the middleware chain.
 * @returns {void|import('express').Response} The redirect response for a guest, otherwise nothing.
 */
export function auth(req, res, next) {
    if (req.is_authenticated()) {
        next();
    }
    else {
        return res.redirect('/login');
    }
}
/**
 * Allows guests and redirects authenticated users to their dashboard.
 *
 * @param {import('express').Request} req - Request with injected auth helpers.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Continues the middleware chain.
 * @returns {void|import('express').Response} The redirect response for an authenticated user, otherwise nothing.
 */
export function guest(req, res, next) {
    if (req.is_authenticated()) {
        return res.redirect('/home');
    }
    else {
        next();
    }
}
/**
 * Requires an authenticated user whose email address has been verified.
 *
 * @param {import('express').Request} req - Request with injected auth helpers.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Continues the middleware chain.
 * @returns {Promise<void|import('express').Response>} A login/verification redirect or completion of the middleware.
 */
export async function verified(req, res, next) {
    if (!req.is_authenticated()) {
        return res.redirect('/login');
    }
    const user = await req.user();
    if (!user?.emailVerifiedAt) {
        return res.redirect('/verify-email');
    }
    next();
}
