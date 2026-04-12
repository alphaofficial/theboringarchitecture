import { cache, registerDriver, Cache } from '@/lib/cache';

describe('cache (in-memory driver)', () => {
    beforeEach(async () => {
        await cache.flush();
    });

    it('returns undefined for missing key', async () => {
        const val = await cache.get('missing');
        expect(val).toBeUndefined();
    });

    it('stores and retrieves a value', async () => {
        await cache.set('foo', 'bar');
        expect(await cache.get('foo')).toBe('bar');
    });

    it('stores and retrieves an object', async () => {
        await cache.set('obj', { a: 1 });
        expect(await cache.get('obj')).toEqual({ a: 1 });
    });

    it('deletes a key', async () => {
        await cache.set('key', 'value');
        await cache.delete('key');
        expect(await cache.get('key')).toBeUndefined();
    });

    it('flush clears all keys', async () => {
        await cache.set('a', 1);
        await cache.set('b', 2);
        await cache.flush();
        expect(await cache.get('a')).toBeUndefined();
        expect(await cache.get('b')).toBeUndefined();
    });

    it('expires a key after TTL', async () => {
        await cache.set('ttl', 'expires', 0.05); // 50ms TTL
        expect(await cache.get('ttl')).toBe('expires');
        await new Promise(r => setTimeout(r, 100));
        expect(await cache.get('ttl')).toBeUndefined();
    });

    it('does not expire a key without TTL', async () => {
        await cache.set('forever', 'value');
        await new Promise(r => setTimeout(r, 50));
        expect(await cache.get('forever')).toBe('value');
    });

    it('supports registerDriver with a custom driver', async () => {
        const data = new Map<string, unknown>();
        const customDriver: Cache = {
            get: async (key) => data.get(key) as any,
            set: async (key, value) => { data.set(key, value); },
            delete: async (key) => { data.delete(key); },
            flush: async () => { data.clear(); },
        };
        registerDriver('custom', customDriver);
        const prev = process.env.CACHE_DRIVER;
        try {
            process.env.CACHE_DRIVER = 'custom';
            await cache.set('x', 42);
            expect(await cache.get('x')).toBe(42);
        } finally {
            if (prev === undefined) delete process.env.CACHE_DRIVER;
            else process.env.CACHE_DRIVER = prev;
        }
    });

    it('throws when an unregistered driver is selected', async () => {
        const prev = process.env.CACHE_DRIVER;
        try {
            process.env.CACHE_DRIVER = 'nonexistent';
            expect(() => cache.get('any')).toThrow("Cache driver 'nonexistent' is not registered");
        } finally {
            if (prev === undefined) delete process.env.CACHE_DRIVER;
            else process.env.CACHE_DRIVER = prev;
        }
    });
});
