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
import { createInMemoryQueueDriver } from '@/runtime/drivers/queue/inMemory';
import { createLocalDiskDriver } from '@/runtime/drivers/storage/localDisk';

let bootstrapped = false;

/**
 * Configure the primitive runtimes and load in-process registrations once.
 */
export function bootstrapPrimitives(): void {
	if (bootstrapped) {
		return;
	}

	Bus.configure(createInMemoryBusDriver());
	Cache.configure(createMemoryCacheDriver());
	Storage.configure(createLocalDiskDriver(variables.STORAGE_PATH, variables.APP_URL));
	Mailer.configure(createLogMailDriver());
	Queue.configure(createInMemoryQueueDriver());
	Scheduler.configure();
	bootstrapped = true;
}
