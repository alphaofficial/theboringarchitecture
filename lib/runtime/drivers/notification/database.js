import crypto from 'crypto';
import { Notification } from '../../../../app/models/Notification.js';
import { Mailer } from '../../../../app/primitives/mail.js';

function notifiableType(notifiable) {
    return notifiable?.constructor?.name || 'Anonymous';
}

function notifiableId(notifiable) {
    return String(notifiable?.id ?? notifiable?.email ?? '');
}

function channelsFor(notification, notifiable) {
    if (Array.isArray(notification.channels)) return notification.channels;
    if (typeof notification.via === 'function') return notification.via(notifiable);
    return ['database'];
}

function dataFor(notification, notifiable) {
    if (typeof notification.toDatabase === 'function') return notification.toDatabase(notifiable);
    if (typeof notification.data === 'function') return notification.data(notifiable);
    return notification.data || {};
}

async function sendMail(notification, notifiable) {
    if (!notifiable?.email) return;
    const mail = typeof notification.toMail === 'function' ? notification.toMail(notifiable) : null;
    if (!mail) return;
    await Mailer.send(notifiable.email, mail.subject, mail.html);
}

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
