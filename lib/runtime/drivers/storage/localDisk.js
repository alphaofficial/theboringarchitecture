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
const get = (state, filePath) => {
    return fs.readFile(resolvePath(state, filePath));
};
const deleteFile = async (state, filePath) => {
    await fs.unlink(resolvePath(state, filePath));
};
const url = (state, filePath) => {
    return `${state.publicBaseUrl}/storage/${filePath}`;
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
/**
 * Creates a local filesystem storage driver rooted at a single directory.
 *
 * All file operations reject paths that escape `basePath`.
 *
 * @param {string} basePath - Root directory for persisted files.
 * @param {string} baseUrl - Application URL used to build public storage URLs.
 * @returns {{
 *   put: (filePath: string, data: Buffer|string) => Promise<void>,
 *   get: (filePath: string) => Promise<Buffer>,
 *   delete: (filePath: string) => Promise<void>,
 *   url: (filePath: string) => string,
 *   exists: (filePath: string) => Promise<boolean>
 * }} A path-confined local disk driver.
 */
export function createLocalDiskDriver(basePath, baseUrl) {
    const state = {
        base: path.resolve(basePath),
        publicBaseUrl: baseUrl.replace(/\/$/, ''),
    };
    return {
        put: (filePath, data) => put(state, filePath, data),
        get: (filePath) => get(state, filePath),
        delete: (filePath) => deleteFile(state, filePath),
        url: (filePath) => url(state, filePath),
        exists: (filePath) => exists(state, filePath),
    };
}
