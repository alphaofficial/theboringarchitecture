import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { validateRequest } from '../app/support/validation.js';

describe('validateRequest', () => {
    it('attaches validated data and continues on success', async () => {
        const app = express();
        app.use(express.json());
        app.post('/profile', validateRequest({ email: 'required|email' }), (req, res) => res.json(req.validated));

        await request(app).post('/profile').send({ email: 'user@example.com', ignored: true }).expect(200, { email: 'user@example.com' });
    });

    it('renders the configured page with errors on failure', async () => {
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            res.render = (page, props) => res.status(422).json({ page, props });
            next();
        });
        app.post('/profile', validateRequest({ email: 'required|email' }, { page: 'Auth/Settings' }), (_req, res) => res.json({ ok: true }));

        const response = await request(app).post('/profile').send({ email: 'bad' }).expect(422);
        expect(response.body.page).toBe('Auth/Settings');
        expect(response.body.props.errors.email[0]).toBe('email must be a valid email address');
    });
});
