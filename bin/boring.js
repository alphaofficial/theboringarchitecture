#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { MikroORM } from '@mikro-orm/core';
import ormConfig from '../config/orm.config.js';
import { QueueJob } from '../app/models/QueueJob.js';

const root = process.cwd();
const [command, rawName] = process.argv.slice(2);

/**
 * Prints command usage information.
 *
 */
function usage() {
    console.log(`The Boring Architecture CLI

Usage:
  boring make:controller Name
  boring make:model Name
  boring make:job Name
  boring make:event Name
  boring make:mail Name
  boring make:middleware Name
  boring make:request Name
  boring make:policy Name
  boring make:factory Name
  boring make:seeder Name
  boring db:seed          Run database seeders
  boring queue:work       Start the queue and scheduler worker
  boring queue:failed     List failed jobs
  boring queue:retry ID   Move one failed job back to pending; use "all" for every failed job
  boring queue:forget ID  Delete one failed job; use "all" to clear every failed job
  boring schedule:run     Start the worker process that loads scheduled tasks
`);
}

/**
 * Validates and normalizes a generator name.
 *
 * @param {string} name Registered name.
 * @returns {string} Sanitized generator name.
 */
function ensureName(name) {
    if (!name) {
        console.error(`Missing name for ${command}`);
        process.exit(1);
    }
    return name.replace(/[^A-Za-z0-9_/.-]/g, '');
}

/**
 * Converts a path-like name to PascalCase.
 *
 * @param {string} name Registered name.
 * @returns {string} PascalCase name derived from the final path segment.
 */
function className(name) {
    return path.basename(name).replace(/(^|[-_/.])(\w)/g, (_, __, character) => character.toUpperCase());
}

/**
 * Writes a generated file without overwriting existing content.
 *
 * @param {string} relativePath Path relative to the project root.
 * @param {string} content Source text to write.
 */
function write(relativePath, content) {
    const target = path.join(root, relativePath);
    if (fs.existsSync(target)) {
        console.error(`Refusing to overwrite ${relativePath}`);
        process.exit(1);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content.trimStart());
    console.log(`created ${relativePath}`);
}

/**
 * Runs the selected CLI command.
 *
 * @param {string} script Shell script path.
 */
function run(script) {
    const child = spawn(process.execPath, [path.resolve('node_modules/npm/bin/npm-cli.js'), 'run', script], { stdio: 'inherit', shell: false });
    child.on('exit', code => process.exit(code ?? 1));
}

/**
 * Generates a controller module.
 *
 * @param {string} name Registered name.
 */
function makeController(name) {
    const controllerName = className(name);
    write(`app/controllers/${name}.js`, `/**\n * Renders the generated controller page.\n *\n * @param {import('express').Request} req Express request.\n * @param {import('express').Response} res Express response.\n * @returns {Promise<import('express').Response>} Rendered page response.\n */\nexport async function index(req, res) {\n    return res.render('${controllerName}');\n}\n`);
}

/**
 * Generates a model module.
 *
 * @param {string} name Registered name.
 */
function makeModel(name) {
    const modelName = className(name);
    write(`app/models/${modelName}.js`, `export class ${modelName} {\n    id;\n    createdAt = new Date();\n    updatedAt = new Date();\n\n    constructor(id) {\n        this.id = id;\n    }\n}\n`);
}

/**
 * Generates a job module.
 *
 * @param {string} name Registered name.
 */
function makeJob(name) {
    const jobName = className(name);
    write(`app/jobs/${name}.js`, `import { Queue } from '../../lib/primitives/queue.js';\n\nQueue.on('${name}', async (_ctx, payload) => {\n    // Handle ${jobName}.\n    console.log('${name}', payload);\n});\n`);
}

/**
 * Generates an event module.
 *
 * @param {string} name Registered name.
 */
function makeEvent(name) {
    write(`app/events/${name}.js`, `import { Bus } from '../../lib/primitives/bus.js';\n\nBus.on('${name}', async (payload) => {\n    console.log('${name}', payload);\n});\n`);
}

/**
 * Generates a mail template module.
 *
 * @param {string} name Registered name.
 */
function makeMail(name) {
    const templateName = className(name);
    write(`app/mail/templates/${templateName}.js`, `export function ${templateName}({ name = 'there' } = {}) {\n    return \`<p>Hello \${name},</p>\`;\n}\n`);
}

/**
 * Generates a middleware module.
 *
 * @param {string} name Registered name.
 */
function makeMiddleware(name) {
    write(`app/middleware/${name}.js`, `export function ${name}(req, res, next) {\n    next();\n}\n`);
}

/**
 * Generates a request definition.
 *
 * @param {string} name Registered name.
 */
function makeRequest(name) {
    const requestName = className(name);
    write(`app/requests/${requestName}.js`, `export const ${requestName} = {\n    name: '${requestName}',\n    rules: {\n        // name: 'required|string|max:255',\n    },\n};\n`);
}

