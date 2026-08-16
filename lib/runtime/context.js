import { PinoLogger } from "../logger/pinoLogger.js";

/**
 * Shared dependencies available to controllers, jobs, events, and scheduled tasks.
 *
 * @typedef ApplicationContext
 * @property {import('@mikro-orm/core').EntityManager} db - Request-independent entity manager.
 * @property {typeof PinoLogger} logger - Application logger.
 */

/**
 * Creates an isolated application context from an initialized ORM.
 * @param {import('@mikro-orm/core').MikroORM} orm Initialized MikroORM instance used to fork an entity manager.
 * @returns {ApplicationContext} Application dependencies with an isolated entity manager.
 * @example
 * const orm = await MikroORM.init(ormConfig);
 * const ctx = createApplicationCtx(orm);
 * const users = await ctx.db.find(User, {});
 */
export function createApplicationCtx(orm) {
    return {
        db: orm.em.fork(),
        logger: PinoLogger,
    };
}
