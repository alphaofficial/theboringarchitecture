import { MikroORM } from '@mikro-orm/core';
import { Queue } from '../primitives/queue.js';
import { Scheduler } from '../primitives/scheduler.js';
import ormConfig from '../../config/orm.config.js';
import { bootstrapPrimitives } from './bootstrapPrimitives.js';
import { createApplicationCtx } from './context.js';

let started = false;
/**
 * Initializes and starts the process-wide queue and scheduler runtimes.
 * Subsequent calls are idempotent and return the already configured disposables.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * startWorker();
 */
export async function startWorker() {
    if (started) {
        return [Scheduler, Queue];
    }
    const orm = await MikroORM.init(ormConfig);
    const ctx = createApplicationCtx(orm);
    bootstrapPrimitives(ctx, ["queue", "scheduler"]);
    await Queue.start();
    await Scheduler.start();
    started = true;
    return [Scheduler, Queue];
}
