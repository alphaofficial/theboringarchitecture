import { PinoLogger } from "../logger/pinoLogger.js";

/**
 * Shared dependencies available to controllers, jobs, events, and scheduled tasks.
 *
 * @typedef {Object} ApplicationContext
 * @property {import('@mikro-orm/core').EntityManager} db - Request-independent entity manager.
 * @property {typeof PinoLogger} logger - Application logger.
 */

/**
 * Creates an isolated application context from an initialized ORM.
 *
 * @param {import('@mikro-orm/core').MikroORM} orm - Initialized ORM instance.
 * @returns {ApplicationContext} Shared application dependencies.
 */
export function createApplicationCtx(orm) {
    return {
        db: orm.em.fork(),
        logger: PinoLogger,
    };
}
