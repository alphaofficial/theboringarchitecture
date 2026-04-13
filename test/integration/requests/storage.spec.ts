import { Storage, StorageDriver, S3Driver } from '@/lib/storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { sdkStreamMixin } from '@smithy/util-stream';

describe('storage (in-memory test driver)', () => {
    let prevDriver: string | undefined;
    const store = new Map<string, Buffer>();

    const memoryDriver: StorageDriver = {
        put: async (p, d) => { store.set(p, Buffer.isBuffer(d) ? d : Buffer.from(d)); },
        get: async (p) => {
            const v = store.get(p);
            if (!v) throw new Error(`File not found: ${p}`);
            return v;
        },
        delete: async (p) => { store.delete(p); },
        url: (p) => `/storage/${p}`,
        exists: async (p) => store.has(p),
    };

    beforeAll(() => {
        prevDriver = process.env.STORAGE_DRIVER;
        Storage.registerDriver('test-memory', memoryDriver);
        process.env.STORAGE_DRIVER = 'test-memory';
    });

    afterAll(() => {
        if (prevDriver === undefined) delete process.env.STORAGE_DRIVER;
        else process.env.STORAGE_DRIVER = prevDriver;
    });

    beforeEach(() => {
        store.clear();
    });

    it('returns false for non-existent file', async () => {
        expect(await Storage.exists('missing.txt')).toBe(false);
    });

    it('puts and gets a string file', async () => {
        await Storage.put('hello.txt', 'world');
        const buf = await Storage.get('hello.txt');
        expect(buf.toString()).toBe('world');
    });

    it('puts and gets a Buffer file', async () => {
        const data = Buffer.from([1, 2, 3]);
        await Storage.put('bytes.bin', data);
        const result = await Storage.get('bytes.bin');
        expect(result).toEqual(data);
    });

    it('exists returns true after put', async () => {
        await Storage.put('exists.txt', 'yes');
        expect(await Storage.exists('exists.txt')).toBe(true);
    });

    it('deletes a file', async () => {
        await Storage.put('delete-me.txt', 'bye');
        await Storage.delete('delete-me.txt');
        expect(await Storage.exists('delete-me.txt')).toBe(false);
    });

    it('get throws for missing file', async () => {
        await expect(Storage.get('no-such-file.txt')).rejects.toThrow('File not found');
    });

    it('url returns a URL for the file', () => {
        const u = Storage.url('avatar.png');
        expect(u).toContain('avatar.png');
    });

    it('supports registerDriver with a custom driver', async () => {
        const data = new Map<string, Buffer>();
        const customDriver: StorageDriver = {
            put: async (p, d) => { data.set(p, Buffer.isBuffer(d) ? d : Buffer.from(d)); },
            get: async (p) => {
                const v = data.get(p);
                if (!v) throw new Error(`File not found: ${p}`);
                return v;
            },
            delete: async (p) => { data.delete(p); },
            url: (p) => `https://cdn.example.com/${p}`,
            exists: async (p) => data.has(p),
        };
        Storage.registerDriver('custom-storage', customDriver);
        const prev = process.env.STORAGE_DRIVER;
        try {
            process.env.STORAGE_DRIVER = 'custom-storage';
            await Storage.put('test.txt', 'custom');
            expect((await Storage.get('test.txt')).toString()).toBe('custom');
            expect(Storage.url('test.txt')).toBe('https://cdn.example.com/test.txt');
        } finally {
            process.env.STORAGE_DRIVER = prev;
        }
    });

    it('throws when an unregistered driver is selected', async () => {
        const prev = process.env.STORAGE_DRIVER;
        try {
            process.env.STORAGE_DRIVER = 'nonexistent';
            expect(() => Storage.exists('any')).toThrow("Storage driver 'nonexistent' is not registered");
        } finally {
            process.env.STORAGE_DRIVER = prev;
        }
    });
});

