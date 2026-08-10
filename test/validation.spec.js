import { describe, expect, it } from 'vitest';
import { assertValid, validate, validateAsync } from '../app/support/validation.js';

describe('validate', () => {
    it('returns filtered validated data for passing rules', () => {
        const result = validate({ email: 'user@example.com', password: 'secret123', password_confirmation: 'secret123', ignored: true }, {
            email: 'required|email',
            password: 'required|min:8|confirmed',
        });

        expect(result.valid).toBe(true);
        expect(result.data).toEqual({ email: 'user@example.com', password: 'secret123' });
        expect(result.errors).toEqual({});
    });

    it('collects field errors for failed rules', () => {
        const result = validate({ email: 'nope', password: 'short', password_confirmation: 'different' }, {
            email: 'required|email',
            password: 'required|min:8|confirmed',
        });

        expect(result.valid).toBe(false);
        expect(result.errors.email).toContain('email must be a valid email address');
        expect(result.errors.password).toContain('password must be at least 8');
        expect(result.errors.password).toContain('password confirmation does not match');
    });

    it('validates nested paths and wildcard array entries', () => {
        const result = validate({
            user: { email: 'user@example.com' },
            items: [{ sku: 'ABC-1', qty: 2 }, { sku: '', qty: 0 }],
        }, {
            'user.email': 'required|email',
            'items': 'required|array|min:1',
            'items.*.sku': 'required|string|starts_with:ABC',
            'items.*.qty': 'required|integer|min:1',
        });

        expect(result.valid).toBe(false);
        expect(result.data.user.email).toBe('user@example.com');
        expect(result.errors['items.1.sku']).toContain('items sku is required');
        expect(result.errors['items.1.qty']).toContain('items qty must be at least 1');
    });

    it('supports presence, nullable, sometimes, and exclude_if control rules', () => {
        const result = validate({ role: 'guest', profile: null }, {
            profile: 'nullable|object',
            nickname: 'sometimes|string|min:2',
            terms: 'present',
            internal_notes: 'exclude_if:role,guest|required',
        });

        expect(result.valid).toBe(false);
        expect(result.errors.terms).toContain('terms must be present');
        expect(result.errors.nickname).toBeUndefined();
        expect(result.errors.internal_notes).toBeUndefined();
    });

    it('supports common scalar, set, comparison, and format rules', () => {
        const result = validate({
            accepted: 'yes',
            declined: 'no',
            count: '10',
            code: 'ABC123',
            state: 'open',
            url: 'https://example.com',
            id: '550e8400-e29b-41d4-a716-446655440000',
            start: '2026-01-02',
            end: '2026-01-03',
            lower: 'abc',
            upper: 'ABC',
        }, {
            accepted: 'accepted',
            declined: 'declined',
            count: 'numeric|between:1,20',
            code: ['regex:^[A-Z]+\\d+$', 'size:6'],
            state: 'in:open,closed|not_in:deleted',
            url: 'url',
            id: 'uuid',
            start: 'date|before:end',
            end: 'date|after:start',
            lower: 'lowercase',
            upper: 'uppercase',
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual({});
    });

    it('supports bail and custom synchronous rules', () => {
        const result = validate({ name: '' }, {
            name: ['bail', 'required', () => 'should not run after required'],
        });

        expect(result.errors.name).toEqual(['name is required']);
    });

    it('supports async custom rules through validateAsync', async () => {
        const result = await validateAsync({ email: 'taken@example.com' }, {
            email: ['required|email', async value => value === 'taken@example.com' ? 'email is already taken' : null],
        });

        expect(result.valid).toBe(false);
        expect(result.errors.email).toContain('email is already taken');
    });

    it('throws a structured validation error from assertValid', () => {
        expect(() => assertValid({}, { name: 'required' })).toThrow('Validation failed');
    });
});
