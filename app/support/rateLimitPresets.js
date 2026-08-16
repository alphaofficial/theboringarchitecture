import { rateLimit } from 'express-rate-limit';

const presets = new Map();

/**
 * Register or replace a named rate-limit preset.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Validation options including database access and custom messages.
 */
function define(name, options) {
    presets.set(name, options);
}

/**
 * Build Express middleware from a named preset.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [overrides] Preset overrides.
 * @returns {import('express').RequestHandler} Configured middleware.
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
