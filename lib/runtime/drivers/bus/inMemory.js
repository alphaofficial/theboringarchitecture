/**
 * Publishes an event to registered listeners.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} event Event name.
 * @param {Record<string, string|number|boolean|null|undefined>} payload Event or job payload.
 * @returns {void} No return value.
 */
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

/**
 * Registers an in-memory event listener.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} event Event name.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} listener (...args: never[]) => void invoked for the event.
 * @returns {void} No return value.
 */
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
 * @returns {{on: (event: string, handler: (...args: never[]) => Promise<void>) => void, emit: (event: string, payload?: Record<string, string|number|boolean|null>) => Promise<void>}} Event driver for publishing events and registering listeners.
 * @example
 * const bus = createInMemoryBusDriver();
 * bus.on('user.registered', user => sendWelcomeEmail(user));
 * bus.publish('user.registered', user);
 */
export function createInMemoryBusDriver() {
    const state = { listeners: new Map() };
    return {
        publish: (event, payload) => publish(state, event, payload),
        on: (event, listener) => on(state, event, listener),
    };
}
