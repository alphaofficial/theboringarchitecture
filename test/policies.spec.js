import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { Policy } from '../app/support/policies.js';
import { PolicyDiscovery } from '../app/support/policyDiscovery.js';
import { RequestModules } from '../app/support/requestModules.js';

afterEach(() => { Policy.flush(); RequestModules.flush(); });

describe('policy conventions', () => {
    it('authorizes actions by subject policy', () => {
        class Post { constructor(userId) { this.userId = userId; } }
        Policy.define(Post, { update: (user, post) => user.id === post.userId });
        expect(Policy.allows({ id: 'u1' }, 'update', new Post('u1'))).toBe(true);
        expect(Policy.allows({ id: 'u2' }, 'update', new Post('u1'))).toBe(false);
    });

    it('provides route middleware for policy checks', async () => {
        class Post { constructor(id, userId) { this.id = id; this.userId = userId; } }
        const posts = new Map([['p1', new Post('p1', 'u1')]]);
        Policy.define(Post, { update: (user, post) => user.id === post.userId });
        const next = vi.fn();
        const req = { user: async () => ({ id: 'u1' }), params: { postId: 'p1' } };
        await Policy.can('update', req => posts.get(req.params.postId))(req, {}, next);
        expect(next).toHaveBeenCalled();
    });

    it('loads request rule modules by convention', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'requests-'));
        fs.writeFileSync(path.join(dir, 'StorePostRequest.js'), "export const StorePostRequest = { name: 'posts.store', rules: { title: 'required' } };\n");
        await RequestModules.load(dir);
        expect(RequestModules.get('posts.store')).toEqual({ title: 'required' });
    });

    it('loads policy modules by convention', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'policies-'));
        fs.writeFileSync(path.join(dir, 'PostPolicy.js'), "import { Policy } from '" + path.resolve('app/support/policies.js') + "';\nPolicy.define('Post', { view: user => Boolean(user) });\n");
        await PolicyDiscovery.load(dir);
        expect(Policy.allows({ id: 'u1' }, 'view', 'Post')).toBe(true);
    });
});
