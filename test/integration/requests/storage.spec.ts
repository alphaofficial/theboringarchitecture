import { Storage, StorageDriver } from '@/lib/storage';

describe('storage (in-memory test driver)', () => {
    let prevDriver: string | undefined;
    const store = new Map<string, Buffer>();

    const memoryDriver: StorageDriver = {
        put: async (p, d) => { store.set(p, Buffer.isBuffer(d) ? d : Buffer.from(d)); },
        get: async (p) => {
            const v = store.get(p);
            if (!v) throw new Error(`File not found: ${p}`);
            return v;
        },
        delete: async (p) => { store.delete(p); },
        url: (p) => `/storage/${p}`,
        exists: async (p) => store.has(p),
    };

    beforeAll(() => {
        prevDriver = process.env.STORAGE_DRIVER;
        Storage.registerDriver('test-memory', memoryDriver);
        process.env.STORAGE_DRIVER = 'test-memory';
    });

    afterAll(() => {
        if (prevDriver === undefined) delete process.env.STORAGE_DRIVER;
        else process.env.STORAGE_DRIVER = prevDriver;
    });

    beforeEach(() => {
        store.clear();
    });

    it('returns false for non-existent file', async () => {
        expect(await Storage.exists('missing.txt')).toBe(false);
    });

    it('puts and gets a string file', async () => {
        await Storage.put('hello.txt', 'world');
        const buf = await Storage.get('hello.txt');
        expect(buf.toString()).toBe('world');
    });

    it('puts and gets a Buffer file', async () => {
        const data = Buffer.from([1, 2, 3]);
        await Storage.put('bytes.bin', data);
        const result = await Storage.get('bytes.bin');
        expect(result).toEqual(data);
    });

    it('exists returns true after put', async () => {
        await Storage.put('exists.txt', 'yes');
        expect(await Storage.exists('exists.txt')).toBe(true);
    });

    it('deletes a file', async () => {
        await Storage.put('delete-me.txt', 'bye');
        await Storage.delete('delete-me.txt');
        expect(await Storage.exists('delete-me.txt')).toBe(false);
    });

    it('get throws for missing file', async () => {
        await expect(Storage.get('no-such-file.txt')).rejects.toThrow('File not found');
    });

    it('url returns a URL for the file', () => {
        const u = Storage.url('avatar.png');
        expect(u).toContain('avatar.png');
    });

    it('supports registerDriver with a custom driver', async () => {
        const data = new Map<string, Buffer>();
        const customDriver: StorageDriver = {
            put: async (p, d) => { data.set(p, Buffer.isBuffer(d) ? d : Buffer.from(d)); },
            get: async (p) => {
                const v = data.get(p);
                if (!v) throw new Error(`File not found: ${p}`);
                return v;
            },
            delete: async (p) => { data.delete(p); },
            url: (p) => `https://cdn.example.com/${p}`,
            exists: async (p) => data.has(p),
        };
        Storage.registerDriver('custom-storage', customDriver);
        const prev = process.env.STORAGE_DRIVER;
        try {
            process.env.STORAGE_DRIVER = 'custom-storage';
            await Storage.put('test.txt', 'custom');
            expect((await Storage.get('test.txt')).toString()).toBe('custom');
            expect(Storage.url('test.txt')).toBe('https://cdn.example.com/test.txt');
        } finally {
            process.env.STORAGE_DRIVER = prev;
        }
    });

    it('throws when an unregistered driver is selected', async () => {
        const prev = process.env.STORAGE_DRIVER;
        try {
            process.env.STORAGE_DRIVER = 'nonexistent';
            expect(() => Storage.exists('any')).toThrow("Storage driver 'nonexistent' is not registered");
        } finally {
            process.env.STORAGE_DRIVER = prev;
        }
    });
});
