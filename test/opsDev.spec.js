import { afterEach, describe, expect, it } from 'vitest';
import { MailTemplate } from '../app/support/mailTemplate.js';
import { Command } from '../app/support/command.js';
import { Config } from '../app/support/config.js';
import { Cache } from '../lib/primitives/cache.js';
import { clearPrimitiveRuntime } from '../lib/runtime/primitiveRegistry.js';

afterEach(() => {
    MailTemplate.reset();
    Command.reset();
    clearPrimitiveRuntime('cache');
});

describe('operations and developer ergonomics', () => {
    it('renders subject/html before the mail primitive sends', () => {
        MailTemplate.define('welcome', ({ name }) => ({ subject: 'Welcome', html: `<p>${name}</p>` }));
        const message = MailTemplate.render('welcome', { name: 'Ada' });

        expect(MailTemplate.list()).toEqual(['welcome']);
        expect(message).toEqual({ subject: 'Welcome', html: '<p>Ada</p>' });
    });

    it('registers and runs application commands', async () => {
        Command.define('users:prune', { description: 'Prune users', handle: ({ args }) => args.days });
        expect(Command.list()[0]).toMatchObject({ name: 'users:prune', description: 'Prune users' });
        await expect(Command.run('users:prune', { days: 90 })).resolves.toBe(90);
    });

    it('reads nested config values', () => {
        const config = Config.create({ mail: { from: { address: 'hello@example.com' } } });
        expect(config.get('mail.from.address')).toBe('hello@example.com');
        expect(config.get('missing', 'fallback')).toBe('fallback');
    });

    it('remembers cache values through the Cache primitive', async () => {
        const values = new Map();
        Cache.configure({
            async get(key) { return values.get(key); },
            async set(key, value) { values.set(key, value); },
            async delete(key) { values.delete(key); },
            async flush() { values.clear(); },
        });
        await expect(Cache.remember('users.count', 300, () => 10)).resolves.toBe(10);
        await expect(Cache.remember('users.count', 300, () => 20)).resolves.toBe(10);
    });
});
