import type { CacheDriver } from '@/primitives/cache';

interface CacheEntry {
	value: unknown;
	expiresAt: number | null;
}

export function createMemoryCacheDriver(): CacheDriver {
	const store = new Map<string, CacheEntry>();

	return {
		async get<T = unknown>(key: string): Promise<T | undefined> {
			const entry = store.get(key);
			if (!entry) {
				return undefined;
			}

			if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
				store.delete(key);
				return undefined;
			}

			return entry.value as T;
		},

		async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
			store.set(key, {
				value,
				expiresAt: ttlSeconds != null ? Date.now() + ttlSeconds * 1000 : null,
			});
		},

		async delete(key: string): Promise<void> {
			store.delete(key);
		},

		async flush(): Promise<void> {
			store.clear();
		},
	};
}
