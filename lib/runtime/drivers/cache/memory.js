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
const set = async (state, key, value, ttlSeconds) => {
    state.store.set(key, {
        value,
        expiresAt: ttlSeconds != null ? Date.now() + ttlSeconds * 1000 : null,
    });
};
const deleteKey = async (state, key) => {
    state.store.delete(key);
};
const flush = async (state) => {
    state.store.clear();
};
/**
 * Creates an isolated in-memory cache with optional per-entry expiration.
 *
 * Expired entries are removed lazily when read.
 *
 * @returns {{
 *   get: (key: string) => Promise<unknown|undefined>,
 *   set: (key: string, value: unknown, ttlSeconds?: number) => Promise<void>,
 *   delete: (key: string) => Promise<void>,
 *   flush: () => Promise<void>
 * }} A cache driver backed by a `Map`.
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
