import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const requests = new Map();

/**
 * Registers a named request-rule set.
 *
 * @param {string} name - Request module name.
 * @param {Record<string, string|string[]|Function|object>} rules - Validation rules keyed by field.
 * @returns {void}
 */
function define(name, rules) { requests.set(name, rules); }
/**
 * Returns rules for a named request module.
 *
 * @param {string} name - Request module name.
 * @returns {Record<string, string|string[]|Function|object>|undefined} Registered rules.
 */
function get(name) { return requests.get(name); }
/**
 * Imports request modules and registers exported objects shaped as { name, rules }.
 *
 * @param {string} [directory] - Directory containing request modules.
 * @returns {Promise<void>} Resolves after request modules have been imported.
 */
async function load(directory = path.join(process.cwd(), 'app/requests')) {
    const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
        const fullPath = path.join(entry.parentPath || directory, entry.name);
        const module = await import(pathToFileURL(fullPath));
        for (const exported of Object.values(module)) {
            if (exported?.name && exported?.rules) define(exported.name, exported.rules);
        }
    }
}
/**
 * Clears registered request modules; used by tests and hot reload flows.
 *
 * @returns {void}
 */
function flush() { requests.clear(); }

/** Request-rule module registry and convention loader for app/requests. */
export const RequestModules = Object.freeze({ define, get, load, flush });
