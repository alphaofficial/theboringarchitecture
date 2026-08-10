import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../../lib/runtime/primitiveRegistry.js';

const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('notification')) return;
    registerPrimitiveRuntime('notification', { driver, ctx });
};

const send = async (notifiable, notification) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.send(runtime.ctx, notifiable, notification);
};

const unread = async (notifiable) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.unread(runtime.ctx, notifiable);
};

const markRead = async (notifiable, id) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.markRead(runtime.ctx, notifiable, id);
};

export const NotificationCenter = Object.freeze({
    configure,
    send,
    unread,
    markRead,
});
