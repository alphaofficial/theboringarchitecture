const primitiveRegistry = new Map();
/**
 * Registers runtime state for a named primitive.
 *
 * @template T
 * @param {string} key - Stable primitive identifier.
 * @param {T} runtime - Driver and state associated with the primitive.
 * @returns {T} The registered runtime, for convenient inline initialization.
 */
export function registerPrimitiveRuntime(key, runtime) {
    primitiveRegistry.set(key, runtime);
    return runtime;
}
/**
 * Returns the runtime state for a configured primitive.
 *
 * @template T
 * @param {string} key - Stable primitive identifier.
 * @returns {T} The registered runtime state.
 * @throws {Error} If the primitive has not been configured.
 */
export function getPrimitiveRuntime(key) {
    const runtime = primitiveRegistry.get(key);
    if (!runtime) {
        throw new Error(`Primitive runtime "${key}" is not configured`);
    }
    return runtime;
}
/**
 * Checks whether runtime state exists for a primitive.
 *
 * @param {string} key - Stable primitive identifier.
 * @returns {boolean} Whether the primitive is configured.
 */
export function hasPrimitiveRuntime(key) {
    return primitiveRegistry.has(key);
}
/**
 * Clears one primitive runtime, or the entire registry when no key is supplied.
 *
 * @param {string} [key] - Primitive to clear.
 * @returns {void}
 */
export function clearPrimitiveRuntime(key) {
    if (key === undefined) {
        primitiveRegistry.clear();
        return;
    }
    primitiveRegistry.delete(key);
}
