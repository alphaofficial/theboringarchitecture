import { loadRelativeDirectory } from '../../lib/runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

/**
 * Configures the event bus driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Application context passed to handlers.
 * @returns {void} No return value.
 */
const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('bus')) {
        return;
    }
    registerPrimitiveRuntime('bus', {
        driver,
        ctx,
        started: false,
    });
};

/**
 * Starts the driver.
 *
 * @returns {Promise<void>} Resolves when finished.
 */
const start = async () => {
    const busRuntime = getPrimitiveRuntime('bus');
    if (busRuntime.started) {
        return;
    }
    await loadRelativeDirectory('events');
    busRuntime.started = true;
    await busRuntime.driver.start?.();
};

/**
 * Publishes an event through the configured driver.
 *
 * @param {string} event Event name.
 * @param {Record<string, string|number|boolean|null|undefined>} payload Event or job payload.
 * @returns {void} No return value.
 */
const publish = (event, payload) => getPrimitiveRuntime('bus').driver.publish(event, payload);
/**
 * Registers an event listener.
 *
 * @param {string} event Event name.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} listener (...args: never[]) => void invoked for the event.
 * @returns {void} No return value.
 */
const on = (event, listener) => {
    const runtime = getPrimitiveRuntime('bus');
    runtime.driver.on(event, payload => {
        listener(runtime.ctx, payload);
    });
};

/** Provides the Bus public API for its configured application behavior. */
export const Bus = Object.freeze({
    configure,
    start,
    publish,
    on,
});
