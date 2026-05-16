export interface CacheDriver {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
}

interface CacheEntry {
    value: unknown;
    expiresAt: number | null;
}

class MemoryCache implements CacheDriver {
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

const drivers = new Map<string, CacheDriver>();
drivers.set('memory', new MemoryCache());

function getDriver(): CacheDriver {
    const name = process.env.CACHE_DRIVER ?? 'memory';
    const driver = drivers.get(name);
    if (!driver) {
        throw new Error(`Cache driver '${name}' is not registered`);
    }
    return driver;
}

export class Cache {
    static registerDriver(name: string, driver: CacheDriver): void {
        drivers.set(name, driver);
    }

    static get<T = unknown>(key: string): Promise<T | undefined> {
        return getDriver().get<T>(key);
    }

    static set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        return getDriver().set(key, value, ttlSeconds);
    }

    static delete(key: string): Promise<void> {
        return getDriver().delete(key);
    }

    static flush(): Promise<void> {
        return getDriver().flush();
    }
}
