import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Imports every policy module in the convention directory so each file can register its Policy definitions.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [directory] Directory to scan.
 * @returns {Promise<void>} Resolves after every policy module has been imported.
 */
async function load(directory = path.join(process.cwd(), 'app/policies')) {
    const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true }).catch(() => []);
    const paths = entries.filter(entry => entry.isFile() && entry.name.endsWith('.js')).map(entry => {
        const fullPath = path.join(entry.parentPath || directory, entry.name);
        return pathToFileURL(fullPath);
    });
    await Promise.all(paths.map(modulePath => import(modulePath)));
}

/** Convention loader for files under app/policies. */
export const PolicyDiscovery = Object.freeze({ load });
