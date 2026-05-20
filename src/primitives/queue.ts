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

/**
 * Queue primitive for registering background consumers and dispatching jobs.
 */
export class Queue {
	private static runtimeKey = 'queue';

	static configure(driver: QueueDriver): void {
		if (hasPrimitiveRuntime(Queue.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<QueueRuntime>(Queue.runtimeKey, {
			driver,
			handlers: new Map(),
		});
	}

	private static runtime(): QueueRuntime {
		return getPrimitiveRuntime<QueueRuntime>(Queue.runtimeKey);
	}

	static on<T = unknown>(name: string, handler: QueueHandler<T>): void {
		Queue.runtime().handlers.set(name, handler as QueueHandler);
	}

	static start(): void {
		loadRelativeDirectory('jobs');
		void Queue.runtime().driver.start(Queue.runtime().handlers);
	}

	static async stop(): Promise<void> {
		await Queue.runtime().driver.stop();
	}

	static async dispatch(jobName: string, payload: unknown = {}): Promise<void> {
		await Queue.runtime().driver.dispatch(jobName, payload);
	}
}
