import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
const configure = (driver) => {
    if (hasPrimitiveRuntime('storage')) {
        return;
    }
    registerPrimitiveRuntime('storage', {
        driver,
    });
};
const put = (filePath, data) => {
    return getPrimitiveRuntime('storage').driver.put(filePath, data);
};
const get = (filePath) => {
    return getPrimitiveRuntime('storage').driver.get(filePath);
};
const deleteFile = (filePath) => {
    return getPrimitiveRuntime('storage').driver.delete(filePath);
};
const url = (filePath) => {
    return getPrimitiveRuntime('storage').driver.url(filePath);
};
const exists = (filePath) => {
    return getPrimitiveRuntime('storage').driver.exists(filePath);
};
export const Storage = Object.freeze({
    configure,
    put,
    get,
    delete: deleteFile,
    url,
    exists,
});