describe('S3Driver', () => {
    let driver: S3Driver;
    let sendMock: jest.Mock;

    beforeEach(() => {
        driver = new S3Driver({
            bucket: 'test-bucket',
            region: 'us-west-2',
            accessKeyId: 'fake-key',
            secretAccessKey: 'fake-secret',
        });
        sendMock = jest.fn();
        // Replace the private S3Client's send method
        (driver as any).client.send = sendMock;
    });

    describe('put', () => {
        it('sends a PutObjectCommand with string data', async () => {
            sendMock.mockResolvedValue({});
            await driver.put('docs/readme.txt', 'hello world');
            expect(sendMock).toHaveBeenCalledTimes(1);
            const command = sendMock.mock.calls[0][0];
            expect(command.constructor.name).toBe('PutObjectCommand');
            expect(command.input).toEqual({
                Bucket: 'test-bucket',
                Key: 'docs/readme.txt',
                Body: Buffer.from('hello world'),
            });
        });

        it('sends a PutObjectCommand with Buffer data', async () => {
            sendMock.mockResolvedValue({});
            const buf = Buffer.from([0x01, 0x02, 0x03]);
            await driver.put('binary.bin', buf);
            const command = sendMock.mock.calls[0][0];
            expect(command.input.Body).toEqual(buf);
        });

        it('propagates S3 errors on put', async () => {
            sendMock.mockRejectedValue(new Error('AccessDenied'));
            await expect(driver.put('file.txt', 'data')).rejects.toThrow('AccessDenied');
        });
    });

    describe('get', () => {
        function mockBodyStream(content: Buffer) {
            const readable = new Readable();
            readable.push(content);
            readable.push(null);
            const sdkStream = sdkStreamMixin(readable);
            return sdkStream;
        }

        it('returns file content as a Buffer', async () => {
            const body = mockBodyStream(Buffer.from('file content'));
            sendMock.mockResolvedValue({ Body: body });
            const result = await driver.get('test.txt');
            expect(result).toEqual(Buffer.from('file content'));
            const command = sendMock.mock.calls[0][0];
            expect(command.constructor.name).toBe('GetObjectCommand');
            expect(command.input).toEqual({
                Bucket: 'test-bucket',
                Key: 'test.txt',
            });
        });

        it('throws when response body is empty', async () => {
            sendMock.mockResolvedValue({ Body: undefined });
            await expect(driver.get('empty.txt')).rejects.toThrow('Empty response body for key: empty.txt');
        });

        it('propagates S3 errors on get', async () => {
            sendMock.mockRejectedValue(new Error('NoSuchKey'));
            await expect(driver.get('missing.txt')).rejects.toThrow('NoSuchKey');
        });
    });

    describe('delete', () => {
        it('sends a DeleteObjectCommand', async () => {
            sendMock.mockResolvedValue({});
            await driver.delete('old-file.txt');
            expect(sendMock).toHaveBeenCalledTimes(1);
            const command = sendMock.mock.calls[0][0];
            expect(command.constructor.name).toBe('DeleteObjectCommand');
            expect(command.input).toEqual({
                Bucket: 'test-bucket',
                Key: 'old-file.txt',
            });
        });

        it('propagates S3 errors on delete', async () => {
            sendMock.mockRejectedValue(new Error('AccessDenied'));
            await expect(driver.delete('file.txt')).rejects.toThrow('AccessDenied');
        });
    });

    describe('exists', () => {
        it('returns true when HeadObject succeeds', async () => {
            sendMock.mockResolvedValue({});
            const result = await driver.exists('present.txt');
            expect(result).toBe(true);
            const command = sendMock.mock.calls[0][0];
            expect(command.constructor.name).toBe('HeadObjectCommand');
            expect(command.input).toEqual({
                Bucket: 'test-bucket',
                Key: 'present.txt',
            });
        });

        it('returns false when HeadObject throws', async () => {
            sendMock.mockRejectedValue(new Error('NotFound'));
            const result = await driver.exists('missing.txt');
            expect(result).toBe(false);
        });
    });

    describe('url', () => {
        it('returns standard S3 URL', () => {
            const url = driver.url('images/photo.jpg');
            expect(url).toBe('https://test-bucket.s3.us-west-2.amazonaws.com/images/photo.jpg');
        });

        it('uses default region us-east-1 when not specified', () => {
            const defaultDriver = new S3Driver({ bucket: 'my-bucket' });
            expect(defaultDriver.url('file.txt')).toBe('https://my-bucket.s3.us-east-1.amazonaws.com/file.txt');
        });

        it('returns custom endpoint URL when endpoint is set', () => {
            const minioDriver = new S3Driver({
                bucket: 'local-bucket',
                endpoint: 'http://localhost:9000',
            });
            expect(minioDriver.url('data.csv')).toBe('http://localhost:9000/local-bucket/data.csv');
        });

        it('strips trailing slash from custom endpoint', () => {
            const minioDriver = new S3Driver({
                bucket: 'local-bucket',
                endpoint: 'http://localhost:9000/',
            });
            expect(minioDriver.url('data.csv')).toBe('http://localhost:9000/local-bucket/data.csv');
        });
    });

    describe('registration via Storage facade', () => {
        let prevDriver: string | undefined;

        beforeEach(() => {
            prevDriver = process.env.STORAGE_DRIVER;
        });

        afterEach(() => {
            if (prevDriver === undefined) delete process.env.STORAGE_DRIVER;
            else process.env.STORAGE_DRIVER = prevDriver;
        });

        it('can be registered and used through the Storage facade', async () => {
            const s3 = new S3Driver({ bucket: 'facade-bucket', region: 'eu-west-1' });
            const mockSend = jest.fn().mockResolvedValue({});
            (s3 as any).client.send = mockSend;

            Storage.registerDriver('s3-test', s3);
            process.env.STORAGE_DRIVER = 's3-test';

            await Storage.put('test.txt', 'hello');
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(Storage.url('test.txt')).toBe('https://facade-bucket.s3.eu-west-1.amazonaws.com/test.txt');
        });
    });
});
