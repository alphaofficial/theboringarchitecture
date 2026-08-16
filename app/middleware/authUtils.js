import { User } from '../models/User.js';

/**
 * Save authenticated user.
 *
 * @param {import('express').Request} req Express request.
 * @param {import('../models/User.js').User} user Authenticated user.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} resolve Resolves the pending operation.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} reject Rejects the pending operation.
 */
function saveAuthenticatedUser(req, user, resolve, reject) {
    req.session.userId = user.id;
    req.session.save(saveErr => saveErr ? reject(saveErr) : resolve());
}

/**
 * Adds session-backed authentication helpers to an Express request.
 * Authentication regenerates the session to prevent fixation; logout destroys
 * it. User lookup is performed through the request's entity manager.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param _ Unused Express response required by the middleware signature.
 * @param {import('express').Next(...args: never[]) => void} next Express callback that continues to the next middleware.
 * @example
 * injectAuthHelpers(req, _, next);
 */
export function injectAuthHelpers(req, _, next) {
    req.user_id = () => req.session?.userId || null;
    req.user = async () => {
        if (!req.user_id())
            {return null;}
        const em = req.ctx.db;
        return em.findOne(User, { id: req.user_id() }, {
            cache: 300000,
        });
    };
    req.is_authenticated = () => Boolean(req.session?.userId);
    req.is_guest = () => Boolean(!req.session?.userId);
    req.authenticate = (user) => new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
            if (err) {
                reject(err);
                return;
            }
            saveAuthenticatedUser(req, user, resolve, reject);
        });
    });
    req.logout = () => new Promise((resolve, reject) => {
        req.session.destroy(err => err ? reject(err) : resolve());
    });
    next();
}
