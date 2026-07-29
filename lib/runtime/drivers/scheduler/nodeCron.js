import * as cron from 'node-cron';
import { PinoLogger } from '../../../logger/pinoLogger.js';
const createScheduledTask = (state, expression, handler, options) => {
    if (!cron.validate(expression)) {
        throw new Error(`Invalid cron expression: "${expression}"`);
    }
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
