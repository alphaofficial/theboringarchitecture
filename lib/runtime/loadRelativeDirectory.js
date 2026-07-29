import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const loadedDirectories = new Set();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extension = path.extname(__filename);
/**
 * Recursively loads modules with the same extension as this module.
 *
 * @param {string} directory - Absolute directory to traverse.
 * @returns {Promise<void>} Resolves after every matching ES module has been imported.
 */
async function load(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            await load(filePath);
            continue;
        }
        if (!entry.isFile()) {
            continue;
        }
        if (!entry.name.endsWith(extension)) {
            continue;
        }
        await import(pathToFileURL(filePath).href);
    }
}
/**
 * Loads every module beneath a runtime-relative directory at most once.
 *
 * Missing directories are treated as empty and still marked as loaded.
 *
 * @param {string} name - Directory name relative to the runtime parent.
 * @returns {Promise<void>} Resolves after the directory's modules have loaded, or immediately if already processed.
 */
export async function loadRelativeDirectory(name) {
    if (loadedDirectories.has(name)) {
        return;
    }
    const directory = path.join(__dirname, '..', name);
    if (!fs.existsSync(directory)) {
        loadedDirectories.add(name);
        return;
    }
    await load(directory);
    loadedDirectories.add(name);
}
