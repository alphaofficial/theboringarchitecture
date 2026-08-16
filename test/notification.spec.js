import { afterEach, describe, expect, it } from 'vitest';
import { clearPrimitiveRuntime } from '../lib/runtime/primitiveRegistry.js';
import { NotificationCenter } from '../app/primitives/notification.js';

/**
 * Creates an in-memory notification test driver.
 *
 * @returns {{records: Array<Record<string, string|number|boolean|null>>, send: (...args: never[]) => Promise<void>, unread: (...args: never[]) => Promise<Array<Record<string, string|number|boolean|null>>>, markRead: (...args: never[]) => Promise<void>}} Test notification driver.
 */
function fakeDriver() {
    const records = [];
    return {
        records,
        async send(_ctx, notifiable, notification) {
            const record = { id: 'n1', notifiable, notification };
            records.push(record);
            return record;
        },
        async unread() { return records; },
        async markRead(_ctx, _notifiable, id) { return records.find(record => record.id === id); },
    };
}

afterEach(() => clearPrimitiveRuntime('notification'));

describe('NotificationCenter', () => {
    it('delegates send/unread/markRead to the configured driver', async () => {
        const driver = fakeDriver();
        NotificationCenter.configure(driver, { db: {} });

        const user = { id: 'u1', email: 'user@example.com' };
        const notification = { type: 'welcome', channels: ['database'], data: { message: 'Welcome' } };

        await expect(NotificationCenter.send(user, notification)).resolves.toMatchObject({ id: 'n1' });
        await expect(NotificationCenter.unread(user)).resolves.toHaveLength(1);
        await expect(NotificationCenter.markRead(user, 'n1')).resolves.toMatchObject({ id: 'n1' });
    });
});
