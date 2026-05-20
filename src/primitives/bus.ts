import { loadRelativeDirectory } from '@/runtime/loadRelativeDirectory';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export type BusListener = (payload: unknown) => void;

interface BusRuntime {
	driver: BusDriver;
	started: boolean;
}

export interface BusDriver {
	publish(event: string, payload?: unknown): boolean;
	on(event: string, listener: BusListener): void;
	start?(): void | Promise<void>;
}

/**
 * Process-local event bus for modular-monolith communication.
 */
export class Bus {
	private static runtimeKey = 'bus';

	static configure(driver: BusDriver): void {
		if (hasPrimitiveRuntime(Bus.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<BusRuntime>(Bus.runtimeKey, {
			driver,
			started: false,
		});
	}

	private static runtime(): BusRuntime {
		return getPrimitiveRuntime<BusRuntime>(Bus.runtimeKey);
	}

	static start(): void {
		const runtime = Bus.runtime();
		if (runtime.started) {
			return;
		}

		loadRelativeDirectory('events');
		runtime.started = true;
		void runtime.driver.start?.();
	}

	static publish(event: string, payload?: unknown): boolean {
		return Bus.runtime().driver.publish(event, payload);
	}

	static on(event: string, listener: BusListener): void {
		Bus.runtime().driver.on(event, listener);
	}
}
