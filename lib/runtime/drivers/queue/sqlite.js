import crypto from 'node:crypto';
import { PinoLogger } from '../../../logger/pinoLogger.js';
import { QueueJob } from '../../../../app/models/QueueJob.js';

/**
 * @typedef {{databasePath?: string, pollInterval?: number, concurrency?: number, maxRetries?: number, retryDelay?: number}} SqliteQueueDriverOptions
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

/**
 * Serializes a queue processing error.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} err Error raised by the operation.
 * @returns {string} Serialized error details.
 */
const serializeError = (err) => {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    return message.slice(0, 2_000);
};

/**
 * Claims the next available queue job.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<{id: string, name: string, payload: string, attempts: number}|null>} Claimed job, or `null` when none is available.
 */
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

/**
 * Marks a queue job as completed.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {string} id Record identifier.
 * @returns {Promise<void>} Resolves when finished.
 */
const markDone = async (db, id) => {
    const now = Date.now();
    await db.nativeUpdate(QueueJob, { id }, {
        status: 'done',
        lockedAt: null,
        lockedBy: null,
        updatedAt: now,
    });
};

/**
 * Records a failed queue job attempt.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {string} id Record identifier.
 * @param {number} attempts Number of completed attempts.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} err Error raised by the operation.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<void>} Resolves when finished.
 */
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

/**
 * Processes a claimed queue job.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {Map<string, (...args: never[]) => void>} handlers Registered handlers by name.
 * @param {{id: string, name: string, payload: string, attempts: number}} job Claimed queue job.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<void>} Resolves when finished.
 */
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

/**
 * Polls for the next available queue job.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<void>} Resolves when finished.
 */
const poll = async (db, state, options) => {
    if (state.polling || state.stopped || !state.handlers) {
        return;
    }
    const runtime = state;
    runtime.polling = true;
    try {
        const job = await claimNextJob(db, options);
        if (job && !runtime.stopped && runtime.handlers) {
            await processJob(db, runtime.handlers, job, options);
            runtime.polling = false;
            await poll(db, runtime, options);
        }
    }
    finally {
        runtime.polling = false;
    }
};

/**
 * Schedules queue polling.
 *
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {void} No return value.
 */
const schedulePoll = (db, state, options) => {
    const runtime = state;
    runtime.timer = setInterval(() => {
        poll(db, runtime, options).catch(err => {
            PinoLogger.error({ scope: 'sqliteQueueDriver', message: 'Queue polling failed', err });
        });
    }, options.pollIntervalMs);
    runtime.timer.unref();
    poll(db, runtime, options).catch(err => {
        PinoLogger.error({ scope: 'sqliteQueueDriver', message: 'Queue polling failed', err });
    });
};

/**
 * Waits for active queue polling to finish.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @returns {Promise<void>} Resolves when finished.
 */
const waitUntilIdle = (state) => {
    if (!state.polling) return Promise.resolve();
    return new Promise(resolve => {
        setTimeout(resolve, 25);
    }).then(() => waitUntilIdle(state));
};

/**
 * Creates a durable polling queue backed by the application's queue-job table.
 * The driver atomically claims available jobs, retries failures with linear
 * backoff, and recovers locks abandoned by stale workers.
 * @param {import('@mikro-orm/core').EntityManager} db Database adapter used to persist and claim queued jobs.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driverOptions Polling, retry, locking, and worker identity overrides.
 * @returns {{start: (handlers: Map<string, (...args: never[]) => void>) => void, stop: () => Promise<void>, dispatch: (jobName: string, payload?: object) => Promise<void>}} Durable queue driver that polls, claims, and persists jobs through the database adapter.
 * @example
 * const queue = createSqliteQueueDriver(db, { pollIntervalMs: 500 });
 * queue.start(new Map([['sendWelcomeEmail', sendWelcomeEmail]]));
 * await queue.dispatch('sendWelcomeEmail', { userId: user.id });
 * await queue.stop();
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
            await waitUntilIdle(state);
        },
        dispatch: async (jobName, payload = {}) => {
            const now = Date.now();
            await db.insert(QueueJob, new QueueJob(crypto.randomUUID(), jobName, JSON.stringify(payload), now));
        },
    };
}
