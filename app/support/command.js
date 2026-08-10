const commands = new Map();

/** Register a named application command. */
function define(name, { description = '', options = {}, handle }) {
    if (!name || typeof handle !== 'function') throw new Error('Command name and handler are required');
    commands.set(name, { description, options, handle });
}

/** List registered application commands. */
function list() {
    return [...commands.entries()].map(([name, command]) => ({ name, description: command.description, options: command.options }));
}

/** Run a registered application command. */
async function run(name, args = {}, ctx = {}) {
    const command = commands.get(name);
    if (!command) throw new Error(`Unknown command: ${name}`);
    return command.handle({ args, ctx });
}

/** Clear registered commands; used by tests. */
function reset() { commands.clear(); }

/** Application command registry facade. */
export const Command = Object.freeze({ define, list, run, reset });
