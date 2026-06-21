import variables from '@/config/variables';
import { Bus } from '@/primitives/bus';
import { Cache } from '@/primitives/cache';
import { Mailer } from '@/primitives/mail';
import { Queue } from '@/primitives/queue';
import { Scheduler } from '@/primitives/scheduler';
import { Storage } from '@/primitives/storage';
import { createMemoryCacheDriver } from '@/runtime/drivers/cache/memory';
import { createInMemoryBusDriver } from '@/runtime/drivers/bus/inMemory';
import { createLogMailDriver } from '@/runtime/drivers/mail/log';
import { createSqliteQueueDriver } from '@/runtime/drivers/queue/sqlite';
import { createLocalDiskDriver } from '@/runtime/drivers/storage/localDisk';
import { MikroORM } from '@mikro-orm/core';
import { createApplicationCtx } from '@/runtime/context';

/**
 * Configure the primitive runtimes and load in-process registrations once.
 */
export function bootstrapPrimitives(orm: MikroORM): void {
	const ctx = createApplicationCtx(orm);

	Bus.configure(createInMemoryBusDriver(), ctx);
	Cache.configure(createMemoryCacheDriver());
	Storage.configure(createLocalDiskDriver(variables.STORAGE_PATH, variables.APP_URL));
	Mailer.configure(createLogMailDriver());
	Queue.configure(createSqliteQueueDriver(ctx.db), ctx);
	Scheduler.configure();
}
