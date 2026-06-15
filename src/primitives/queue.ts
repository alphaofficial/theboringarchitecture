import { loadRelativeDirectory } from '@/runtime/loadRelativeDirectory';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export type QueueHandler<T = unknown> = (payload: T) => Promise<void>;

export interface QueueDriver {
	start(handlers: ReadonlyMap<string, QueueHandler>): void | Promise<void>;
	stop(): Promise<void>;
	dispatch(jobName: string, payload?: unknown): Promise<void>;
}

interface QueueRuntime {
	driver: QueueDriver;
	handlers: Map<string, QueueHandler>;
}

/** Configure the queue driver. */
const configure = (driver: QueueDriver): void => {
	if (hasPrimitiveRuntime('queue')) {
		return;
	}

	registerPrimitiveRuntime<QueueRuntime>('queue', {
		driver,
		handlers: new Map(),
	});
};

/** Register a job handler. */
const on = <T = unknown>(name: string, handler: QueueHandler<T>): void => {
	getPrimitiveRuntime<QueueRuntime>('queue').handlers.set(name, handler as QueueHandler);
};

/** Load jobs and start the queue driver. */
const start = (): void => {
	loadRelativeDirectory('jobs');
	const queueRuntime = getPrimitiveRuntime<QueueRuntime>('queue');
	void queueRuntime.driver.start(queueRuntime.handlers);
};

/** Stop the queue driver. */
const stop = async (): Promise<void> => {
	await getPrimitiveRuntime<QueueRuntime>('queue').driver.stop();
};

/** Dispatch a job to the queue. */
const dispatch = async (jobName: string, payload: unknown = {}): Promise<void> => {
	await getPrimitiveRuntime<QueueRuntime>('queue').driver.dispatch(jobName, payload);
};

/**
 * Queue primitive for registering background consumers and dispatching jobs.
 */
export const Queue = Object.freeze({
	configure,
	on,
	start,
	stop,
	dispatch,
});
