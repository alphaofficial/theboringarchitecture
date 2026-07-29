const publish = (state, event, payload) => {
    const eventListeners = state.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
        return false;
    }
    for (const listener of eventListeners) {
        listener(payload);
    }
    return true;
};
const on = (state, event, listener) => {
    const eventListeners = state.listeners.get(event);
    if (eventListeners) {
        eventListeners.add(listener);
        return;
    }
    state.listeners.set(event, new Set([listener]));
};
/**
 * Creates a process-local event bus backed by an in-memory listener map.
 *
 * @returns {{
 *   publish: (event: string, payload?: unknown) => boolean,
 *   on: (event: string, listener: (payload: unknown) => void) => void
 * }} A bus driver whose state is isolated to this instance.
 */
export function createInMemoryBusDriver() {
    const state = { listeners: new Map() };
    return {
        publish: (event, payload) => publish(state, event, payload),
        on: (event, listener) => on(state, event, listener),
    };
}
