import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { Storage } from '../app/primitives/storage.js';
import { clearPrimitiveRuntime } from '../lib/runtime/primitiveRegistry.js';
import { createLocalDiskDriver } from '../lib/runtime/drivers/storage/localDisk.js';

afterEach(() => clearPrimitiveRuntime('storage'));

describe('Storage ergonomics', () => {
    it('reads/writes files, appends text, lists files, and ignores missing deletes', async () => {
        const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'tba-storage-'));
        Storage.configure(createLocalDiskDriver(root, 'https://example.test'));

        await Storage.put('exports/report.json', `${JSON.stringify({ ok: true })}\n`);
        await Storage.append('logs/app.log', 'first\n');
        await Storage.append('logs/app.log', 'second\n');

        await expect(Storage.getText('exports/report.json')).resolves.toBe('{"ok":true}\n');
        await expect(Storage.getText('logs/app.log')).resolves.toBe('first\nsecond\n');
        await expect(Storage.list('exports')).resolves.toEqual([{ name: 'report.json', path: 'exports/report.json', type: 'file' }]);
        expect(Storage.url('exports/monthly report.json')).toBe('https://example.test/storage/exports/monthly%20report.json');

        await expect(Storage.delete('missing.txt')).resolves.toBeUndefined();
        await expect(Storage.put('../escape.txt', 'nope')).rejects.toThrow('escapes the storage directory');
    });
});
