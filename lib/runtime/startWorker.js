import { Queue } from '../../app/primitives/queue.js';
import { Scheduler } from '../../app/primitives/scheduler.js';
import ormConfig from '../../config/orm.config.js';
import { MikroORM } from '@mikro-orm/core';
import { bootstrapPrimitives } from './bootstrapPrimitives.js';
import { createApplicationCtx } from './context.js';
let started = false;
/**
 * Initializes and starts the process-wide queue and scheduler runtimes.
 *
 * Subsequent calls are idempotent and return the already configured disposables.
 *
 * @returns {Promise<readonly [
 *   {stop: () => void|Promise<void>},
 *   {stop: () => void|Promise<void>}
 * ]>} Scheduler and queue disposables for graceful shutdown.
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
