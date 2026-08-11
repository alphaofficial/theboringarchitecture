import { describe, expect, it } from 'vitest';
import { Validation } from '../app/support/validation.js';

describe('validate', () => {
    it('returns filtered validated data for passing rules', () => {
        const result = Validation.validate({ email: 'user@example.com', password: 'secret123', password_confirmation: 'secret123', ignored: true }, {
            email: 'required|email',
            password: 'required|min:8|confirmed',
        });

        expect(result.valid).toBe(true);
        expect(result.data).toEqual({ email: 'user@example.com', password: 'secret123' });
        expect(result.errors).toEqual({});
    });

    it('collects field errors for failed rules', () => {
        const result = Validation.validate({ email: 'nope', password: 'short', password_confirmation: 'different' }, {
            email: 'required|email',
            password: 'required|min:8|confirmed',
        });

        expect(result.valid).toBe(false);
        expect(result.errors.email).toContain('email must be a valid email address');
        expect(result.errors.password).toContain('password must be at least 8');
        expect(result.errors.password).toContain('password confirmation does not match');
    });

    it('validates nested paths and wildcard array entries', () => {
        const result = Validation.validate({
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
        const result = Validation.validate({ role: 'guest', profile: null }, {
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
        const result = Validation.validate({
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
        const result = Validation.validate({ name: '' }, {
            name: ['bail', 'required', () => 'should not run after required'],
        });

        expect(result.errors.name).toEqual(['name is required']);
    });

    it('supports async custom rules through validateAsync', async () => {
        const result = await Validation.validateAsync({ email: 'taken@example.com' }, {
            email: ['required|email', async value => value === 'taken@example.com' ? 'email is already taken' : null],
        });

        expect(result.valid).toBe(false);
        expect(result.errors.email).toContain('email is already taken');
    });

    it('throws a structured validation error from assert', () => {
        expect(() => Validation.assert({}, { name: 'required' })).toThrow('Validation failed');
    });

    it('uses custom messages and labels when formatting errors', () => {
        const result = Validation.validate({ email: '', profile: { display_name: 'A' } }, {
            email: 'required|email',
            'profile.display_name': 'min:3',
        }, {
            labels: {
                email: 'email address',
                'profile.display_name': 'display name',
            },
            messages: {
                'email.required': 'Please enter your :attribute.',
                min: ':Attribute needs at least :min characters.',
            },
        });

        expect(result.errors.email).toEqual(['Please enter your email address.']);
        expect(result.errors['profile.display_name']).toEqual(['Display name needs at least 3 characters.']);
    });

    it('returns named error bags without changing the field error shape', () => {
        const result = Validation.validate({}, { email: 'required' }, { errorBag: 'profile' });

        expect(result.errors).toEqual({ email: ['email is required'] });
        expect(result.errorBag).toBe('profile');
        expect(result.errorBags).toEqual({ profile: result.errors });
    });

    it('checks database-backed unique and exists rules asynchronously', async () => {
        const db = {
            async count(table, where) {
                if (table === 'users' && where.email === 'taken@example.com') return 1;
                if (table === 'teams' && where.slug === 'engineering') return 1;
                return 0;
            },
        };

        const result = await Validation.validateAsync({ email: 'taken@example.com', team: 'missing' }, {
            email: 'required|email|unique:users,email',
            team: 'required|exists:teams,slug',
        }, { db, labels: { team: 'team slug' } });

        expect(result.errors.email).toContain('email has already been taken');
        expect(result.errors.team).toContain('team slug must reference an existing record');
    });

    it('can query database-backed rules through a connection adapter', async () => {
        const queries = [];
        const db = {
            getConnection() {
                return {
                    async execute(sql, params) {
                        queries.push({ sql, params });
                        return params[0] === 'taken@example.com' ? [{ id: 'u1' }] : [];
                    },
                };
            },
        };

        const result = await Validation.validateAsync({ email: 'taken@example.com' }, {
            email: 'unique:users,email',
        }, { db });

        expect(result.errors.email).toEqual(['email has already been taken']);
        expect(queries[0]).toEqual({
            sql: 'select 1 from "users" where "email" = ? limit 1',
            params: ['taken@example.com'],
        });
    });

    it('validates uploaded file shape, size, images, extensions, and MIME types', () => {
        const result = Validation.validate({
            avatar: { originalname: 'avatar.gif', mimetype: 'image/gif', size: 3 * 1024 },
            document: { originalname: 'notes.txt', mimetype: 'text/plain', size: 512 },
        }, {
            avatar: 'required|file|image|mimes:jpg,png|max:2',
            document: 'file|mimetypes:application/pdf',
        });

        expect(result.errors.avatar).toContain('avatar must be a file of type: jpg, png');
        expect(result.errors.avatar).toContain('avatar must be at most 2 kilobytes');
        expect(result.errors.document).toContain('document must have MIME type: application/pdf');
    });
});
