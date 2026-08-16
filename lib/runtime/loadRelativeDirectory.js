import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loadedDirectories = new Set();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extension = path.extname(__filename);
/**
 * Recursively loads modules with the same extension as this module.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} directory Directory to scan.
 * @returns {Promise<void>} Resolves after every matching ES module has been imported.
 */
async function load(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const loads = entries.map(entry => {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            return load(filePath);
        }
        if (!entry.isFile()) {
            return undefined;
        }
        if (!entry.name.endsWith(extension)) {
            return undefined;
        }
        return import(pathToFileURL(filePath).href);
    });
    await Promise.all(loads);
}

/**
 * Loads every module beneath a runtime-relative directory at most once.
 * Missing directories are treated as empty and still marked as loaded.
 * @param {string} name Name used to identify or label the generated value.
 * @example
 * loadRelativeDirectory(name);
 */
export async function loadRelativeDirectory(name) {
    if (loadedDirectories.has(name)) {
        return;
    }
    const directory = path.join(__dirname, '..', name);
    try {
        await fs.access(directory);
    }
    catch {
        loadedDirectories.add(name);
        return;
    }
    await load(directory);
    loadedDirectories.add(name);
}
