import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
const noop = (_req, _res, next) => next();
/**
 * Parses the accepted truthy environment-variable spellings.
 *
 * @param {string|undefined} v - Raw environment value.
 * @returns {boolean} `true` only for `"true"` or `"1"`.
 */
function bool(v) {
    return v === 'true' || v === '1';
}
/**
 * Builds the IP-based rate limiter used by authentication endpoints.
 *
 * @returns {import('express').RequestHandler} A configured limiter, or a no-op middleware when disabled.
 */
export function authRateLimit() {
    if (!bool(process.env.RATE_LIMIT_ENABLED))
        return noop;
    const max = Number(process.env.RATE_LIMIT_AUTH_MAX ?? 5);
    const windowMs = Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? 60_000);
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
        message: { error: 'Too many requests, please try again later.' },
    });
}
/**
 * Builds the feature limiter keyed by user ID, falling back to client IP.
 *
 * @returns {import('express').RequestHandler} A configured limiter, or a no-op middleware when disabled.
 */
export function featureRateLimit() {
    if (!bool(process.env.RATE_LIMIT_ENABLED))
        return noop;
    const max = Number(process.env.RATE_LIMIT_FEATURE_MAX ?? 60);
    const windowMs = Number(process.env.RATE_LIMIT_FEATURE_WINDOW_MS ?? 60_000);
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            const userId = req.session?.userId;
            return userId ? String(userId) : ipKeyGenerator(req.ip ?? '');
        },
        message: { error: 'Too many requests, please try again later.' },
    });
}
