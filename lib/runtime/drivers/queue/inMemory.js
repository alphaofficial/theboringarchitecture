import BetterQueue from 'better-queue';
import { PinoLogger } from '../../../logger/pinoLogger.js';
const start = (state, handlers) => {
    if (state.queue) {
        return;
    }
    state.handlers = handlers;
    const process = (task, cb) => {
        const t = task;
        const handler = state.handlers?.get(t.jobName);
        if (!handler) {
            PinoLogger.warn({ scope: 'inMemoryQueueDriver', message: 'No handler registered for job', jobName: t.jobName });
            cb(new Error(`No handler for job: ${t.jobName}`));
            return;
        }
        handler(t.payload).then(result => cb(null, result), err => cb(err));
    };
    const options = {
        process: process,
        concurrent: 4,
        maxRetries: 3,
        retryDelay: 2000,
        id: 'jobName',
    };
    state.queue = new BetterQueue(options);
};
const stop = async (state) => {
    const queue = state.queue;
    if (!queue) {
        return;
    }
    state.queue = null;
    await new Promise(resolve => {
        queue.destroy(() => resolve());
    });
};
const dispatch = (state, jobName, payload = {}) => {
    if (!state.queue) {
        PinoLogger.warn({ scope: 'dispatch', message: 'Queue not started — job dropped', jobName });
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        state.queue.push({ jobName, payload }, (err) => {
            if (err) {
                reject(err instanceof Error ? err : new Error(String(err)));
                return;
            }
            resolve();
        });
    });
};
/**
 * Creates an in-process queue with bounded concurrency and retry handling.
 *
 * Jobs dispatched before the driver starts are logged and dropped.
 *
 * @returns {{
 *   start: (handlers: ReadonlyMap<string, (payload: unknown) => Promise<void>>) => void,
 *   stop: () => Promise<void>,
 *   dispatch: (jobName: string, payload?: unknown) => Promise<void>
 * }} A queue driver backed by `better-queue`'s memory store.
 */
export function createInMemoryQueueDriver() {
    const state = { handlers: null, queue: null };
    return {
        start: handlers => start(state, handlers),
        stop: () => stop(state),
        dispatch: (jobName, payload) => dispatch(state, jobName, payload),
    };
}
