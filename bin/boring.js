#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { MikroORM } from '@mikro-orm/core';
import ormConfig from '../config/orm.config.js';
import { QueueJob } from '../app/models/QueueJob.js';

const root = process.cwd();
const [command, rawName] = process.argv.slice(2);

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
  boring queue:work       Start the queue and scheduler worker
  boring queue:failed     List failed jobs
  boring queue:retry ID   Move one failed job back to pending; use "all" for every failed job
  boring queue:forget ID  Delete one failed job; use "all" to clear every failed job
  boring schedule:run     Start the worker process that loads scheduled tasks
`);
}

function ensureName(name) {
    if (!name) {
        console.error(`Missing name for ${command}`);
        process.exit(1);
    }
    return name.replace(/[^A-Za-z0-9_/.-]/g, '');
}

function className(name) {
    return path.basename(name).replace(/(^|[-_/.])(\w)/g, (_, __, c) => c.toUpperCase());
}

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

function run(script) {
    const child = spawn('npm', ['run', script], { stdio: 'inherit', shell: false });
    child.on('exit', code => process.exit(code ?? 1));
}

function makeController(name) {
    const c = className(name);
    write(`app/controllers/${name}.js`, `/** @param {import('express').Request} req @param {import('express').Response} res */\nexport async function index(req, res) {\n    return res.render('${c}');\n}\n`);
}

function makeModel(name) {
    const c = className(name);
    write(`app/models/${c}.js`, `export class ${c} {\n    id;\n    createdAt = new Date();\n    updatedAt = new Date();\n\n    constructor(id) {\n        this.id = id;\n    }\n}\n`);
}

function makeJob(name) {
    const c = className(name);
    write(`app/jobs/${name}.js`, `import { Queue } from '../primitives/queue.js';\n\nQueue.on('${name}', async (_ctx, payload) => {\n    // Handle ${c}.\n    console.log('${name}', payload);\n});\n`);
}

function makeEvent(name) {
    write(`app/events/${name}.js`, `import { Bus } from '../primitives/bus.js';\n\nBus.on('${name}', async (payload) => {\n    console.log('${name}', payload);\n});\n`);
}

function makeMail(name) {
    const c = className(name);
    write(`app/mail/templates/${c}.js`, `export function ${c}({ name = 'there' } = {}) {\n    return \`<p>Hello \${name},</p>\`;\n}\n`);
}

function makeMiddleware(name) {
    write(`app/middleware/${name}.js`, `export function ${name}(req, res, next) {\n    next();\n}\n`);
}

function makeRequest(name) {
    const requestName = className(name);
    write(`app/requests/${requestName}.js`, `export const ${requestName} = {\n    name: '${requestName}',\n    rules: {\n        // name: 'required|string|max:255',\n    },\n};\n`);
}

function makePolicy(name) {
    const policyName = className(name);
    const subjectName = policyName.replace(/Policy$/, '') || policyName;
    write(`app/policies/${policyName}.js`, `import { Policy } from '../support/policies.js';\n\nPolicy.define('${subjectName}', {\n    view: (user, subject) => Boolean(user && subject),\n});\n`);
}

async function withOrm(callback) {
    const orm = await MikroORM.init(ormConfig);
    try {
        await callback(orm.em.fork());
    }
    finally {
        await orm.close(true);
    }
}

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
else {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
}
