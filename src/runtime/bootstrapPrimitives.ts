import variables from '@/config/variables';
import { Bus } from '@/primitives/bus';
import { Cache } from '@/primitives/cache';
import { Mailer } from '@/primitives/mail';
import { Queue } from '@/primitives/queue';
import { Scheduler } from '@/primitives/scheduler';
import { Storage } from '@/primitives/storage';
import { Memory } from '@/runtime/drivers/cache/memory';
import { InMemoryBus } from '@/runtime/drivers/bus/inMemory';
import { Log } from '@/runtime/drivers/mail/log';
import { Graphile } from '@/runtime/drivers/queue/graphile';
import { LocalDisk } from '@/runtime/drivers/storage/localDisk';

let bootstrapped = false;

/**
 * Configure the primitive runtimes and load in-process registrations once.
 */
export function bootstrapPrimitives(): void {
	if (bootstrapped) {
		return;
	}

	Bus.configure(new InMemoryBus());
	Cache.configure(new Memory());
	Storage.configure(new LocalDisk(variables.STORAGE_PATH, variables.APP_URL));
	Mailer.configure(new Log());
	Queue.configure(new Graphile(variables.DATABASE_URL));
	Scheduler.configure();
	bootstrapped = true;
}
