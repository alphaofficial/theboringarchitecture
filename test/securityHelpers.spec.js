import { describe, expect, it, vi } from 'vitest';
import { SignedUrl } from '../app/support/signedUrl.js';
import { PasswordConfirmation } from '../app/middleware/passwordConfirmation.js';
import { RateLimitPresets } from '../app/support/rateLimitPresets.js';

describe('web security helpers', () => {
    it('creates and verifies signed URLs', () => {
        const url = SignedUrl.create('/verify-email/abc', { user: 'u1' }, { secret: 'secret', expiresAt: Date.now() + 1000 });
        expect(SignedUrl.verify(url, { secret: 'secret' })).toMatchObject({ valid: true, path: '/verify-email/abc', params: { user: 'u1' } });
        expect(SignedUrl.verify(url, { secret: 'wrong' })).toMatchObject({ valid: false, reason: 'invalid_signature' });
    });

    it('requires fresh password confirmation', () => {
        const req = { session: {}, accepts: () => false };
        const res = { status: vi.fn(() => res), json: vi.fn() };
        const next = vi.fn();
        PasswordConfirmation.requireFresh({ now: () => 1_000 })(req, res, next);
        expect(res.status).toHaveBeenCalledWith(423);
        PasswordConfirmation.mark(req, 900);
        PasswordConfirmation.requireFresh({ now: () => 1_000 })(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('registers named rate limit presets', () => {
        RateLimitPresets.reset();
        RateLimitPresets.define('checkout', { windowMs: 60_000, limit: 10 });
        expect(RateLimitPresets.list()).toContain('checkout');
    });
});
