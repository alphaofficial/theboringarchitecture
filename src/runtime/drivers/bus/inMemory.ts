import type { BusDriver, BusListener } from '@/primitives/bus';

export function createInMemoryBusDriver(): BusDriver {
	const listeners = new Map<string, Set<BusListener>>();

	return {
		publish(event: string, payload?: unknown): boolean {
			const eventListeners = listeners.get(event);
			if (!eventListeners || eventListeners.size === 0) {
				return false;
			}

			for (const listener of eventListeners) {
				listener(payload);
			}

			return true;
		},

		on(event: string, listener: BusListener): void {
			const eventListeners = listeners.get(event);
			if (eventListeners) {
				eventListeners.add(listener);
				return;
			}

			listeners.set(event, new Set([listener]));
		},
	};
}
