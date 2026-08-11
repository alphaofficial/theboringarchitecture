import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Validation } from '../app/support/validation.js';

describe('Validation.request', () => {
    it('attaches validated data and continues on success', async () => {
        const app = express();
        app.use(express.json());
        app.post('/profile', Validation.request({ email: 'required|email' }), (req, res) => res.json(req.validated));

        await request(app).post('/profile').send({ email: 'user@example.com', ignored: true }).expect(200, { email: 'user@example.com' });
    });

    it('renders the configured page with errors on failure', async () => {
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            res.render = (page, props) => res.status(422).json({ page, props });
            next();
        });
        app.post('/profile', Validation.request({ email: 'required|email' }, { page: 'Auth/Settings' }), (_req, res) => res.json({ ok: true }));

        const response = await request(app).post('/profile').send({ email: 'bad' }).expect(422);
        expect(response.body.page).toBe('Auth/Settings');
        expect(response.body.props.errors.email[0]).toBe('email must be a valid email address');
    });

    it('passes request context, custom messages, labels, and error bags into validation', async () => {
        const app = express();
        app.use(express.json());
        app.use((req, _res, next) => {
            req.ctx = {
                db: {
                    async count(table, where) {
                        return table === 'users' && where.email === 'taken@example.com' ? 1 : 0;
                    },
                },
            };
            next();
        });
        app.post('/profile', Validation.request({ email: 'required|email|unique:users,email' }, {
            errorBag: 'account',
            labels: { email: 'email address' },
            messages: { unique: 'That :attribute is already registered.' },
        }), (_req, res) => res.json({ ok: true }));

        const response = await request(app).post('/profile').send({ email: 'taken@example.com' }).expect(422);
        expect(response.body.errors.email).toEqual(['That email address is already registered.']);
        expect(response.body.errorBag).toBe('account');
        expect(response.body.errorBags.account).toEqual(response.body.errors);
    });
});
