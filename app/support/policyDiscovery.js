import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Imports every policy module in the convention directory so each file can register its Policy definitions.
 *
 * @param {string} [directory] - Directory containing policy modules.
 * @returns {Promise<void>} Resolves after every policy module has been imported.
 */
async function load(directory = path.join(process.cwd(), 'app/policies')) {
    const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
        const fullPath = path.join(entry.parentPath || directory, entry.name);
        await import(pathToFileURL(fullPath));
    }
}

/** Convention loader for files under app/policies. */
export const PolicyDiscovery = Object.freeze({ load });
