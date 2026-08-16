/**
 * Reads a value from the memory cache.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} key Cache key.
 * @returns {Promise<string|number|boolean|null|void>} Stored value.
 */
const get = async (state, key) => {
    const entry = state.store.get(key);
    if (!entry) {
        return undefined;
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        state.store.delete(key);
        return undefined;
    }
    return entry.value;
};

/**
 * Stores a value in the memory cache.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} key Cache key.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {number} ttlSeconds Time to retain the value, in seconds.
 */
const set = async (state, key, value, ttlSeconds) => {
    state.store.set(key, {
        value,
        expiresAt: ttlSeconds != null ? Date.now() + ttlSeconds * 1000 : null,
    });
};

/**
 * Deletes a value from the memory cache.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} key Cache key.
 * @returns {Promise<void>} Resolves when finished.
 */
const deleteKey = async (state, key) => {
    state.store.delete(key);
};

/**
 * Clears the memory cache.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @returns {Promise<void>} Resolves when finished.
 */
const flush = async (state) => {
    state.store.clear();
};

/**
 * Creates an isolated in-memory cache with optional per-entry expiration.
 * Expired entries are removed lazily when read.
 * @returns {{get: (key: string) => Promise<string|number|boolean|null>, set: (key: string, value: string|number|boolean|null, ttlSeconds?: number) => Promise<void>, delete: (key: string) => Promise<void>, flush: () => Promise<void>}} Asynchronous cache driver with optional entry expiration.
 * @example
 * const cache = createMemoryCacheDriver();
 * await cache.set('users:active', users, 60);
 * const activeUsers = await cache.get('users:active');
 */
export function createMemoryCacheDriver() {
    const state = { store: new Map() };
    return {
        get: (key) => get(state, key),
        set: (key, value, ttlSeconds) => set(state, key, value, ttlSeconds),
        delete: (key) => deleteKey(state, key),
        flush: () => flush(state),
    };
}
