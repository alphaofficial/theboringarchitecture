import { loadRelativeDirectory } from '../../lib/runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

/**
 * Configures the queue driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Application context passed to handlers.
 * @returns {void} No return value.
 */
const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('queue')) {
        return;
    }
    registerPrimitiveRuntime('queue', {
        driver,
        ctx,
        handlers: new Map(),
    });
};

/**
 * Registers a queue job handler.
 *
 * @param {string} name Registered name.
 * @param {(...args: never[]) => Promise<string|number|boolean|null|void>} handler Registered handler.
 * @returns {void} No return value.
 */
const on = (name, handler) => {
    const runtime = getPrimitiveRuntime('queue');
    runtime.handlers.set(name, async (payload) => {
        await handler(runtime.ctx, payload);
    });
};

/**
 * Starts the driver.
 *
 * @returns {Promise<void>} Resolves when finished.
 */
const start = async () => {
    await loadRelativeDirectory('jobs');
    const runtime = getPrimitiveRuntime('queue');
    await runtime.driver.start(runtime.handlers);
};

/**
 * Stops the driver.
 *
 * @returns {Promise<void>} Resolves when finished.
 */
const stop = async () => {
    await getPrimitiveRuntime('queue').driver.stop();
};

/**
 * Dispatches a job to the queue.
 *
 * @param {string} jobName Job name.
 * @param {Record<string, string|number|boolean|null|undefined>} [payload] Event or job payload.
 */
const dispatch = async (jobName, payload = {}) => {
    await getPrimitiveRuntime('queue').driver.dispatch(jobName, payload);
};

/** Provides the Queue public API for its configured application behavior. */
export const Queue = Object.freeze({
    configure,
    on,
    start,
    stop,
    dispatch,
});
