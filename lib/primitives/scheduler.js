import { PinoLogger } from '../logger/pinoLogger.js';
import { loadRelativeDirectory } from '../runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../runtime/primitiveRegistry.js';

/** Provides the CronExpression public API for its configured application behavior. */
export const CronExpression = Object.freeze({
    EVERY_SECOND: '* * * * * *',
    EVERY_5_SECONDS: '*/5 * * * * *',
    EVERY_10_SECONDS: '*/10 * * * * *',
    EVERY_30_SECONDS: '*/30 * * * * *',
    EVERY_MINUTE: '0 * * * * *',
    EVERY_5_MINUTES: '0 */5 * * * *',
    EVERY_10_MINUTES: '0 */10 * * * *',
    EVERY_30_MINUTES: '0 */30 * * * *',
    EVERY_HOUR: '0 0 * * * *',
    EVERY_DAY_AT_MIDNIGHT: '0 0 0 * * *',
    EVERY_DAY_AT_1AM: '0 0 1 * * *',
    EVERY_WEEK: '0 0 0 * * 0',
    EVERY_MONTH: '0 0 0 1 * *',
    EVERY_YEAR: '0 0 0 1 1 *',
});
/**
 * Configures the scheduler driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Application context passed to handlers.
 * @returns {void} No return value.
 */
const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('scheduler')) {
        return;
    }
    registerPrimitiveRuntime('scheduler', {
        driver,
        ctx,
    });
};

/**
 * Registers a scheduled task.
 *
 * @param {string} expression Cron expression.
 * @param {(...args: never[]) => Promise<string|number|boolean|null|void>} handler Registered handler.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {void} No return value.
 */
const on = (expression, handler, options) => {
    const runtime = getPrimitiveRuntime('scheduler');
    return runtime.driver.schedule(expression, async () => {
        await handler(runtime.ctx);
    }, options);
};

/**
 * Schedules a task.
 *
 * @param {string} expression Cron expression.
 * @param {(...args: never[]) => Promise<string|number|boolean|null|void>} handler Registered handler.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
  * @returns {void} No return value.
 */
const schedule = (expression, handler, options) => on(expression, handler, options);
/**
 * Starts all scheduled tasks.
 *
 * @returns {void} No return value.
 */
const startAll = () => {
    getPrimitiveRuntime('scheduler').driver.startAll();
};

/**
 * Stops all scheduled tasks.
 *
 * @returns {void} No return value.
 */
const stopAll = () => {
    getPrimitiveRuntime('scheduler').driver.stopAll();
};

/**
 * Returns the registered scheduled tasks.
 *
 * @returns {Record<string, string|number|boolean|null>} Registered values.
 */
const getRegisteredTasks = () => getPrimitiveRuntime('scheduler').driver.getRegisteredTasks();
/**
 * Starts the driver.
 *
 * @returns {Promise<void>} Resolves when finished.
 */
const start = async () => {
    await loadRelativeDirectory('scheduler');
    PinoLogger.info({ scope: 'start', message: 'Starting scheduler...' });
    startAll();
    const registered = getRegisteredTasks();
    PinoLogger.info({
        scope: 'start',
        message: 'Scheduler started', count: registered.length,
        tasks: registered.map(task => task.expression),
    });
};

/**
 * Stops the driver.
 *
 * @returns {void} No return value.
 */
const stop = () => {
    PinoLogger.info({ scope: 'stop', message: 'Stopping scheduler...' });
    stopAll();
    PinoLogger.info({ scope: 'stop', message: 'Scheduler stopped.' });
};

/** Provides the Scheduler public API for its configured application behavior. */
export const Scheduler = Object.freeze({
    CronExpression,
    configure,
    on,
    schedule,
    start,
    startAll,
    stop,
    stopAll,
    getRegisteredTasks,
});
