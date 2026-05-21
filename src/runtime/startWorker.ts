import { Queue } from '@/primitives/queue';
import { Scheduler } from '@/primitives/scheduler';
import { bootstrapPrimitives } from '@/runtime/bootstrapPrimitives';

let started = false;

export function startWorker() {
	if (started) {
		return [Scheduler, Queue] as const;
	}

	bootstrapPrimitives();
	Queue.start();
	Scheduler.start();
	started = true;

	return [Scheduler, Queue] as const;
}
