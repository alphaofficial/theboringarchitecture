#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
  boring serve
  boring queue:work
  boring schedule:run
  boring test
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
    const c = className(name);
    write(`app/requests/${c}.js`, `export const ${c} = {\n    rules: {\n        // name: 'required|string|max:255',\n    },\n};\n`);
}

function makePolicy(name) {
    const c = className(name);
    write(`app/policies/${c}.js`, `import { Gate } from '../support/authorization.js';\n\nGate.define('${name}.view', (user, subject) => Boolean(user && subject));\n`);
}

if (!command || command === '--help' || command === '-h') usage();
else if (command === 'serve') run('start:dev');
else if (command === 'queue:work') run('work:dev');
else if (command === 'schedule:run') run('work:dev');
else if (command === 'test') run('test');
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
