import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export interface StorageDriver {
	put(filePath: string, data: Buffer | string): Promise<void>;
	get(filePath: string): Promise<Buffer>;
	delete(filePath: string): Promise<void>;
	url(filePath: string): string;
	exists(filePath: string): Promise<boolean>;
}

interface StorageRuntime {
	driver: StorageDriver;
}

/**
 * Storage primitive for file persistence and URL generation.
 */
export class Storage {
	private static runtimeKey = 'storage';

	static configure(driver: StorageDriver): void {
		if (hasPrimitiveRuntime(Storage.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<StorageRuntime>(Storage.runtimeKey, {
			driver,
		});
	}

	private static runtime(): StorageRuntime {
		return getPrimitiveRuntime<StorageRuntime>(Storage.runtimeKey);
	}

	private static driver(): StorageDriver {
		return Storage.runtime().driver;
	}

	static put(filePath: string, data: Buffer | string): Promise<void> {
		return Storage.driver().put(filePath, data);
	}

	static get(filePath: string): Promise<Buffer> {
		return Storage.driver().get(filePath);
	}

	static delete(filePath: string): Promise<void> {
		return Storage.driver().delete(filePath);
	}

	static url(filePath: string): string {
		return Storage.driver().url(filePath);
	}

	static exists(filePath: string): Promise<boolean> {
		return Storage.driver().exists(filePath);
	}
}
