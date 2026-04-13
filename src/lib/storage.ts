import fs from 'fs/promises';
import path from 'path';

export interface StorageDriver {
    put(filePath: string, data: Buffer | string): Promise<void>;
    get(filePath: string): Promise<Buffer>;
    delete(filePath: string): Promise<void>;
    url(filePath: string): string;
    exists(filePath: string): Promise<boolean>;
}

class LocalDiskDriver implements StorageDriver {
    private basePath: string;
    private baseUrl: string;

    constructor(basePath: string, baseUrl: string) {
        this.basePath = basePath;
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    private resolve(filePath: string): string {
        const resolved = path.resolve(this.basePath, filePath);
        const base = path.resolve(this.basePath);
        if (!resolved.startsWith(base + path.sep) && resolved !== base) {
            throw new Error(`Invalid file path: "${filePath}" escapes the storage directory`);
        }
        return resolved;
    }

    async put(filePath: string, data: Buffer | string): Promise<void> {
        const fullPath = this.resolve(filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
    }

    async get(filePath: string): Promise<Buffer> {
        return fs.readFile(this.resolve(filePath));
    }

    async delete(filePath: string): Promise<void> {
        await fs.unlink(this.resolve(filePath));
    }

    url(filePath: string): string {
        return `${this.baseUrl}/storage/${filePath}`;
    }

    async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(this.resolve(filePath));
            return true;
        } catch {
            return false;
        }
    }
}

const drivers = new Map<string, StorageDriver>();

function getDriver(): StorageDriver {
    const name = process.env.STORAGE_DRIVER ?? 'local';
    const driver = drivers.get(name);
    if (!driver) {
        throw new Error(`Storage driver '${name}' is not registered`);
    }
    return driver;
}

function initDrivers(): void {
    const storagePath = process.env.STORAGE_PATH ?? 'storage';
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    drivers.set('local', new LocalDiskDriver(storagePath, appUrl));
}

initDrivers();

export class Storage {
    static registerDriver(name: string, driver: StorageDriver): void {
        drivers.set(name, driver);
    }

    static put(filePath: string, data: Buffer | string): Promise<void> {
        return getDriver().put(filePath, data);
    }

    static get(filePath: string): Promise<Buffer> {
        return getDriver().get(filePath);
    }

    static delete(filePath: string): Promise<void> {
        return getDriver().delete(filePath);
    }

    static url(filePath: string): string {
        return getDriver().url(filePath);
    }

    static exists(filePath: string): Promise<boolean> {
        return getDriver().exists(filePath);
    }
}
