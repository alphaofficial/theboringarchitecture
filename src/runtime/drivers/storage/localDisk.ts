import fs from 'fs/promises';
import path from 'path';
import type { StorageDriver } from '@/primitives/storage';

export function createLocalDiskDriver(basePath: string, baseUrl: string): StorageDriver {
	const base = path.resolve(basePath);
	const publicBaseUrl = baseUrl.replace(/\/$/, '');

	const resolvePath = (filePath: string): string => {
		const resolved = path.resolve(base, filePath);
		const relative = path.relative(base, resolved);

		if (relative.startsWith('..') || path.isAbsolute(relative)) {
			throw new Error(`Invalid file path: "${filePath}" escapes the storage directory`);
		}

		return resolved;
	};

	return {
		async put(filePath: string, data: Buffer | string): Promise<void> {
			const fullPath = resolvePath(filePath);
			await fs.mkdir(path.dirname(fullPath), { recursive: true });
			await fs.writeFile(fullPath, data);
		},

		get(filePath: string): Promise<Buffer> {
			return fs.readFile(resolvePath(filePath));
		},

		async delete(filePath: string): Promise<void> {
			await fs.unlink(resolvePath(filePath));
		},

		url(filePath: string): string {
			return `${publicBaseUrl}/storage/${filePath}`;
		},

		async exists(filePath: string): Promise<boolean> {
			try {
				await fs.access(resolvePath(filePath));
				return true;
			} catch {
				return false;
			}
		},
	};
}
