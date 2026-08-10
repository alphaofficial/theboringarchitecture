/**
 * Small Laravel-inspired validation helper for controllers and tests.
 *
 * Rules may be strings like "required|email|min:8|confirmed" or arrays of
 * rule names/functions. Custom rules return a message string when invalid.
 */

function valueAt(data, field) {
    return data && typeof data === 'object' ? data[field] : undefined;
}

function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

function asRules(rules) {
    if (typeof rules === 'string') {
        return rules.split('|').filter(Boolean);
    }
    if (Array.isArray(rules)) {
        return rules;
    }
    return [];
}

function message(field, rule, arg) {
    const label = field.replaceAll('_', ' ');
    switch (rule) {
        case 'required': return `${label} is required`;
        case 'email': return `${label} must be a valid email address`;
        case 'string': return `${label} must be a string`;
        case 'number': return `${label} must be a number`;
        case 'boolean': return `${label} must be true or false`;
        case 'min': return `${label} must be at least ${arg} characters`;
        case 'max': return `${label} must be at most ${arg} characters`;
        case 'confirmed': return `${label} confirmation does not match`;
        default: return `${label} is invalid`;
    }
}

function passesRule(rule, value, field, data) {
    if (typeof rule === 'function') {
        return rule(value, field, data);
    }

    const [name, arg] = String(rule).split(':');

    if (name !== 'required' && isEmpty(value)) {
        return null;
    }

    if (name === 'required' && isEmpty(value)) return message(field, name);
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return message(field, name);
    if (name === 'string' && typeof value !== 'string') return message(field, name);
    if (name === 'number' && (typeof value !== 'number' || Number.isNaN(value))) return message(field, name);
    if (name === 'boolean' && typeof value !== 'boolean') return message(field, name);
    if (name === 'min' && String(value).length < Number(arg)) return message(field, name, arg);
    if (name === 'max' && String(value).length > Number(arg)) return message(field, name, arg);
    if (name === 'confirmed' && value !== valueAt(data, `${field}_confirmation`)) return message(field, name);

    return null;
}

/**
 * Validate input and return Laravel-shaped data/errors.
 *
 * @param {unknown} data Untrusted input, usually req.body.
 * @param {Record<string, string|Array<string|Function>>} rules Field rules.
 * @returns {{valid: boolean, data: Record<string, unknown>, errors: Record<string, string[]>}}
 */
export function validate(data, rules) {
    const input = data && typeof data === 'object' ? data : {};
    const errors = {};
    const validated = {};

    for (const [field, ruleList] of Object.entries(rules)) {
        const value = valueAt(input, field);
        for (const rule of asRules(ruleList)) {
            const error = passesRule(rule, value, field, input);
            if (typeof error === 'string' && error.length > 0) {
                errors[field] = [...(errors[field] || []), error];
            }
        }
        if (!errors[field] && !isEmpty(value)) {
            validated[field] = value;
        }
    }

    return { valid: Object.keys(errors).length === 0, data: validated, errors };
}

/**
 * Express middleware/handler helper. Throws a validation error so global error
 * handling can render or serialize it consistently.
 */
export function assertValid(data, rules) {
    const result = validate(data, rules);
    if (!result.valid) {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.status = 422;
        error.errors = result.errors;
        throw error;
    }
    return result.data;
}
