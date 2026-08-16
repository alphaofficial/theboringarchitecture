import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const requests = new Map();

/**
 * Registers a named request-rule set.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @param {Record<string, string|string[]>} rules Validation rules keyed by input field.
 * @returns {void} Returns after registration.
 */
function define(name, rules) { requests.set(name, rules); }

/**
 * Returns rules for a named request module.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @returns {Record<string, string|string[]|(...args: never[]) => void|object>|undefined} Registered rules.
 */
function get(name) { return requests.get(name); }

/**
 * Imports request modules and registers exported objects shaped as { name, rules }.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [directory] Directory to scan.
 * @returns {Promise<void>} Resolves after request modules have been imported.
 */
async function load(directory = path.join(process.cwd(), 'app/requests')) {
    const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true }).catch(() => []);
    const paths = entries.filter(entry => entry.isFile() && entry.name.endsWith('.js')).map(entry => {
        const fullPath = path.join(entry.parentPath || directory, entry.name);
        return pathToFileURL(fullPath);
    });
    const modules = await Promise.all(paths.map(modulePath => import(modulePath)));
    for (const module of modules) {
        for (const exported of Object.values(module)) {
            if (exported?.name && exported?.rules) define(exported.name, exported.rules);
        }
    }
}

/**
 * Clears registered request modules; used by tests and hot reload flows.
 *
 * @returns {void} Returns after registration.
 */
function flush() { requests.clear(); }

/** Request-rule module registry and convention loader for app/requests. */
export const RequestModules = Object.freeze({ define, get, load, flush });
