import fs from 'node:fs/promises';
import path from 'node:path';
import { E2E_APP_URL, E2E_DB_PATH } from './env';

export default async function globalSetup() {
	process.env.NODE_ENV = 'test';
	process.env.TESTS_RUN = '1';
	process.env.DB_PATH = E2E_DB_PATH;
	process.env.APP_URL = E2E_APP_URL;

	const dbPath = path.resolve(process.cwd(), E2E_DB_PATH);
	await fs.rm(dbPath, { force: true });
	await fs.rm(`${dbPath}-shm`, { force: true });
	await fs.rm(`${dbPath}-wal`, { force: true });
}
