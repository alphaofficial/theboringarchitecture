import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { describe, expect, it } from 'vitest';

const cli = path.resolve('bin/boring.js');

describe('boring CLI', () => {
    it('prints help', () => {
        const output = execFileSync('node', [cli, '--help'], { encoding: 'utf8' });
        expect(output).toContain('make:controller');
        expect(output).toContain('make:factory');
        expect(output).toContain('make:seeder');
        expect(output).toContain('db:seed');
        expect(output).toContain('queue:work');
    });

    it('generates a controller without overwriting files', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tba-cli-'));
        execFileSync('node', [cli, 'make:controller', 'posts'], { cwd: tmp });
        const controller = fs.readFileSync(path.join(tmp, 'app/controllers/posts.js'), 'utf8');
        expect(controller).toContain("res.render('Posts')");
        expect(() => execFileSync('node', [cli, 'make:controller', 'posts'], { cwd: tmp, stdio: 'pipe' })).toThrow();
    });

    it('generates factory and seeder files', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tba-cli-'));
        execFileSync('node', [cli, 'make:factory', 'Post'], { cwd: tmp });
        execFileSync('node', [cli, 'make:seeder', 'Post'], { cwd: tmp });

        const factory = fs.readFileSync(path.join(tmp, 'db/factories/PostFactory.js'), 'utf8');
        const seeder = fs.readFileSync(path.join(tmp, 'db/seeder/PostSeeder.js'), 'utf8');
        expect(factory).toContain('extends Factory');
        expect(factory).toContain('model = Post');
        expect(seeder).toContain('class PostSeeder');
    });
});
