import BetterQueue from 'better-queue';
import { PinoLogger } from '../../../logger/pinoLogger.js';

/**
 * Starts the driver.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {Map<string, (...args: never[]) => void>} handlers Registered handlers by name.
 * @returns {void} Returns after completing the operation.
 */
const start = (state, handlers) => {
    if (state.queue) {
        return;
    }
    const runtime = state;
    runtime.handlers = handlers;
    /**
     * Runs the handler registered for a queued job.
     *
     * @param {{jobName: string, payload: Record<string, string|number|boolean|null|undefined>}} task Task to process.
     * @param {(error?: Error|null, result?: string|number|boolean|null) => void} cb Completion callback.
     */
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
        process,
        concurrent: 4,
        maxRetries: 3,
        retryDelay: 2000,
        id: 'jobName',
    };
    runtime.queue = new BetterQueue(options);
};
/**
 * Stops the driver.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
const stop = async (state) => {
    const {queue} = state;
    if (!queue) {
        return;
    }
    const runtime = state;
    runtime.queue = null;
    await new Promise(resolve => {
        queue.destroy(() => resolve());
    });
};
/**
 * Dispatches a job to the queue.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} jobName Job name.
 * @param {Record<string, string|number|boolean|null|undefined>} [payload] Event or job payload.
 * @returns {Promise<void>} Resolves after the queue accepts the job or rejects if dispatch fails.
 */
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
 * Jobs dispatched before the driver starts are logged and dropped.
 * @returns {{start: (handlers: Map<string, (...args: never[]) => void>) => void, stop: () => Promise<void>, dispatch: (jobName: string, payload?: object) => Promise<void>}} Queue driver for registering handlers and dispatching process-local jobs.
 * @example
 * const queue = createInMemoryQueueDriver();
 * queue.start(new Map([['sendWelcomeEmail', sendWelcomeEmail]]));
 * await queue.dispatch('sendWelcomeEmail', { userId: user.id });
 * await queue.stop();
 */
export function createInMemoryQueueDriver() {
    const state = { handlers: null, queue: null };
    return {
        start: handlers => start(state, handlers),
        stop: () => stop(state),
        dispatch: (jobName, payload) => dispatch(state, jobName, payload),
    };
}
