import fs from 'fs/promises';
import path from 'path';
const resolvePath = (state, filePath) => {
    const resolved = path.resolve(state.base, filePath);
    const relative = path.relative(state.base, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Invalid file path: "${filePath}" escapes the storage directory`);
    }
    return resolved;
};
const put = async (state, filePath, data) => {
    const fullPath = resolvePath(state, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, data);
};
const append = async (state, filePath, data) => {
    const fullPath = resolvePath(state, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.appendFile(fullPath, data);
};
const get = (state, filePath) => {
    return fs.readFile(resolvePath(state, filePath));
};
const getText = (state, filePath, encoding = 'utf8') => {
    return fs.readFile(resolvePath(state, filePath), encoding);
};
const deleteFile = async (state, filePath) => {
    try {
        await fs.unlink(resolvePath(state, filePath));
    }
    catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
};
const url = (state, filePath) => {
    return `${state.publicBaseUrl}/storage/${encodeURI(filePath).replace(/%2F/g, '/')}`;
};
const exists = async (state, filePath) => {
    try {
        await fs.access(resolvePath(state, filePath));
        return true;
    }
    catch {
        return false;
    }
};
const list = async (state, directory = '') => {
    const root = resolvePath(state, directory);
    const entries = await fs.readdir(root, { withFileTypes: true });
    return entries.map(entry => ({
        name: entry.name,
        path: path.posix.join(directory.replaceAll(path.sep, '/'), entry.name),
        type: entry.isDirectory() ? 'directory' : 'file',
    })).sort((a, b) => a.path.localeCompare(b.path));
};
const ensureDirectory = (state, directory) => {
    return fs.mkdir(resolvePath(state, directory), { recursive: true });
};
/**
 * Creates a local filesystem storage driver rooted at a single directory.
 *
 * All file operations reject paths that escape `basePath`.
 *
 * @param {string} basePath - Root directory for persisted files.
 * @param {string} baseUrl - Application URL used to build public storage URLs.
 * @returns {{
 *   put: (filePath: string, data: Buffer|string) => Promise<void>,
 *   append: (filePath: string, data: Buffer|string) => Promise<void>,
 *   get: (filePath: string) => Promise<Buffer>,
 *   getText: (filePath: string, encoding?: BufferEncoding) => Promise<string>,
 *   delete: (filePath: string) => Promise<void>,
 *   url: (filePath: string) => string,
 *   exists: (filePath: string) => Promise<boolean>,
 *   list: (directory?: string) => Promise<Array<{name: string, path: string, type: 'file'|'directory'}>>,
 *   ensureDirectory: (directory: string) => Promise<string|undefined>
 * }} A path-confined local disk driver.
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
