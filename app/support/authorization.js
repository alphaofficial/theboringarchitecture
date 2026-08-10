const abilities = new Map();

/**
 * Laravel Gate-inspired authorization registry.
 */
export const Gate = Object.freeze({
    /**
     * Register an ability callback.
     * @param {string} ability
     * @param {(user: unknown, subject?: unknown) => boolean|Promise<boolean>} callback
     */
    define(ability, callback) {
        abilities.set(ability, callback);
    },

    /**
     * Check whether a user may perform an ability.
     * @param {string} ability
     * @param {unknown} user
     * @param {unknown} subject
     */
    async allows(ability, user, subject) {
        const callback = abilities.get(ability);
        if (!callback) return false;
        return Boolean(await callback(user, subject));
    },

    /** Clear registered abilities; useful for tests. */
    flush() {
        abilities.clear();
    },
});

/**
 * Express middleware requiring an ability for the current user.
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
