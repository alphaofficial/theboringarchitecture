import type { StorageDriver } from '@/ports/storage';
import { LocalDiskDriver } from '@/adapters/outbound/storage/local';
import { S3Driver } from '@/adapters/outbound/storage/s3';

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

    const s3Bucket = process.env.AWS_S3_BUCKET;
    if (s3Bucket) {
        drivers.set(
            's3',
            new S3Driver({
                bucket: s3Bucket,
                region: process.env.AWS_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                endpoint: process.env.AWS_S3_ENDPOINT,
            }),
        );
    }
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
