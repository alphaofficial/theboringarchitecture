import type { BusDriver, BusListener } from '@/primitives/bus';

export class InMemoryBus implements BusDriver {
	private listeners = new Map<string, Set<BusListener>>();

	publish(event: string, payload?: unknown): boolean {
		const listeners = this.listeners.get(event);
		if (!listeners || listeners.size === 0) {
			return false;
		}

		for (const listener of listeners) {
			listener(payload);
		}

		return true;
	}

	on(event: string, listener: BusListener): void {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.add(listener);
			return;
		}

		this.listeners.set(event, new Set([listener]));
	}
}
