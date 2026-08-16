import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

/**
 * Configures the storage driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @returns {void} No return value.
 */
const configure = (driver) => {
    if (hasPrimitiveRuntime('storage')) {
        return;
    }
    registerPrimitiveRuntime('storage', {
        driver,
    });
};

/**
 * Writes data to a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @param {string|Buffer|Uint8Array} data Payload to persist.
 * @returns {void} No return value.
 */
const put = (filePath, data) => getPrimitiveRuntime('storage').driver.put(filePath, data);
/**
 * Appends data to a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @param {string|Buffer|Uint8Array} data Payload to append.
 * @returns {void} No return value.
 */
const append = (filePath, data) => getPrimitiveRuntime('storage').driver.append(filePath, data);
/**
 * Reads data from a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @returns {Promise<Buffer|unknown>} Stored value.
 */
const get = (filePath) => getPrimitiveRuntime('storage').driver.get(filePath);
/**
 * Reads text from a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @param {BufferEncoding} [encoding] Text encoding.
 * @returns {string} Stored text.
 */
const getText = (filePath, encoding = 'utf8') => getPrimitiveRuntime('storage').driver.getText(filePath, encoding);
/**
 * Deletes a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @returns {void} No return value.
 */
const deleteFile = (filePath) => getPrimitiveRuntime('storage').driver.delete(filePath);
/**
 * Builds a public URL for a storage path.
 *
 * @param {string} filePath Path relative to the storage root.
 * @returns {string} Public storage URL.
 */
const url = (filePath) => getPrimitiveRuntime('storage').driver.url(filePath);
/**
 * Checks whether a storage path exists.
 *
 * @param {string} filePath Path relative to the storage root.
 * @returns {boolean} Whether the path exists.
 */
const exists = (filePath) => getPrimitiveRuntime('storage').driver.exists(filePath);
/**
 * Lists entries in a storage directory.
 *
 * @param {string} [directory] Directory relative to the storage root.
 * @returns {Array<{name: string, path: string, type: string}>} Directory entries.
 */
const list = (directory = '') => getPrimitiveRuntime('storage').driver.list(directory);
/**
 * Creates a storage directory.
 *
 * @param {string} directory Directory relative to the storage root.
 * @returns {void} No return value.
 */
const ensureDirectory = (directory) => getPrimitiveRuntime('storage').driver.ensureDirectory(directory);
/** Provides the Storage public API for its configured application behavior. */
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
