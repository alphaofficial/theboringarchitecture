import fs from 'fs/promises';
import path from 'path';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';

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

export class S3Driver implements StorageDriver {
    private client: S3Client;
    private bucket: string;
    private region: string;
    private endpoint?: string;

    constructor(options: {
        bucket: string;
        region?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        endpoint?: string;
    }) {
        this.bucket = options.bucket;
        this.region = options.region ?? 'us-east-1';
        this.endpoint = options.endpoint;

        const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
            region: this.region,
        };

        if (options.accessKeyId && options.secretAccessKey) {
            clientConfig.credentials = {
                accessKeyId: options.accessKeyId,
                secretAccessKey: options.secretAccessKey,
            };
        }

        if (options.endpoint) {
            clientConfig.endpoint = options.endpoint;
            clientConfig.forcePathStyle = true;
        }

        this.client = new S3Client(clientConfig);
    }

    async put(filePath: string, data: Buffer | string): Promise<void> {
        const body = typeof data === 'string' ? Buffer.from(data) : data;
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: filePath,
                Body: body,
            }),
        );
    }

    async get(filePath: string): Promise<Buffer> {
        const response = await this.client.send(
            new GetObjectCommand({
                Bucket: this.bucket,
                Key: filePath,
            }),
        );
        const stream = response.Body;
        if (!stream) {
            throw new Error(`Empty response body for key: ${filePath}`);
        }
        return Buffer.from(await stream.transformToByteArray());
    }

    async delete(filePath: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: filePath,
            }),
        );
    }

    url(filePath: string): string {
        if (this.endpoint) {
            return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${filePath}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`;
    }

    async exists(filePath: string): Promise<boolean> {
        try {
            await this.client.send(
                new HeadObjectCommand({
                    Bucket: this.bucket,
                    Key: filePath,
                }),
            );
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
