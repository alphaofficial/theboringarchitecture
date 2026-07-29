import { loadRelativeDirectory } from '../../lib/runtime/loadRelativeDirectory.js';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';
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
const start = async () => {
    const busRuntime = getPrimitiveRuntime('bus');
    if (busRuntime.started) {
        return;
    }
    await loadRelativeDirectory('events');
    busRuntime.started = true;
    void busRuntime.driver.start?.();
};
const publish = (event, payload) => {
    return getPrimitiveRuntime('bus').driver.publish(event, payload);
};
const on = (event, listener) => {
    const runtime = getPrimitiveRuntime('bus');
    runtime.driver.on(event, payload => {
        listener(runtime.ctx, payload);
    });
};
export const Bus = Object.freeze({
    configure,
    start,
    publish,
    on,
});
