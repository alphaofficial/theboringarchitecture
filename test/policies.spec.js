import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { Policy } from '../app/support/policies.js';
import { PolicyDiscovery } from '../app/support/policyDiscovery.js';
import { RequestModules } from '../app/support/requestModules.js';

afterEach(() => { Policy.flush(); RequestModules.flush(); });

describe('policy conventions', () => {
    it('authorizes actions by subject policy', () => {
        const article = { userId: 'u1' };
        Policy.define('Article', { update: (user, subject) => user.id === subject.userId });
        expect(Policy.allows({ id: 'u1' }, 'update', 'Article', article)).toBe(true);
        expect(Policy.allows({ id: 'u2' }, 'update', 'Article', article)).toBe(false);
    });

    it('provides route middleware for policy checks', async () => {
        const Post = class { constructor(id, userId) { this.id = id; this.userId = userId; } };
        const posts = new Map([['p1', new Post('p1', 'u1')]]);
        Policy.define(Post, { update: (user, post) => user.id === post.userId });
        const next = vi.fn();
        const req = { user: async () => ({ id: 'u1' }), params: { postId: 'p1' } };
        await Policy.can('update', request => posts.get(request.params.postId))(req, {}, next);
        expect(next).toHaveBeenCalled();
    });

    it('loads request rule modules by convention', async () => {
        const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'requests-'));
        await fs.promises.writeFile(path.join(dir, 'StorePostRequest.js'), "export const StorePostRequest = { name: 'posts.store', rules: { title: 'required' } };\n");
        await RequestModules.load(dir);
        expect(RequestModules.get('posts.store')).toEqual({ title: 'required' });
    });

    it('loads policy modules by convention', async () => {
        const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'policies-'));
        await fs.promises.writeFile(path.join(dir, 'PostPolicy.js'), `import { Policy } from '${  path.resolve('app/support/policies.js')  }';\nPolicy.define('Post', { view: user => Boolean(user) });\n`);
        await PolicyDiscovery.load(dir);
        expect(Policy.allows({ id: 'u1' }, 'view', 'Post')).toBe(true);
    });
});
