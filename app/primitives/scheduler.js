import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import { loadRelativeDirectory } from '../../lib/runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
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
const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('scheduler')) {
        return;
    }
    registerPrimitiveRuntime('scheduler', {
        driver,
        ctx,
    });
};
const on = (expression, handler, options) => {
    const runtime = getPrimitiveRuntime('scheduler');
    return runtime.driver.schedule(expression, async () => {
        await handler(runtime.ctx);
    }, options);
};
const schedule = (expression, handler, options) => {
    return on(expression, handler, options);
};
const startAll = () => {
    getPrimitiveRuntime('scheduler').driver.startAll();
};
const stopAll = () => {
    getPrimitiveRuntime('scheduler').driver.stopAll();
};
const getRegisteredTasks = () => {
    return getPrimitiveRuntime('scheduler').driver.getRegisteredTasks();
};
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
const stop = () => {
    PinoLogger.info({ scope: 'stop', message: 'Stopping scheduler...' });
    stopAll();
    PinoLogger.info({ scope: 'stop', message: 'Scheduler stopped.' });
};
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
