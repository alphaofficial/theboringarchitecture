import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { Gate, can } from '../app/support/authorization.js';

afterEach(() => Gate.flush());

describe('Gate', () => {
    it('allows defined abilities', async () => {
        Gate.define('posts.update', (user, post) => user?.id === post.userId);
        await expect(Gate.allows('posts.update', { id: '1' }, { userId: '1' })).resolves.toBe(true);
        await expect(Gate.allows('posts.update', { id: '2' }, { userId: '1' })).resolves.toBe(false);
    });

    it('can protect express routes', async () => {
        Gate.define('admin', user => user?.role === 'admin');
        const app = express();
        app.use((req, _res, next) => {
            req.user = async () => ({ role: req.get('x-role') });
            next();
        });
        app.get('/admin', can('admin'), (_req, res) => res.json({ ok: true }));

        const allowed = await request(app).get('/admin').set('x-role', 'admin').expect(200, { ok: true });
        const denied = await request(app).get('/admin').set('x-role', 'user').expect(403);
        expect(allowed.body).toEqual({ ok: true });
        expect(denied.status).toBe(403);
    });
});
