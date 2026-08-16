import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '../runtime/primitiveRegistry.js';

/**
 * Configures the notification driver.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} driver Primitive driver implementation.
 * @param {import('../../lib/runtime/context.js').ApplicationContext} ctx Application context passed to handlers.
 * @returns {void} No return value.
 */
const configure = (driver, ctx) => {
    if (hasPrimitiveRuntime('notification')) return;
    registerPrimitiveRuntime('notification', { driver, ctx });
};

/**
 * Sends a notification to a recipient.
 *
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @param {{via?: string[], toDatabase?: () => Record<string, string|number|boolean|null>, toMail?: () => {subject: string, html?: string, text?: string}}} notification Notification definition.
 * @returns {Promise<void>} Resolves when finished.
 */
const send = async (notifiable, notification) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.send(runtime.ctx, notifiable, notification);
};

/**
 * Unread.
 *
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
  * @returns {Promise<Array<Record<string, string|number|boolean|null>>>} Unread notifications.
 */
const unread = async (notifiable) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.unread(runtime.ctx, notifiable);
};

/**
 * Mark read.
 *
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @param {string} id Record identifier.
  * @returns {Promise<void>} Resolves after marking the notification as read.
 */
const markRead = async (notifiable, id) => {
    const runtime = getPrimitiveRuntime('notification');
    return runtime.driver.markRead(runtime.ctx, notifiable, id);
};

/** Provides the NotificationCenter public API for its configured application behavior. */
export const NotificationCenter = Object.freeze({
    configure,
    send,
    unread,
    markRead,
});
