const commands = new Map();

/**
 * Register a named application command.
 * @param {string} name Command name.
 * @param {{description?: string, options?: Record<string, string|number|boolean|null|undefined>, handle: (...args: never[]) => void}} root0 Command definition.
 * @param {string} [root0.description] Human-readable command description.
 * @param {Record<string, string|number|boolean|string[]|undefined>} [root0.options] Command-line option definitions.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} root0.handle Command handler.
 */
function define(name, { description = '', options = {}, handle }) {
    if (!name || typeof handle !== 'function') throw new Error('Command name and handler are required');
    commands.set(name, { description, options, handle });
}

/**
 * List registered application commands.
 *
 * @returns {Array<{name: string, description: string, options: Record<string, string|number|boolean|null|undefined>}>} Registered command metadata.
 */
function list() {
    return [...commands.entries()].map(([name, command]) => ({ name, description: command.description, options: command.options }));
}

/**
 * Run a registered application command.
 * @param {string} name Command name.
 * @param {Record<string, string|number|boolean>} args Parsed command arguments.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Application context passed to the handler.
 * @returns {Promise<string|number|boolean|null|void>} Handler result.
 */
async function run(name, args = {}, ctx = {}) {
    const command = commands.get(name);
    if (!command) throw new Error(`Unknown command: ${name}`);
    return command.handle({ args, ctx });
}

/** Clear registered commands; used by tests. */
function reset() { commands.clear(); }

/** Application command registry facade. */
export const Command = Object.freeze({ define, list, run, reset });
