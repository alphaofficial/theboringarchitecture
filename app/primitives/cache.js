import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
const configure = (driver) => {
    if (hasPrimitiveRuntime('cache')) {
        return;
    }
    registerPrimitiveRuntime('cache', {
        driver,
    });
};
const get = (key) => {
    return getPrimitiveRuntime('cache').driver.get(key);
};
const set = (key, value, ttlSeconds) => {
    return getPrimitiveRuntime('cache').driver.set(key, value, ttlSeconds);
};
const deleteKey = (key) => {
    return getPrimitiveRuntime('cache').driver.delete(key);
};
const flush = () => {
    return getPrimitiveRuntime('cache').driver.flush();
};
export const Cache = Object.freeze({
    configure,
    get,
    set,
    delete: deleteKey,
    flush,
});
