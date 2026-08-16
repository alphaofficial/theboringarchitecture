import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const cli = path.resolve('bin/boring.js');
const executeFile = promisify(execFile);

describe('boring CLI', () => {
    it('prints help', async () => {
        const { stdout: output } = await executeFile(process.execPath, [cli, '--help'], { encoding: 'utf8' });
        expect(output).toContain('make:controller');
        expect(output).toContain('make:factory');
        expect(output).toContain('make:seeder');
        expect(output).toContain('db:seed');
        expect(output).toContain('queue:work');
    });

    it('generates a controller without overwriting files', async () => {
        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'tba-cli-'));
        await executeFile(process.execPath, [cli, 'make:controller', 'posts'], { cwd: tmp });
        const controller = await fs.promises.readFile(path.join(tmp, 'app/controllers/posts.js'), 'utf8');
        expect(controller).toContain("res.render('Posts')");
        await expect(executeFile(process.execPath, [cli, 'make:controller', 'posts'], { cwd: tmp })).rejects.toThrow();
    });

    it('generates factory and seeder files', async () => {
        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'tba-cli-'));
        await executeFile(process.execPath, [cli, 'make:factory', 'Post'], { cwd: tmp });
        await executeFile(process.execPath, [cli, 'make:seeder', 'Post'], { cwd: tmp });

        const factory = await fs.promises.readFile(path.join(tmp, 'db/factories/PostFactory.js'), 'utf8');
        const seeder = await fs.promises.readFile(path.join(tmp, 'db/seeder/PostSeeder.js'), 'utf8');
        expect(factory).toContain('extends Factory');
        expect(factory).toContain('model = Post');
        expect(seeder).toContain('class PostSeeder');
    });
});
