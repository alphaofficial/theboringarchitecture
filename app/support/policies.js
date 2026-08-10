const policies = new Map();

/**
 * Resolves a policy registry key from a string, class, or model instance.
 *
 * @param {string|Function|object} subject - Subject name, constructor, or instance.
 * @returns {string|undefined} Registry key for the subject.
 */
function subjectKey(subject) {
    if (typeof subject === 'string') return subject;
    if (typeof subject === 'function') return subject.name;
    return subject?.constructor?.name;
}

/**
 * Registers abilities for a subject name, class, or instance.
 *
 * @param {string|Function|object} subject - Subject name, constructor, or instance.
 * @param {Record<string, Function>} abilities - Ability callbacks keyed by action name.
 * @returns {void}
 */
function define(subject, abilities) {
    const key = subjectKey(subject);
    if (!key) throw new Error('Policy subject is required');
    policies.set(key, abilities);
}

/**
 * Returns the registered ability map for a subject.
 *
 * @param {string|Function|object} subject - Subject name, constructor, or instance.
 * @returns {Record<string, Function>|undefined} Registered abilities.
 */
function get(subject) {
    return policies.get(subjectKey(subject));
}

/**
 * Runs one policy ability and coerces the result to an authorization boolean.
 *
 * @param {unknown} user - Authenticated user value.
 * @param {string} action - Ability name to run.
 * @param {unknown} subject - Subject being authorized.
 * @param {...unknown} args - Additional ability arguments.
 * @returns {boolean} Whether the policy allows the action.
 */
function allows(user, action, subject, ...args) {
    const policy = get(subject);
    const handler = policy?.[action];
    if (!handler) return false;
    return Boolean(handler(user, subject, ...args));
}

/**
 * Builds Express middleware that resolves a subject and blocks unauthorized requests.
 *
 * @param {string} action - Ability name to run.
 * @param {Function|unknown} subjectResolver - Subject value or callback receiving the request.
 * @returns {import('express').RequestHandler} Authorization middleware.
 */
function can(action, subjectResolver) {
    return async (req, res, next) => {
        const user = typeof req.user === 'function' ? await req.user() : req.user;
        const subject = typeof subjectResolver === 'function' ? await subjectResolver(req) : subjectResolver;
        if (allows(user, action, subject)) return next();
        return res.status(403).json({ error: 'Forbidden' });
    };
}

/**
 * Clears registered policies; used by tests and hot reload flows.
 *
 * @returns {void}
 */
function flush() {
    policies.clear();
}

/** Subject-based policy registry and route middleware helpers. */
export const Policy = Object.freeze({
    define,
    get,
    allows,
    can,
    flush,
});
