import crypto from 'node:crypto';
import { Notification } from '../../../../app/models/Notification.js';
import { Mailer } from '../../../../app/primitives/mail.js';

/**
 * Returns the recipient model name.
 *
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @returns {string} Constructor name used as the notifiable type.
 */
function notifiableType(notifiable) {
    return notifiable?.constructor?.name || 'Anonymous';
}

/**
 * Returns the recipient identifier.
 *
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @returns {string} String identifier derived from the notifiable ID or email.
 */
function notifiableId(notifiable) {
    return String(notifiable?.id ?? notifiable?.email ?? '');
}

/**
 * Resolves delivery channels for a notification.
 *
 * @param {{via?: string[], toDatabase?: () => Record<string, string|number|boolean|null>, toMail?: () => {subject: string, html?: string, text?: string}}} notification Notification definition.
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @returns {Record<string, string|number|boolean|null>} Registered values.
 */
function channelsFor(notification, notifiable) {
    if (Array.isArray(notification.channels)) return notification.channels;
    if (typeof notification.via === 'function') return notification.via(notifiable);
    return ['database'];
}

/**
 * Builds channel data for a notification.
 *
 * @param {{via?: string[], toDatabase?: () => Record<string, string|number|boolean|null>, toMail?: () => {subject: string, html?: string, text?: string}}} notification Notification definition.
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @returns {Record<string, string|number|boolean|null>} Database payload supplied by the notification.
 */
function dataFor(notification, notifiable) {
    if (typeof notification.toDatabase === 'function') return notification.toDatabase(notifiable);
    if (typeof notification.data === 'function') return notification.data(notifiable);
    return notification.data || {};
}

/**
 * Sends a rendered mail message.
 *
 * @param {{via?: string[], toDatabase?: () => Record<string, string|number|boolean|null>, toMail?: () => {subject: string, html?: string, text?: string}}} notification Notification definition.
 * @param {{id: string|number, constructor: {name: string}}} notifiable Notification recipient.
 * @returns {Promise<void>} Resolves when the operation completes.
 */
async function sendMail(notification, notifiable) {
    if (!notifiable?.email) return;
    const mail = typeof notification.toMail === 'function' ? notification.toMail(notifiable) : null;
    if (!mail) return;
    await Mailer.send(notifiable.email, mail.subject, mail.html);
}

/**
 * Creates a notification driver that stores and queries database-backed notifications.
 * @returns {{send: (ctx: object, notifiable: object, notification: object) => Promise<Notification | null>, unread: (ctx: object, notifiable: object) => Promise<Notification[]>, markRead: (ctx: object, notifiable: object, id: string) => Promise<Notification | null>}} Driver for delivering, querying, and marking notifications as read.
 * @example
 * const notifications = createDatabaseNotificationDriver();
 * await notifications.send(ctx, user, welcomeNotification);
 * const unread = await notifications.unread(ctx, user);
 */
export function createDatabaseNotificationDriver() {
    return {
        async send(ctx, notifiable, notification) {
            const channels = channelsFor(notification, notifiable);
            const data = dataFor(notification, notifiable);
            const type = notification.type || notification.constructor?.name || 'notification';
            let record = null;

            if (channels.includes('database')) {
                record = new Notification(
                    crypto.randomUUID(),
                    type,
                    notifiableType(notifiable),
                    notifiableId(notifiable),
                    channels,
                    data,
                );
                await ctx.db.persistAndFlush(record);
            }

            if (channels.includes('mail')) {
                await sendMail(notification, notifiable);
            }

            return record;
        },

        async unread(ctx, notifiable) {
            return ctx.db.find(Notification, {
                notifiableType: notifiableType(notifiable),
                notifiableId: notifiableId(notifiable),
                readAt: null,
            }, { orderBy: { createdAt: 'desc' } });
        },

        async markRead(ctx, notifiable, id) {
            const notification = await ctx.db.findOne(Notification, {
                id,
                notifiableType: notifiableType(notifiable),
                notifiableId: notifiableId(notifiable),
            });
            if (!notification) return null;
            notification.readAt = new Date();
            await ctx.db.flush();
            return notification;
        },
    };
}
