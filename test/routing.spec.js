import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Router } from '../app/router/routing.js';

describe('routing helpers', () => {
    it('registers resource routes with predictable names and handlers', async () => {
        const route = Router.create();
        const calls = [];
        const controller = {
            index: (_req, res) => res.json({ action: 'index' }),
            store: (_req, res) => res.json({ action: 'store' }),
            show: (req, res) => res.json({ action: 'show', id: req.params.post }),
            update: (req, res) => res.json({ action: 'update', id: req.params.post }),
            destroy: (req, res) => res.json({ action: 'destroy', id: req.params.post }),
        };
        const audit = (_req, _res, next) => { calls.push('audit'); next(); };

        route.resource('posts', controller, { middleware: [audit], except: ['create', 'edit'] });
        const app = express().use(route);

        await request(app).get('/posts').expect(200, { action: 'index' });
        await request(app).post('/posts').expect(200, { action: 'store' });
        await request(app).get('/posts/42').expect(200, { action: 'show', id: '42' });
        await request(app).patch('/posts/42').expect(200, { action: 'update', id: '42' });
        await request(app).delete('/posts/42').expect(200, { action: 'destroy', id: '42' });
        expect(calls.length).toBe(5);
        expect(route.url('posts.index')).toBe('/posts');
        expect(route.url('posts.show', { post: 42 })).toBe('/posts/42');
    });

    it('generates named URLs with params and query strings', () => {
        const route = Router.create();
        route.name('teams.members.show').get('/teams/:team/members/:member', (_req, res) => res.end());

        expect(route.url('teams.members.show', { team: 'core api', member: 7, tab: 'roles' })).toBe('/teams/core%20api/members/7?tab=roles');
        expect(route.url('teams.members.show', { team: 3, member: 7 }, { query: { filter: 'active' } })).toBe('/teams/3/members/7?filter=active');
        expect(() => route.url('missing.route')).toThrow(/Unknown route name/);
        expect(() => route.url('teams.members.show', { team: 3 })).toThrow(/Missing route parameter: member/);
    });

    it('applies middleware groups with shared prefixes and name prefixes', async () => {
        const route = Router.create();
        const seen = [];
        const requireAdmin = (_req, res, next) => {
            seen.push('admin');
            return _req.get('x-admin') === 'yes' ? next() : res.sendStatus(403);
        };

        route.group({ prefix: '/admin', name: 'admin.', middleware: [requireAdmin] }, admin => {
            admin.get('/ping', (_req, res) => res.json({ pong: true }));
            admin.name('dashboard').get('/dashboard', (_req, res) => res.json({ ok: true }));
            admin.group({ prefix: '/reports', name: 'reports.' }, reports => {
                reports.name('show').get('/:report', (req, res) => res.json({ report: req.params.report }));
            });
        });

        const app = express().use(route.urls()).use(route);

        await request(app).get('/admin/dashboard').expect(403);
        await request(app).get('/admin/ping').set('x-admin', 'yes').expect(200, { pong: true });
        await request(app).get('/admin/dashboard').set('x-admin', 'yes').expect(200, { ok: true });
        await request(app).get('/admin/reports/sales').set('x-admin', 'yes').expect(200, { report: 'sales' });
        expect(seen).toEqual(['admin', 'admin', 'admin', 'admin']);
        expect(route.url('admin.dashboard')).toBe('/admin/dashboard');
        expect(route.url('admin.reports.show', { report: 'sales q1' })).toBe('/admin/reports/sales%20q1');
    });

    it('exposes URL generation on requests and response locals', async () => {
        const route = Router.create();
        route.name('profiles.show').get('/profiles/:profile', (req, res) => {
            res.json({ reqUrl: req.routeUrl('profiles.show', { profile: 5 }), localUrl: res.locals.routeUrl('profiles.show', { profile: 6 }) });
        });

        const app = express().use(route.urls()).use(route);
        await request(app).get('/profiles/1').expect(200, { reqUrl: '/profiles/5', localUrl: '/profiles/6' });
    });
});
