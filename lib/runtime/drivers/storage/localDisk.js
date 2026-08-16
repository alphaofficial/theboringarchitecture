import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Resolves a path within the storage root.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @returns {string} Resolved absolute path.
 */
const resolvePath = (state, filePath) => {
    const resolved = path.resolve(state.base, filePath);
    const relative = path.relative(state.base, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Invalid file path: "${filePath}" escapes the storage directory`);
    }
    return resolved;
};

/**
 * Writes data to a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @param {string|Buffer|Uint8Array} data Payload to persist.
 * @returns {Promise<void>} Resolves when finished.
 */
const put = async (state, filePath, data) => {
    const fullPath = resolvePath(state, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
};

/**
 * Appends data to a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @param {string|Buffer|Uint8Array} data Payload to append.
 * @returns {Promise<void>} Resolves when finished.
 */
const append = async (state, filePath, data) => {
    const fullPath = resolvePath(state, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.appendFile(fullPath, data);
};

/**
 * Reads data from a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @returns {Promise<Buffer|unknown>} Stored value.
 */
const get = (state, filePath) => fs.readFile(resolvePath(state, filePath));
/**
 * Reads text from a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @param {BufferEncoding} [encoding] Text encoding.
 * @returns {string} Stored text.
 */
const getText = (state, filePath, encoding = 'utf8') => fs.readFile(resolvePath(state, filePath), encoding);
/**
 * Deletes a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @returns {Promise<void>} Resolves when finished.
 */
const deleteFile = async (state, filePath) => {
    try {
        await fs.unlink(resolvePath(state, filePath));
    }
    catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
};

/**
 * Builds a public URL for a local storage path.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @returns {string} Public storage URL.
 */
const url = (state, filePath) => `${state.publicBaseUrl}/storage/${encodeURI(filePath).replace(/%2F/g, '/')}`;
/**
 * Checks whether a local storage path exists.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} filePath Path relative to the storage root.
 * @returns {Promise<boolean>} Whether the path exists.
 */
const exists = async (state, filePath) => {
    try {
        await fs.access(resolvePath(state, filePath));
        return true;
    }
    catch {
        return false;
    }
};

/**
 * Lists entries in a local storage directory.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} [directory] Directory relative to the storage root.
 * @returns {Promise<Array<{name: string, path: string, type: string}>>} Directory entries.
 */
const list = async (state, directory = '') => {
    const root = resolvePath(state, directory);
    const entries = await fs.readdir(root, { withFileTypes: true });
    return entries.map(entry => ({
        name: entry.name,
        path: path.posix.join(directory.replaceAll(path.sep, '/'), entry.name),
        type: entry.isDirectory() ? 'directory' : 'file',
    })).sort((a, b) => a.path.localeCompare(b.path));
};

/**
 * Creates a local storage directory.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} directory Directory relative to the storage root.
 * @returns {void} No return value.
 */
const ensureDirectory = (state, directory) => fs.mkdir(resolvePath(state, directory), { recursive: true });
/**
 * Creates a local filesystem storage driver rooted at a single directory.
 * All file operations reject paths that escape `basePath`.
 * @param {string} basePath Filesystem directory used as the root for stored objects.
 * @param {string} baseUrl Public URL prefix corresponding to the storage root.
 * @returns {{put: (filePath: string, data: string | Buffer) => Promise<void>, append: (filePath: string, data: string | Buffer) => Promise<void>, get: (filePath: string) => Promise<Buffer>, getText: (filePath: string, encoding?: BufferEncoding) => Promise<string>, delete: (filePath: string) => Promise<void>, url: (filePath: string) => string, exists: (filePath: string) => Promise<boolean>, list: (directory: string) => Promise<Array<{name: string, path: string, type: string}>>, ensureDirectory: (directory: string) => Promise<string | undefined>}} Filesystem storage driver scoped to `basePath`.
 * @example
 * const storage = createLocalDiskDriver('./storage', '/files');
 * await storage.put('reports/monthly.json', JSON.stringify(report));
 * const publicUrl = storage.url('reports/monthly.json');
 */
export function createLocalDiskDriver(basePath, baseUrl) {
    const state = {
        base: path.resolve(basePath),
        publicBaseUrl: baseUrl.replace(/\/$/, ''),
    };
    return {
        put: (filePath, data) => put(state, filePath, data),
        append: (filePath, data) => append(state, filePath, data),
        get: (filePath) => get(state, filePath),
        getText: (filePath, encoding) => getText(state, filePath, encoding),
        delete: (filePath) => deleteFile(state, filePath),
        url: (filePath) => url(state, filePath),
        exists: (filePath) => exists(state, filePath),
        list: (directory) => list(state, directory),
        ensureDirectory: (directory) => ensureDirectory(state, directory),
    };
}
