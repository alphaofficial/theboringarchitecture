/**
 * Reads a dot-notated value from a nested object.
 *
 * @param {Record<string, unknown>} source - Source object.
 * @param {string} key - Dot-notated config key.
 * @returns {unknown} Config value when present.
 */
function readPath(source, key) {
    return key.split('.').reduce((value, segment) => value?.[segment], source);
}

/**
 * Creates an immutable config reader around a plain values object.
 *
 * @param {Record<string, unknown>} [values={}] - Config values.
 * @returns {{get: (key: string, fallback?: unknown) => unknown, has: (key: string) => boolean, all: () => Record<string, unknown>}} Config reader.
 */
function create(values = {}) {
    return Object.freeze({
        get(key, fallback = undefined) {
            const value = readPath(values, key);
            return value === undefined ? fallback : value;
        },
        has(key) {
            return readPath(values, key) !== undefined;
        },
        all() { return values; },
    });
}

/** Nested configuration object factory. */
export const Config = Object.freeze({ create });
