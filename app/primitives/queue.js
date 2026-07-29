import { loadRelativeDirectory } from '../../lib/runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
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
const on = (name, handler) => {
    const runtime = getPrimitiveRuntime('queue');
    runtime.handlers.set(name, async (payload) => {
        await handler(runtime.ctx, payload);
    });
};
const start = async () => {
    await loadRelativeDirectory('jobs');
    const runtime = getPrimitiveRuntime('queue');
    void runtime.driver.start(runtime.handlers);
};
const stop = async () => {
    await getPrimitiveRuntime('queue').driver.stop();
};
const dispatch = async (jobName, payload = {}) => {
    await getPrimitiveRuntime('queue').driver.dispatch(jobName, payload);
};
export const Queue = Object.freeze({
    configure,
    on,
    start,
    stop,
    dispatch,
});
