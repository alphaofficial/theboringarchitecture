export interface Cache {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
}

interface CacheEntry {
    value: unknown;
    expiresAt: number | null;
}

class MemoryCache implements Cache {
    private store = new Map<string, CacheEntry>();

    async get<T = unknown>(key: string): Promise<T | undefined> {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value as T;
    }

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: ttlSeconds != null ? Date.now() + ttlSeconds * 1000 : null,
        });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async flush(): Promise<void> {
        this.store.clear();
    }
}

const drivers = new Map<string, Cache>();
drivers.set('memory', new MemoryCache());

export function registerDriver(name: string, driver: Cache): void {
    drivers.set(name, driver);
}

function getDriver(): Cache {
    const name = process.env.CACHE_DRIVER ?? 'memory';
    const driver = drivers.get(name);
    if (!driver) {
        throw new Error(`Cache driver '${name}' is not registered`);
    }
    return driver;
}

export const cache = {
    get: <T = unknown>(key: string) => getDriver().get<T>(key),
    set: (key: string, value: unknown, ttlSeconds?: number) => getDriver().set(key, value, ttlSeconds),
    delete: (key: string) => getDriver().delete(key),
    flush: () => getDriver().flush(),
    registerDriver,
};
