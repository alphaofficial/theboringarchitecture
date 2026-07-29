import crypto from 'crypto';
import { PinoLogger } from '../../../logger/pinoLogger.js';
import { QueueJob } from '../../../../app/models/QueueJob.js';

/**
 * @typedef {Object} SqliteQueueDriverOptions
 * @property {number} [pollIntervalMs=500] - Delay between database polls.
 * @property {number} [maxRetries=3] - Maximum processing attempts per job.
 * @property {number} [retryDelayMs=2000] - Base delay used for linear retry backoff.
 * @property {number} [lockTimeoutMs=300000] - Age at which a running job lock is stale.
 * @property {string} [workerId] - Identifier recorded while this worker owns a job.
 */
const defaultOptions = {
    pollIntervalMs: 500,
    maxRetries: 3,
    retryDelayMs: 2_000,
    lockTimeoutMs: 300_000,
};
const serializeError = (err) => {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    return message.slice(0, 2_000);
};
const claimNextJob = async (db, options) => {
    const now = Date.now();
    const staleLockedAt = now - options.lockTimeoutMs;
    const job = await db.findOne(QueueJob, {
        $or: [
            { status: 'pending', availableAt: { $lte: now } },
            { status: 'running', lockedAt: { $lte: staleLockedAt } },
        ],
    }, { orderBy: { createdAt: 'asc' } });
    if (!job) {
        return null;
    }
    const claimed = await db.nativeUpdate(QueueJob, {
        id: job.id,
        $or: [
            { status: 'pending', availableAt: { $lte: now } },
            { status: 'running', lockedAt: { $lte: staleLockedAt } },
        ],
    }, {
        status: 'running',
        lockedAt: now,
        lockedBy: options.workerId,
        updatedAt: now,
    });
    if (claimed === 0) {
        return null;
    }
    return {
        id: job.id,
        name: job.name,
        payload: job.payload,
        attempts: job.attempts,
    };
};
const markDone = async (db, id) => {
    const now = Date.now();
    await db.nativeUpdate(QueueJob, { id }, {
        status: 'done',
        lockedAt: null,
        lockedBy: null,
        updatedAt: now,
    });
};
const markFailed = async (db, id, attempts, err, options) => {
    const nextAttempts = attempts + 1;
    const now = Date.now();
    const finalFailure = nextAttempts >= options.maxRetries;
    await db.nativeUpdate(QueueJob, { id }, {
        status: finalFailure ? 'failed' : 'pending',
        attempts: nextAttempts,
        availableAt: finalFailure ? now : now + options.retryDelayMs * nextAttempts,
        lockedAt: null,
        lockedBy: null,
        lastError: serializeError(err),
        updatedAt: now,
    });
};
const processJob = async (db, handlers, job, options) => {
    const handler = handlers.get(job.name);
    if (!handler) {
        PinoLogger.warn({ scope: 'sqliteQueueDriver', message: 'No handler registered for job', jobName: job.name });
        await markFailed(db, job.id, job.attempts, new Error(`No handler for job: ${job.name}`), options);
        return;
    }
    try {
        await handler(JSON.parse(job.payload));
        await markDone(db, job.id);
    }
    catch (err) {
        PinoLogger.error({ scope: 'sqliteQueueDriver', message: 'Job failed', jobName: job.name, jobId: job.id, err });
        await markFailed(db, job.id, job.attempts, err, options);
    }
};
const poll = async (db, state, options) => {
    if (state.polling || state.stopped || !state.handlers) {
        return;
    }
    state.polling = true;
    try {
        while (!state.stopped && state.handlers) {
            const job = await claimNextJob(db, options);
            if (!job) {
                break;
            }
            await processJob(db, state.handlers, job, options);
        }
    }
    finally {
        state.polling = false;
    }
};
const schedulePoll = (db, state, options) => {
    state.timer = setInterval(() => {
        void poll(db, state, options);
    }, options.pollIntervalMs);
    state.timer.unref();
    void poll(db, state, options);
};
/**
 * Creates a durable polling queue backed by the application's queue-job table.
 *
 * The driver atomically claims available jobs, retries failures with linear
 * backoff, and recovers locks abandoned by stale workers.
 *
 * @param {import('@mikro-orm/core').EntityManager} db - Entity manager used for queue persistence.
 * @param {SqliteQueueDriverOptions} [driverOptions={}] - Polling, retry, and lock settings.
 * @returns {{
 *   start: (handlers: ReadonlyMap<string, (payload: unknown) => Promise<void>>) => void,
 *   stop: () => Promise<void>,
 *   dispatch: (jobName: string, payload?: unknown) => Promise<void>
 * }} A durable queue driver.
 */
export function createSqliteQueueDriver(db, driverOptions = {}) {
    const options = {
        ...defaultOptions,
        ...driverOptions,
        workerId: driverOptions.workerId ?? `${process.pid}-${crypto.randomUUID()}`,
    };
    const state = {
        handlers: null,
        polling: false,
        stopped: true,
        timer: null,
    };
    return {
        start: handlers => {
            if (state.timer) {
                return;
            }
            state.handlers = handlers;
            state.stopped = false;
            schedulePoll(db, state, options);
        },
        stop: async () => {
            state.stopped = true;
            if (state.timer) {
                clearInterval(state.timer);
                state.timer = null;
            }
            while (state.polling) {
                await new Promise(resolve => setTimeout(resolve, 25));
            }
        },
        dispatch: async (jobName, payload = {}) => {
            const now = Date.now();
            await db.insert(QueueJob, new QueueJob(crypto.randomUUID(), jobName, JSON.stringify(payload), now));
        },
    };
}
