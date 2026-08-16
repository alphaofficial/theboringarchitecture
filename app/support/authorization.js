const abilities = {};

/**
 * Named-ability authorization registry.
 */
export const Gate = Object.freeze({
    /**
     * Register an ability callback.
     * @param {string} ability Ability name.
     * @param {(user: unknown, subject: unknown) => boolean|Promise<boolean>} callback Authorization check.
     * @returns {void} Nothing.
     */
    define(ability, callback) {
        abilities[ability] = callback;
    },

    /**
     * Check whether a user may perform an ability.
     * @param {string} ability Ability name.
     * @param {import('../models/User.js').User|null} user Authenticated user.
     * @param {Record<string, string|number|boolean|null>} subject Authorization subject.
     * @returns {Promise<boolean>} Whether the ability is allowed.
     */
    async allows(ability, user, subject) {
        const callback = abilities[ability];
        if (!callback) return false;
        return Boolean(await callback(user, subject));
    },

    /** Clear registered abilities; useful for tests. */
    flush() {
        for (const ability of Object.keys(abilities)) delete abilities[ability];
    },
});

/**
 * Express middleware requiring an ability for the current user.
 * @param {string} ability Ability name.
 * @param {unknown|((req: import('express').Request) => unknown|Promise<unknown>)} subjectResolver Subject or request-based resolver.
 * @returns {import('express').RequestHandler} Middleware that enforces the ability.
 * @example
 * can(ability, subjectResolver);
 */
export function can(ability, subjectResolver = undefined) {
    return async (req, res, next) => {
        const user = await req.user();
        const subject = typeof subjectResolver === 'function' ? await subjectResolver(req) : subjectResolver;
        if (await Gate.allows(ability, user, subject)) {
            return next();
        }
        return res.status(403).render ? res.status(403).render('Error', { status: 403, message: 'Forbidden' }) : res.sendStatus(403);
    };
}
