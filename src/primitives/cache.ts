import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export interface CacheDriver {
	get<T = unknown>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
	flush(): Promise<void>;
}

interface CacheRuntime {
	driver: CacheDriver;
}

/**
 * Cache primitive for reading and writing transient values.
 */
export class Cache {
	private static runtimeKey = 'cache';

	static configure(driver: CacheDriver): void {
		if (hasPrimitiveRuntime(Cache.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<CacheRuntime>(Cache.runtimeKey, {
			driver,
		});
	}

	private static runtime(): CacheRuntime {
		return getPrimitiveRuntime<CacheRuntime>(Cache.runtimeKey);
	}

	private static driver(): CacheDriver {
		return Cache.runtime().driver;
	}

	static get<T = unknown>(key: string): Promise<T | undefined> {
		return Cache.driver().get<T>(key);
	}

	static set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		return Cache.driver().set(key, value, ttlSeconds);
	}

	static delete(key: string): Promise<void> {
		return Cache.driver().delete(key);
	}

	static flush(): Promise<void> {
		return Cache.driver().flush();
	}
}
