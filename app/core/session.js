import variables from '../../config/variables.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import { Session } from '../models/Session.js';
/**
 * Deletes sessions whose last activity is older than the configured maximum age.
 *
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx - Application context containing the database manager.
 * @returns {Promise<void>} Resolves after expired sessions are deleted and the result is logged.
 */
export async function cleanExpiredSessions(ctx) {
    const maxAgeSeconds = Math.floor(variables.SESSION_MAX_AGE / 1000);
    const cutoff = Math.floor(Date.now() / 1000) - maxAgeSeconds;
    const deleted = await ctx.db.nativeDelete(Session, { last_activity: { $lte: cutoff } });
    if (deleted > 0) {
        PinoLogger.info({
            scope: 'cleanExpiredSessions',
            message: 'Cleaned expired sessions', deleted,
        });
    }
}
