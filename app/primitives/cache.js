import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

/**
 * Registers the cache driver once for the current runtime.
 *
 * @param {{get: (...args: never[]) => void, set: (...args: never[]) => void, delete: (...args: never[]) => void, flush: (...args: never[]) => void}} driver - Cache driver implementation.
 * @returns {void}
 */
const configure = (driver) => {
    if (hasPrimitiveRuntime('cache')) {
        return;
    }
    registerPrimitiveRuntime('cache', {
        driver,
    });
};
/**
 * Reads a value from the configured cache driver.
 *
 * @param {string} key - Cache key.
 * @returns {Promise<string|number|boolean|null|void>} Cached value.
 */
const get = (key) => getPrimitiveRuntime('cache').driver.get(key);
/**
 * Stores a value with an optional driver-specific TTL.
 *
 * @param {string} key - Cache key.
 * @param {string|number|boolean|null} value - Candidate value.
 * @param {number} [ttlSeconds] - Time to live in seconds.
 * @returns {Promise<void>} Resolves after the value is stored.
 */
const set = (key, value, ttlSeconds) => getPrimitiveRuntime('cache').driver.set(key, value, ttlSeconds);
/**
 * Deletes one cache key.
 *
 * @param {string} key - Cache key.
 * @returns {Promise<void>} Resolves after the key is deleted.
 */
const deleteKey = (key) => getPrimitiveRuntime('cache').driver.delete(key);
/**
 * Clears the configured cache store.
 *
 * @returns {Promise<void>} Resolves after the cache is cleared.
 */
const flush = () => getPrimitiveRuntime('cache').driver.flush();
/**
 * Returns a cached value or computes, stores, and returns it on a miss.
 *
 * @param {string} key - Cache key.
 * @param {number} ttlSeconds - Time to live in seconds.
 * @param {() => unknown|Promise<unknown>} resolver - Callback used to compute a missing value.
 * @returns {Promise<string|number|boolean|null|void>} Cached or computed value.
 */
const remember = async (key, ttlSeconds, resolver) => {
    const existing = await get(key);
    if (existing !== undefined && existing !== null) return existing;
    const value = await resolver();
    await set(key, value, ttlSeconds);
    return value;
};
/** Provides the Cache public API for its configured application behavior. */
export const Cache = Object.freeze({
    configure,
    get,
    set,
    delete: deleteKey,
    flush,
    remember,
});
