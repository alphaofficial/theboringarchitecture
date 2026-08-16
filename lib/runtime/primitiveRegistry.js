const primitiveRegistry = new Map();
/**
 * Registers runtime state for a named primitive.
 * @param {string} key Registry or configuration key to resolve.
 * @param runtime Configured runtime driver stored under the registry key.
 * @returns {Record<string, string|number|boolean|null>} Configured runtime interface.
 * @example
 * registerPrimitiveRuntime(key, runtime);
 */
export function registerPrimitiveRuntime(key, runtime) {
    primitiveRegistry.set(key, runtime);
    return runtime;
}
/**
 * Returns the runtime state for a configured primitive.
 * @param {string} key Registry or configuration key to resolve.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * getPrimitiveRuntime(key);
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
 * @param {string} key Registry or configuration key to resolve.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * hasPrimitiveRuntime(key);
 */
export function hasPrimitiveRuntime(key) {
    return primitiveRegistry.has(key);
}
/**
 * Clears one primitive runtime, or the entire registry when no key is supplied.
 * @param {string} key Registry or configuration key to resolve.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * clearPrimitiveRuntime(key);
 */
export function clearPrimitiveRuntime(key) {
    if (key === undefined) {
        primitiveRegistry.clear();
        return;
    }
    primitiveRegistry.delete(key);
}
