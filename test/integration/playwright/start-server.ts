import { E2E_APP_URL, E2E_DB_PATH, E2E_PORT } from './env';
import { setupDatabase } from './setup-db';

async function main() {
	process.env.NODE_ENV = 'test';
	process.env.TESTS_RUN = '1';
	process.env.DB_PATH = E2E_DB_PATH;
	process.env.APP_URL = E2E_APP_URL;
	process.env.PORT = String(E2E_PORT);

	await setupDatabase();
	await import('@/index');
}

void main();
