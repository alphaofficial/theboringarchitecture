import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { PasswordResetMapper } from '@/database/mappings/PasswordReset.map';
import { SessionMapper } from '@/database/mappings/session.map';
import { UserMapper } from '@/database/mappings/user.map';

export async function setupDatabase() {
	const orm = await MikroORM.init({
		entities: [UserMapper, SessionMapper, PasswordResetMapper],
		dbName: process.env.DB_PATH,
		driver: SqliteDriver,
		allowGlobalContext: true,
	});

	try {
		await orm.getSchemaGenerator().refreshDatabase();
	} finally {
		await orm.close(true);
	}
}
