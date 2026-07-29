import { User } from '../models/User.js';
/**
 * Adds session-backed authentication helpers to an Express request.
 *
 * Authentication regenerates the session to prevent fixation; logout destroys
 * it. User lookup is performed through the request's entity manager.
 *
 * @param {import('express').Request} req - Request to augment with auth helpers.
 * @param {import('express').Response} _ - Unused HTTP response.
 * @param {import('express').NextFunction} next - Continues the middleware chain.
 * @returns {void}
 */
export function injectAuthHelpers(req, _, next) {
    req.user_id = () => {
        return req.session?.userId || null;
    };
    req.user = async () => {
        if (!req.user_id())
            return null;
        const em = req.ctx.db;
        return em.findOne(User, { id: req.user_id() }, {
            cache: 300000,
        });
    };
    req.is_authenticated = () => {
        return Boolean(req.session?.userId);
    };
    req.is_guest = () => {
        return Boolean(!req.session?.userId);
    };
    req.authenticate = (user) => {
        return new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err)
                    return reject(err);
                req.session.userId = user.id;
                req.session.save((saveErr) => {
                    if (saveErr)
                        return reject(saveErr);
                    resolve();
                });
            });
        });
    };
    req.logout = () => {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    next();
}
