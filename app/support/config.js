/**
 * Reads a dot-notated value from a nested object.
 *
 * @param {Record<string, string|number|boolean|null|undefined>} source Configuration source.
 * @param {string} key Registry or configuration key to resolve.
 * @returns {Record<string, string|number|boolean|null>} Config value when present.
 */
function readPath(source, key) {
    return key.split('.').reduce((value, segment) => value?.[segment], source);
}

/**
 * Creates an immutable config reader around a plain values object.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [values={}] Config values.
 * @param {Record<string, string|number|boolean|null|undefined>} values Values value.
 * @returns {{get: (key: string, fallback?: unknown) => unknown, has: (key: string) => boolean, all: () => Record<string, string|number|boolean|null|undefined>}} Config reader.
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