/**
 * Generates a policy definition.
 *
 * @param {string} name Registered name.
 */
function makePolicy(name) {
    const policyName = className(name);
    const subjectName = policyName.replace(/Policy$/, '') || policyName;
    write(`app/policies/${policyName}.js`, `import { Policy } from '../support/policies.js';\n\nPolicy.define('${subjectName}', {\n    view: (user, subject) => Boolean(user && subject),\n});\n`);
}

/**
 * Generates a model factory.
 *
 * @param {string} name Registered name.
 */
function makeFactory(name) {
    const modelName = className(name).replace(/Factory$/, '');
    const factoryName = `${modelName}Factory`;
    write(`db/factories/${factoryName}.js`, `import { Factory } from '@mikro-orm/seeder';\nimport { ${modelName} } from '../../app/models/${modelName}.js';\n\nexport class ${factoryName} extends Factory {\n    model = ${modelName};\n\n    definition(input = {}) {\n        return { ...input };\n    }\n}\n`);
}

/**
 * Generates a database seeder.
 *
 * @param {string} name Registered name.
 */
function makeSeeder(name) {
    const modelName = className(name).replace(/Seeder$/, '');
    const seederName = `${modelName}Seeder`;
    write(`db/seeder/${seederName}.js`, `import { Seeder } from '@mikro-orm/seeder';\n\nexport class ${seederName} extends Seeder {\n    async run(db) {\n        // Seed records with db.persistAndFlush(...).\n    }\n}\n`);
}

/**
 * Runs a callback with an initialized entity manager.
 *
 * @param {(...args: never[]) => void} callback Operation to execute.
 */
async function withOrm(callback) {
    const orm = await MikroORM.init(ormConfig);
    try {
        await callback(orm.em.fork());
    }
    finally {
        await orm.close(true);
    }
}

/**
 * Lists recently failed queue jobs.
 *
 * @returns {Promise<void>} Resolves when the operation completes.
 */
async function queueFailed() {
    await withOrm(async db => {
        const jobs = await db.find(QueueJob, { status: 'failed' }, { orderBy: { updatedAt: 'desc' }, limit: 50 });
        if (jobs.length === 0) {
            console.log('No failed jobs.');
            return;
        }
        for (const job of jobs) {
            console.log(`${job.id}\t${job.name}\tattempts=${job.attempts}\t${job.lastError || ''}`);
        }
    });
}

/**
 * Retries a failed queue job.
 *
 * @param {string} id Record identifier.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
async function queueRetry(id) {
    if (!id) {
        console.error('Missing failed job id; use queue:retry ID or queue:retry all');
        process.exit(1);
    }
    await withOrm(async db => {
        const where = id === 'all' ? { status: 'failed' } : { id, status: 'failed' };
        const count = await db.nativeUpdate(QueueJob, where, {
            status: 'pending',
            attempts: 0,
            availableAt: Date.now(),
            lockedAt: null,
            lockedBy: null,
            lastError: null,
            updatedAt: Date.now(),
        });
        console.log(`Retried ${count} failed job${count === 1 ? '' : 's'}.`);
    });
}

/**
 * Deletes a failed queue job.
 *
 * @param {string} id Record identifier.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
async function queueForget(id) {
    if (!id) {
        console.error('Missing failed job id; use queue:forget ID or queue:forget all');
        process.exit(1);
    }
    await withOrm(async db => {
        const where = id === 'all' ? { status: 'failed' } : { id, status: 'failed' };
        const count = await db.nativeDelete(QueueJob, where);
        console.log(`Deleted ${count} failed job${count === 1 ? '' : 's'}.`);
    });
}

if (!command || command === '--help' || command === '-h') usage();
else if (command === 'db:seed') run('db:seed');
else if (command === 'queue:work') run('work:dev');
else if (command === 'queue:failed') await queueFailed();
else if (command === 'queue:retry') await queueRetry(rawName);
else if (command === 'queue:forget') await queueForget(rawName);
else if (command === 'schedule:run') run('work:dev');
else if (command === 'make:controller') makeController(ensureName(rawName));
else if (command === 'make:model') makeModel(ensureName(rawName));
else if (command === 'make:job') makeJob(ensureName(rawName));
else if (command === 'make:event') makeEvent(ensureName(rawName));
else if (command === 'make:mail') makeMail(ensureName(rawName));
else if (command === 'make:middleware') makeMiddleware(ensureName(rawName));
else if (command === 'make:request') makeRequest(ensureName(rawName));
else if (command === 'make:policy') makePolicy(ensureName(rawName));
else if (command === 'make:factory') makeFactory(ensureName(rawName));
else if (command === 'make:seeder') makeSeeder(ensureName(rawName));
else {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
}
