import { rateLimit } from 'express-rate-limit';

const presets = new Map();

/**
 * Register or replace a named rate-limit preset.
 *
 * @param {string} name Preset name used by routes.
 * @param {import('express-rate-limit').Options} options express-rate-limit options.
 */
function define(name, options) {
    presets.set(name, options);
}

/**
 * Build Express middleware from a named preset.
 *
 * @param {string} name Registered preset name.
 * @param {Partial<import('express-rate-limit').Options>} [overrides] Per-route overrides.
 * @returns {import('express').RequestHandler}
 */
function middleware(name, overrides = {}) {
    if (!presets.has(name)) throw new Error(`Unknown rate limit preset: ${name}`);
    return rateLimit({ ...presets.get(name), ...overrides });
}

/** Clear presets; used by tests. */
function reset() { presets.clear(); }

/** @returns {string[]} Registered preset names. */
function list() { return [...presets.keys()]; }

define('login', { windowMs: 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });
define('password-reset', { windowMs: 60_000, limit: 3, standardHeaders: true, legacyHeaders: false });
define('sensitive-action', { windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

/** Named rate-limit preset registry and middleware factory. */
export const RateLimitPresets = Object.freeze({ define, middleware, reset, list });
