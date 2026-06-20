import { MikroORM } from '@mikro-orm/core';
import variables from '@/config/variables';
import ormConfig from '@/database/orm.config';
import { PinoLogger } from '@/logger/pinoLogger';
import { Session } from '@/models/Session';

export async function cleanExpiredSessions(): Promise<void> {
	const orm = await MikroORM.init(ormConfig);

	try {
		const maxAgeSeconds = Math.floor(variables.SESSION_MAX_AGE / 1000);
		const cutoff = Math.floor(Date.now() / 1000) - maxAgeSeconds;
		const em = orm.em.fork();
		const deleted = await em.nativeDelete(Session, { last_activity: { $lte: cutoff } });

		if (deleted > 0) {
			PinoLogger.info({
				scope: 'cleanExpiredSessions',
				message: 'Cleaned expired sessions', deleted,
			});
		}
	} finally {
		await orm.close(true);
	}
}
