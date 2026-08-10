import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
/**
 * Registers the cache driver once for the current runtime.
 *
 * @param {{get: Function, set: Function, delete: Function, flush: Function}} driver - Cache driver implementation.
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
 * @returns {Promise<unknown>} Cached value.
 */
const get = (key) => {
    return getPrimitiveRuntime('cache').driver.get(key);
};
/**
 * Stores a value with an optional driver-specific TTL.
 *
 * @param {string} key - Cache key.
 * @param {unknown} value - Value to store.
 * @param {number} [ttlSeconds] - Time to live in seconds.
 * @returns {Promise<void>} Resolves after the value is stored.
 */
const set = (key, value, ttlSeconds) => {
    return getPrimitiveRuntime('cache').driver.set(key, value, ttlSeconds);
};
/**
 * Deletes one cache key.
 *
 * @param {string} key - Cache key.
 * @returns {Promise<void>} Resolves after the key is deleted.
 */
const deleteKey = (key) => {
    return getPrimitiveRuntime('cache').driver.delete(key);
};
/**
 * Clears the configured cache store.
 *
 * @returns {Promise<void>} Resolves after the cache is cleared.
 */
const flush = () => {
    return getPrimitiveRuntime('cache').driver.flush();
};
/**
 * Returns a cached value or computes, stores, and returns it on a miss.
 *
 * @param {string} key - Cache key.
 * @param {number} ttlSeconds - Time to live in seconds.
 * @param {() => unknown|Promise<unknown>} resolver - Callback used to compute a missing value.
 * @returns {Promise<unknown>} Cached or computed value.
 */
const remember = async (key, ttlSeconds, resolver) => {
    const existing = await get(key);
    if (existing !== undefined && existing !== null) return existing;
    const value = await resolver();
    await set(key, value, ttlSeconds);
    return value;
};
export const Cache = Object.freeze({
    configure,
    get,
    set,
    delete: deleteKey,
    flush,
    remember,
});
