import * as cron from 'node-cron';
import { PinoLogger } from '../../../logger/pinoLogger.js';

/**
 * Creates and registers a task controlled by the scheduler state.
 * @param {{tasks: Array<object>}} state Scheduler task registry.
 * @param {string} expression Cron expression used to schedule the task.
 * @param {() => void|Promise<void>} handler Work invoked by the cron task.
 * @param {import('node-cron').TaskOptions} [options] Node Cron task options.
 * @returns {{expression: string, handler: () => void|Promise<void>, options: import('node-cron').TaskOptions|undefined, task: import('node-cron').ScheduledTask, start: () => void|Promise<void>, stop: () => void|Promise<void>}} Registered scheduler task.
 */
const createScheduledTask = (state, expression, handler, options) => {
    if (!cron.validate(expression)) {
        throw new Error(`Invalid cron expression: "${expression}"`);
    }
    /**
     * Runs the scheduled task handler.
     *
     * @returns {Promise<void>} Resolves when finished.
     */
    const runTask = async () => {
        try {
            await handler();
        }
        catch (err) {
            PinoLogger.error({ scope: 'nodeCronSchedulerDriver', message: 'Cron task failed', expression, err });
        }
    };
    const task = cron.createTask(expression, runTask, options);
    const scheduledTask = {
        expression,
        handler,
        options,
        task,
        start: () => task.start(),
        stop: () => task.stop(),
    };
    state.tasks.push(scheduledTask);
    return scheduledTask;
};

/**
 * Creates a scheduler that owns and controls a set of Node Cron tasks.
 *
 * @returns {{
 *   schedule: (
 *     expression: string,
 *     handler: () => void|Promise<void>,
 *     options?: import('node-cron').TaskOptions
 *   ) => {
 *     expression: string,
 *     handler: () => void|Promise<void>,
 *     options?: import('node-cron').TaskOptions,
 *     start: () => void|Promise<void>,
 *     stop: () => void|Promise<void>
 *   },
 *   startAll: () => void,
 *   stopAll: () => void,
 *   getRegisteredTasks: () => ReadonlyArray<{expression: string, name?: string}>
 * }} An isolated cron scheduler driver.
 * @example
 * const scheduler = createNodeCronSchedulerDriver();
 * scheduler.schedule('0 * * * *', removeExpiredSessions, { name: 'sessions.cleanup' });
 * scheduler.startAll();
 */
export function createNodeCronSchedulerDriver() {
    const state = { tasks: [] };
    return {
        schedule: (expression, handler, options) => createScheduledTask(state, expression, handler, options),
        startAll: () => {
            state.tasks.forEach(entry => entry.task.start());
        },
        stopAll: () => {
            state.tasks.forEach(entry => entry.task.stop());
        },
        getRegisteredTasks: () => state.tasks.map(task => ({ expression: task.expression, name: task.options?.name })),
    };
}
