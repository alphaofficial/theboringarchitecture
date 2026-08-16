const policies = new Map();

/**
 * Resolves a policy registry key from a string, class, or model instance.
 *
 * @param {Record<string, string|number|boolean|null>} subject Authorization subject.
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
 * @param {Record<string, string|number|boolean|null>} subject Authorization subject.
 * @param {Record<string, (...args: never[]) => boolean|Promise<boolean>>} abilities Ability callbacks keyed by action.
 * @returns {void} Returns after registration.
 */
function define(subject, abilities) {
    const key = subjectKey(subject);
    if (!key) throw new Error('Policy subject is required');
    policies.set(key, abilities);
}

/**
 * Returns the registered ability map for a subject.
 *
 * @param {Record<string, string|number|boolean|null>} subject Authorization subject.
 * @returns {Record<string, (...args: never[]) => void>|undefined} Registered abilities.
 */
function get(subject) {
    return policies.get(subjectKey(subject));
}

/**
 * Runs one policy ability and coerces the result to an authorization boolean.
 *
 * @param {import('../models/User.js').User} user Authenticated user whose account data is being processed.
 * @param {(...args: never[]) => boolean|Promise<boolean>} action Authorization action.
 * @param {Record<string, string|number|boolean|null>} subject Authorization subject.
 * @param {Record<string, string|number|boolean>} args Arguments forwarded to the operation.
 * @returns {boolean} Whether the policy allows the action.
 */
function allows(user, action, subject, ...args) {
    const policy = get(subject);
    const handler = policy?.[action];
    if (!handler) return false;
    const handlerArgs = args.length > 0 ? args : [subject];
    return Boolean(handler(user, ...handlerArgs));
}

/**
 * Builds Express middleware that resolves a subject and blocks unauthorized requests.
 *
 * @param {(...args: never[]) => boolean|Promise<boolean>} action Authorization action.
 * @param {Record<string, string|number|boolean|null>|(() => Record<string, string|number|boolean|null>)} subjectResolver Value or callback that resolves the authorization subject.
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
 * @returns {void} Returns after registration.
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
