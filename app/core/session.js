import variables from '../../config/variables.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import { Session } from '../models/Session.js';
/**
 * Deletes sessions whose last activity is older than the configured maximum age.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Runtime context containing the request-scoped database manager and logger.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * cleanExpiredSessions(ctx);
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
