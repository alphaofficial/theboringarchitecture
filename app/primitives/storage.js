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
const append = (filePath, data) => {
    return getPrimitiveRuntime('storage').driver.append(filePath, data);
};
const get = (filePath) => {
    return getPrimitiveRuntime('storage').driver.get(filePath);
};
const getText = (filePath, encoding = 'utf8') => {
    return getPrimitiveRuntime('storage').driver.getText(filePath, encoding);
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
const list = (directory = '') => {
    return getPrimitiveRuntime('storage').driver.list(directory);
};
const ensureDirectory = (directory) => {
    return getPrimitiveRuntime('storage').driver.ensureDirectory(directory);
};
export const Storage = Object.freeze({
    configure,
    put,
    append,
    get,
    getText,
    delete: deleteFile,
    url,
    exists,
    list,
    ensureDirectory,
});
