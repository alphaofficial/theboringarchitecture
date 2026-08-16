import variables from '../../config/variables.js';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
/**
 * Resolves the trusted host from the configured public application URL.
 *
 * @param {import('express').Request} req Express request.
 * @returns {string} Hostname and optional port accepted for unsafe requests.
 * @throws {TypeError} If `APP_URL` is not a valid URL.
 */
function expectedHosts(req) {
    return new Set([new URL(variables.APP_URL).host, req.get('Host')].filter(Boolean));
}

/**
 * Rejects cross-origin state-changing requests using Origin/Referer validation.
 * Safe methods and clients that send neither header pass through unchanged.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').NextFunction} next Express callback that continues to the next middleware.
 * @example
 * verifyOrigin(req, res, next);
 * @returns {import('express').Response|void} Response when rejected, otherwise no explicit value.
 */
export function verifyOrigin(req, res, next) {
    if (!UNSAFE_METHODS.has(req.method))
        {return next();}
    const origin = req.get('Origin') || req.get('Referer');
    if (!origin)
        {return next();}
    try {
        const {host} = new URL(origin);
        if (!expectedHosts(req).has(host)) {
            return res.status(403).send('Forbidden');
        }
    }
    catch {
        return res.status(403).send('Forbidden');
    }
    return next();
}
