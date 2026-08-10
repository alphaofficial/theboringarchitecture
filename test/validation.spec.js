import { describe, expect, it } from 'vitest';
import { assertValid, validate } from '../app/support/validation.js';

describe('validate', () => {
    it('returns validated data for passing rules', () => {
        const result = validate({ email: 'user@example.com', password: 'secret123', password_confirmation: 'secret123' }, {
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
        expect(result.errors.password).toContain('password must be at least 8 characters');
        expect(result.errors.password).toContain('password confirmation does not match');
    });

    it('throws a Laravel-style validation error from assertValid', () => {
        expect(() => assertValid({}, { name: 'required' })).toThrow('Validation failed');
    });
});
