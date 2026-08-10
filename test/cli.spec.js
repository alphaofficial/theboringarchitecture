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
        expect(output).toContain('queue:work');
    });

    it('generates a controller without overwriting files', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tba-cli-'));
        execFileSync('node', [cli, 'make:controller', 'posts'], { cwd: tmp });
        const controller = fs.readFileSync(path.join(tmp, 'app/controllers/posts.js'), 'utf8');
        expect(controller).toContain("res.render('Posts')");
        expect(() => execFileSync('node', [cli, 'make:controller', 'posts'], { cwd: tmp, stdio: 'pipe' })).toThrow();
    });
});
