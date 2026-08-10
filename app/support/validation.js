/**
 * Rule-based validation helper for controllers, middleware, and tests.
 *
 * Supports nested paths (`user.email`), wildcard paths (`items.*.sku`),
 * pipe-delimited rules, array rules, object rules, and custom rule functions.
 */

const implicitRules = new Set(['accepted', 'declined', 'filled', 'present', 'required']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEmpty(value) {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function getValue(data, path) {
    return path.split('.').reduce((value, segment) => {
        if (value === undefined || value === null) return undefined;
        return value[segment];
    }, data);
}

function setValue(data, path, value) {
    const segments = path.split('.');
    let cursor = data;
    for (const segment of segments.slice(0, -1)) {
        if (!isObject(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment];
    }
    cursor[segments.at(-1)] = value;
}

function expandWildcardPaths(data, pattern) {
    if (!pattern.includes('*')) return [pattern];
    const segments = pattern.split('.');
    const paths = [];

    function walk(value, index, current) {
        if (index === segments.length) {
            paths.push(current.join('.'));
            return;
        }
        const segment = segments[index];
        if (segment === '*') {
            if (!Array.isArray(value)) return;
            value.forEach((item, itemIndex) => walk(item, index + 1, [...current, String(itemIndex)]));
            return;
        }
        walk(value?.[segment], index + 1, [...current, segment]);
    }

    walk(data, 0, []);
    return paths.length ? paths : [pattern];
}

function parseRule(rule) {
    if (typeof rule === 'function') return { name: 'custom', args: [], callback: rule };
    if (isObject(rule)) return rule;
    const [name, rawArgs = ''] = String(rule).split(/:(.*)/s);
    return { name, args: rawArgs === '' ? [] : rawArgs.split(',') };
}

function asRules(rules) {
    if (typeof rules === 'string') return rules.split('|').filter(Boolean).map(parseRule);
    if (Array.isArray(rules)) return rules.map(parseRule);
    if (typeof rules === 'function' || isObject(rules)) return [parseRule(rules)];
    return [];
}

function label(field) {
    return field.replace(/\.\d+\./g, '.').replaceAll('.', ' ').replaceAll('_', ' ');
}

function message(field, rule, args) {
    const name = label(field);
    switch (rule) {
        case 'accepted': return `${name} must be accepted`;
        case 'array': return `${name} must be an array`;
        case 'between': return `${name} must be between ${args[0]} and ${args[1]}`;
        case 'boolean': return `${name} must be true or false`;
        case 'confirmed': return `${name} confirmation does not match`;
        case 'date': return `${name} must be a valid date`;
        case 'declined': return `${name} must be declined`;
        case 'different': return `${name} must be different from ${args[0]}`;
        case 'email': return `${name} must be a valid email address`;
        case 'filled': return `${name} must not be empty`;
        case 'in': return `${name} must be one of: ${args.join(', ')}`;
        case 'integer': return `${name} must be an integer`;
        case 'lowercase': return `${name} must be lowercase`;
        case 'max': return `${name} must be at most ${args[0]}`;
        case 'min': return `${name} must be at least ${args[0]}`;
        case 'not_in': return `${name} must not be one of: ${args.join(', ')}`;
        case 'not_regex': return `${name} format is invalid`;
        case 'number':
        case 'numeric': return `${name} must be a number`;
        case 'object': return `${name} must be an object`;
        case 'present': return `${name} must be present`;
        case 'regex': return `${name} format is invalid`;
        case 'required': return `${name} is required`;
        case 'same': return `${name} must match ${args[0]}`;
        case 'size': return `${name} must have size ${args[0]}`;
        case 'starts_with': return `${name} must start with one of: ${args.join(', ')}`;
        case 'string': return `${name} must be a string`;
        case 'uppercase': return `${name} must be uppercase`;
        case 'url': return `${name} must be a valid URL`;
        case 'uuid': return `${name} must be a valid UUID`;
        default: return `${name} is invalid`;
    }
}

function lengthOf(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' || Array.isArray(value)) return value.length;
    if (isObject(value)) return Object.keys(value).length;
    return Number.NaN;
}

function compareDate(value, other, operator) {
    const first = Date.parse(value);
    const second = Date.parse(other);
    if (Number.isNaN(first) || Number.isNaN(second)) return false;
    return operator === 'after' ? first > second : first < second;
}

function runBuiltIn(rule, value, field, data) {
    const { name, args = [] } = rule;
    if (!implicitRules.has(name) && isEmpty(value)) return null;

    if (name === 'accepted') return ['yes', 'on', '1', 1, true, 'true'].includes(value) ? null : message(field, name, args);
    if (name === 'after') return compareDate(value, getValue(data, args[0]) ?? args[0], 'after') ? null : `${label(field)} must be after ${args[0]}`;
    if (name === 'array') return Array.isArray(value) ? null : message(field, name, args);
    if (name === 'before') return compareDate(value, getValue(data, args[0]) ?? args[0], 'before') ? null : `${label(field)} must be before ${args[0]}`;
    if (name === 'between') {
        const size = lengthOf(value);
        return size >= Number(args[0]) && size <= Number(args[1]) ? null : message(field, name, args);
    }
    if (name === 'boolean') return typeof value === 'boolean' || ['true', 'false', '1', '0', 1, 0].includes(value) ? null : message(field, name, args);
    if (name === 'confirmed') return value === getValue(data, `${field}_confirmation`) ? null : message(field, name, args);
    if (name === 'date') return !Number.isNaN(Date.parse(value)) ? null : message(field, name, args);
    if (name === 'declined') return ['no', 'off', '0', 0, false, 'false'].includes(value) ? null : message(field, name, args);
    if (name === 'different') return value !== getValue(data, args[0]) ? null : message(field, name, args);
    if (name === 'email') return emailPattern.test(String(value)) ? null : message(field, name, args);
    if (name === 'filled') return !isEmpty(value) ? null : message(field, name, args);
    if (name === 'in') return args.includes(String(value)) ? null : message(field, name, args);
    if (name === 'integer') return Number.isInteger(typeof value === 'number' ? value : Number(value)) ? null : message(field, name, args);
    if (name === 'lowercase') return String(value) === String(value).toLowerCase() ? null : message(field, name, args);
    if (name === 'max') return lengthOf(value) <= Number(args[0]) ? null : message(field, name, args);
    if (name === 'min') return lengthOf(value) >= Number(args[0]) ? null : message(field, name, args);
    if (name === 'not_in') return !args.includes(String(value)) ? null : message(field, name, args);
    if (name === 'not_regex') return !(new RegExp(args.join(':')).test(String(value))) ? null : message(field, name, args);
    if (name === 'nullable') return null;
    if (name === 'number' || name === 'numeric') return value !== '' && !Number.isNaN(Number(value)) ? null : message(field, name, args);
    if (name === 'object') return isObject(value) ? null : message(field, name, args);
    if (name === 'present') return value !== undefined ? null : message(field, name, args);
    if (name === 'regex') return new RegExp(args.join(':')).test(String(value)) ? null : message(field, name, args);
    if (name === 'required') return !isEmpty(value) ? null : message(field, name, args);
    if (name === 'required_if') return String(getValue(data, args[0])) === args[1] && isEmpty(value) ? message(field, 'required', args) : null;
    if (name === 'same') return value === getValue(data, args[0]) ? null : message(field, name, args);
    if (name === 'size') return lengthOf(value) === Number(args[0]) ? null : message(field, name, args);
    if (name === 'starts_with') return args.some(arg => String(value).startsWith(arg)) ? null : message(field, name, args);
    if (name === 'ends_with') return args.some(arg => String(value).endsWith(arg)) ? null : `${label(field)} must end with one of: ${args.join(', ')}`;
    if (name === 'string') return typeof value === 'string' ? null : message(field, name, args);
    if (name === 'uppercase') return String(value) === String(value).toUpperCase() ? null : message(field, name, args);
    if (name === 'url') {
        try { new URL(String(value)); return null; } catch { return message(field, name, args); }
    }
    if (name === 'uuid') return uuidPattern.test(String(value)) ? null : message(field, name, args);
    return null;
}

function shouldSkipField(ruleList, value, field, data) {
    const names = ruleList.map(rule => rule.name);
    if (names.includes('sometimes') && value === undefined) return true;
    if (names.includes('nullable') && value === null) return true;
    if (names.includes('exclude_if')) {
        const rule = ruleList.find(item => item.name === 'exclude_if');
        if (String(getValue(data, rule.args[0])) === rule.args[1]) return true;
    }
    return false;
}

function createValidationState(data) {
    return {
        input: isObject(data) || Array.isArray(data) ? data : {},
        errors: {},
        validated: {},
    };
}

function finishField(state, field, value, fieldErrors) {
    if (fieldErrors.length) {
        state.errors[field] = fieldErrors;
    }
    else if (!isEmpty(value)) {
        setValue(state.validated, field, value);
    }
}

function finishValidation(state) {
    return { valid: Object.keys(state.errors).length === 0, data: state.validated, errors: state.errors };
}

function runValidation(data, rules) {
    const state = createValidationState(data);
    for (const [pattern, rawRules] of Object.entries(rules)) {
        const ruleList = asRules(rawRules);
        for (const field of expandWildcardPaths(state.input, pattern)) {
            const value = getValue(state.input, field);
            if (shouldSkipField(ruleList, value, field, state.input)) continue;

            const fieldErrors = [];
            for (const rule of ruleList) {
                if (['bail', 'nullable', 'sometimes', 'exclude_if'].includes(rule.name)) continue;
                let error = null;
                if (rule.name === 'custom') {
                    error = rule.callback(value, field, state.input);
                    if (error instanceof Promise) throw new Error('Async validation rule used with validate(); use validateAsync().');
                }
                else {
                    error = runBuiltIn(rule, value, field, state.input);
                }
                if (typeof error === 'string' && error.length > 0) {
                    fieldErrors.push(error);
                    if (ruleList.some(item => item.name === 'bail')) break;
                }
            }
            finishField(state, field, value, fieldErrors);
        }
    }
    return finishValidation(state);
}

async function runValidationAsync(data, rules) {
    const state = createValidationState(data);
    for (const [pattern, rawRules] of Object.entries(rules)) {
        const ruleList = asRules(rawRules);
        for (const field of expandWildcardPaths(state.input, pattern)) {
            const value = getValue(state.input, field);
            if (shouldSkipField(ruleList, value, field, state.input)) continue;

            const fieldErrors = [];
            for (const rule of ruleList) {
                if (['bail', 'nullable', 'sometimes', 'exclude_if'].includes(rule.name)) continue;
                let error = null;
                if (rule.name === 'custom') {
                    error = await rule.callback(value, field, state.input);
                }
                else {
                    error = runBuiltIn(rule, value, field, state.input);
                }
                if (typeof error === 'string' && error.length > 0) {
                    fieldErrors.push(error);
                    if (ruleList.some(item => item.name === 'bail')) break;
                }
            }
            finishField(state, field, value, fieldErrors);
        }
    }
    return finishValidation(state);
}

/**
 * Validate input and return filtered data plus field-level errors.
 *
 * @param {unknown} data Untrusted input, usually req.body.
 * @param {Record<string, string|Array<string|Function>|Function|object>} rules Field rules.
 * @returns {{valid: boolean, data: Record<string, unknown>, errors: Record<string, string[]>}}
 */
export function validate(data, rules) {
    return runValidation(data, rules);
}

/** Validate input with async custom rule support. */
export function validateAsync(data, rules) {
    return runValidationAsync(data, rules);
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

/** Async variant of assertValid. */
export async function assertValidAsync(data, rules) {
    const result = await validateAsync(data, rules);
    if (!result.valid) {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.status = 422;
        error.errors = result.errors;
        throw error;
    }
    return result.data;
}

/**
 * Express middleware for request-level validation without per-request classes.
 * Successful validation writes filtered fields to `req.validated`.
 */
export function validateRequest(rules, options = {}) {
    return async (req, res, next) => {
        const result = await validateAsync(req.body, rules);
        if (result.valid) {
            req.validated = result.data;
            return next();
        }
        if (options.page && typeof res.render === 'function') {
            return res.status(422).render(options.page, {
                ...(options.props || {}),
                errors: result.errors,
            });
        }
        return res.status(422).json({ errors: result.errors });
    };
}
