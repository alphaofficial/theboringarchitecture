/**
 * Rule-based validation helper for controllers, middleware, and tests.
 *
 * Supports nested paths (`user.email`), wildcard paths (`items.*.sku`),
 * pipe-delimited rules, array rules, object rules, and custom rule functions.
 */

const implicitRules = new Set(['accepted', 'declined', 'filled', 'present', 'required']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Return true for non-array objects used as rule maps and option bags. */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Determine whether a value should fail implicit presence rules. */
function isEmpty(value) {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

/** Read a dot-notated value from nested validation data. */
function getValue(data, path) {
    return path.split('.').reduce((value, segment) => {
        if (value === undefined || value === null) return undefined;
        return value[segment];
    }, data);
}

/** Write a dot-notated value into the validated output payload. */
function setValue(data, path, value) {
    const segments = path.split('.');
    let cursor = data;
    for (const segment of segments.slice(0, -1)) {
        if (!isObject(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment];
    }
    cursor[segments.at(-1)] = value;
}

/** Expand wildcard field paths such as items.*.sku against the input data. */
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

/** Normalize a string, object, or function rule into an executable rule descriptor. */
function parseRule(rule) {
    if (typeof rule === 'function') return { name: 'custom', args: [], callback: rule };
    if (isObject(rule)) return rule;
    const [name, rawArgs = ''] = String(rule).split(/:(.*)/s);
    return { name, args: rawArgs === '' ? [] : rawArgs.split(',') };
}

/** Convert one field's rule declaration into an ordered rule list. */
function asRules(rules) {
    if (typeof rules === 'string') return rules.split('|').filter(Boolean).map(parseRule);
    if (Array.isArray(rules)) return rules.map(parseRule);
    if (typeof rules === 'function' || isObject(rules)) return [parseRule(rules)];
    return [];
}

/** Convert numeric path segments back to wildcard keys for custom messages. */
function wildcardKey(field) {
    return field.replace(/\.\d+(?=\.|$)/g, '.*');
}

/** Resolve a human-readable field label from labels/attributes options. */
function label(field, options = {}) {
    const labels = options.labels || options.attributes || {};
    return labels[field] || labels[wildcardKey(field)] || field.replace(/\.\d+\./g, '.').replaceAll('.', ' ').replaceAll('_', ' ');
}

/** Fill validation message placeholders like :attribute and :max. */
function interpolate(template, field, rule, args, options) {
    const attribute = label(field, options);
    const replacements = {
        attribute,
        Attribute: attribute.charAt(0).toUpperCase() + attribute.slice(1),
        rule,
        value: args[0] ?? '',
        min: args[0] ?? '',
        max: args[0] ?? '',
        size: args[0] ?? '',
        other: args[0] ?? '',
        values: args.join(', '),
    };
    return template.replace(/:(Attribute|attribute|rule|value|min|max|size|other|values)/g, (_, key) => String(replacements[key] ?? ''));
}

/** Build the validation error message for one failed rule. */
function message(field, rule, args, options = {}) {
    const messages = options.messages || {};
    const custom = messages[`${field}.${rule}`] || messages[`${wildcardKey(field)}.${rule}`] || messages[rule];
    if (custom) return interpolate(custom, field, rule, args, options);
    const name = label(field, options);
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
        case 'exists': return `${name} must reference an existing record`;
        case 'file': return `${name} must be a file`;
        case 'filled': return `${name} must not be empty`;
        case 'image': return `${name} must be an image`;
        case 'in': return `${name} must be one of: ${args.join(', ')}`;
        case 'integer': return `${name} must be an integer`;
        case 'lowercase': return `${name} must be lowercase`;
        case 'max': return `${name} must be at most ${args[0]}`;
        case 'max_file': return `${name} must be at most ${args[0]} kilobytes`;
        case 'mimes': return `${name} must be a file of type: ${args.join(', ')}`;
        case 'mimetypes': return `${name} must have MIME type: ${args.join(', ')}`;
        case 'min': return `${name} must be at least ${args[0]}`;
        case 'min_file': return `${name} must be at least ${args[0]} kilobytes`;
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
        case 'unique': return `${name} has already been taken`;
        case 'uppercase': return `${name} must be uppercase`;
        case 'url': return `${name} must be a valid URL`;
        case 'uuid': return `${name} must be a valid UUID`;
        default: return `${name} is invalid`;
    }
}

/** Measure numbers, strings, arrays, and objects for size rules. */
function lengthOf(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' || Array.isArray(value)) return value.length;
    if (isObject(value)) return Object.keys(value).length;
    return Number.NaN;
}

/** Compare two date-like values for before/after rules. */
function compareDate(value, other, operator) {
    const first = Date.parse(value);
    const second = Date.parse(other);
    if (Number.isNaN(first) || Number.isNaN(second)) return false;
    return operator === 'after' ? first > second : first < second;
}

/** Detect the minimal uploaded-file shape used by file validation rules. */
function isUploadedFile(value) {
    return isObject(value)
        && (typeof value.size === 'number' || typeof value.path === 'string' || Buffer.isBuffer(value.buffer))
        && (typeof value.originalname === 'string' || typeof value.name === 'string' || typeof value.filename === 'string');
}

/** Return the lowercase extension for an uploaded file name. */
function fileExtension(value) {
    const name = value?.originalname || value?.name || value?.filename || '';
    const extension = String(name).split('.').pop();
    return extension && extension !== name ? extension.toLowerCase() : '';
}

/** Convert uploaded file size bytes to kilobytes for min/max file rules. */
function fileSizeKilobytes(value) {
    return typeof value?.size === 'number' ? value.size / 1024 : Number.NaN;
}

/** Choose string/object size or uploaded-file size for min/max/size rules. */
function lengthForRule(value, rule) {
    if (isUploadedFile(value) && ['min', 'max', 'between', 'size'].includes(rule)) return fileSizeKilobytes(value);
    return lengthOf(value);
}

/** Pick the message key for scalar size rules versus file size rules. */
function sizeRuleName(rule, value) {
    return isUploadedFile(value) && ['min', 'max'].includes(rule) ? `${rule}_file` : rule;
}

/** Detect async database-backed rules before choosing sync validation. */
function hasDatabaseRule(ruleList) {
    return ruleList.some(rule => ['unique', 'exists'].includes(rule.name));
}

/** Quote a SQL identifier for the fallback db.get()/db.all() rule adapter. */
function quoteIdentifier(identifier) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
        throw new Error(`Unsafe database identifier in validation rule: ${identifier}`);
    }
    return `"${identifier}"`;
}

/** Count matching rows through the request db context for unique/exists rules. */
async function databaseCount(db, table, column, value, exceptValue, idColumn = 'id') {
    if (!db) throw new Error('Database validation rules require a db option.');
    if (typeof db.getConnection === 'function') {
        const params = [value];
        let sql = `select 1 from ${quoteIdentifier(table)} where ${quoteIdentifier(column)} = ?`;
        if (exceptValue !== undefined && exceptValue !== '') {
            sql += ` and ${quoteIdentifier(idColumn)} <> ?`;
            params.push(exceptValue);
        }
        sql += ' limit 1';
        const rows = await db.getConnection().execute(sql, params);
        return Array.isArray(rows) && rows.length ? 1 : 0;
    }
    const where = { [column]: value };
    if (exceptValue !== undefined && exceptValue !== '') where[idColumn] = { $ne: exceptValue };
    if (typeof db.count === 'function') return db.count(table, where);
    if (typeof db.findOne === 'function') return (await db.findOne(table, where)) ? 1 : 0;
    if (typeof db.getRepository === 'function') return db.getRepository(table).count(where);
    throw new Error('Unsupported database adapter for validation rules.');
}

/** Execute one built-in non-database rule and return an error message on failure. */
function runBuiltIn(rule, value, field, data, options = {}) {
    const { name, args = [] } = rule;
    if (!implicitRules.has(name) && isEmpty(value)) return null;

    if (['unique', 'exists'].includes(name)) throw new Error('Database validation rule used with validate(); use validateAsync().');
    if (name === 'accepted') return ['yes', 'on', '1', 1, true, 'true'].includes(value) ? null : message(field, name, args, options);
    if (name === 'after') return compareDate(value, getValue(data, args[0]) ?? args[0], 'after') ? null : `${label(field, options)} must be after ${args[0]}`;
    if (name === 'array') return Array.isArray(value) ? null : message(field, name, args, options);
    if (name === 'before') return compareDate(value, getValue(data, args[0]) ?? args[0], 'before') ? null : `${label(field, options)} must be before ${args[0]}`;
    if (name === 'between') {
        const size = lengthForRule(value, name);
        return size >= Number(args[0]) && size <= Number(args[1]) ? null : message(field, name, args, options);
    }
    if (name === 'boolean') return typeof value === 'boolean' || ['true', 'false', '1', '0', 1, 0].includes(value) ? null : message(field, name, args, options);
    if (name === 'confirmed') return value === getValue(data, `${field}_confirmation`) ? null : message(field, name, args, options);
    if (name === 'date') return !Number.isNaN(Date.parse(value)) ? null : message(field, name, args, options);
    if (name === 'declined') return ['no', 'off', '0', 0, false, 'false'].includes(value) ? null : message(field, name, args, options);
    if (name === 'different') return value !== getValue(data, args[0]) ? null : message(field, name, args, options);
    if (name === 'email') return emailPattern.test(String(value)) ? null : message(field, name, args, options);
    if (name === 'file') return isUploadedFile(value) ? null : message(field, name, args, options);
    if (name === 'filled') return !isEmpty(value) ? null : message(field, name, args, options);
    if (name === 'image') return isUploadedFile(value) && String(value.mimetype || value.type || '').startsWith('image/') ? null : message(field, name, args, options);
    if (name === 'in') return args.includes(String(value)) ? null : message(field, name, args, options);
    if (name === 'integer') return Number.isInteger(typeof value === 'number' ? value : Number(value)) ? null : message(field, name, args, options);
    if (name === 'lowercase') return String(value) === String(value).toLowerCase() ? null : message(field, name, args, options);
    if (name === 'max') return lengthForRule(value, name) <= Number(args[0]) ? null : message(field, sizeRuleName(name, value), args, options);
    if (name === 'mimes') return args.map(arg => arg.toLowerCase()).includes(fileExtension(value)) ? null : message(field, name, args, options);
    if (name === 'mimetypes') return args.includes(String(value?.mimetype || value?.type || '')) ? null : message(field, name, args, options);
    if (name === 'min') return lengthForRule(value, name) >= Number(args[0]) ? null : message(field, sizeRuleName(name, value), args, options);
    if (name === 'not_in') return !args.includes(String(value)) ? null : message(field, name, args, options);
    if (name === 'not_regex') return !(new RegExp(args.join(':')).test(String(value))) ? null : message(field, name, args, options);
    if (name === 'nullable') return null;
    if (name === 'number' || name === 'numeric') return value !== '' && !Number.isNaN(Number(value)) ? null : message(field, name, args, options);
    if (name === 'object') return isObject(value) ? null : message(field, name, args, options);
    if (name === 'present') return value !== undefined ? null : message(field, name, args, options);
    if (name === 'regex') return new RegExp(args.join(':')).test(String(value)) ? null : message(field, name, args, options);
    if (name === 'required') return !isEmpty(value) ? null : message(field, name, args, options);
    if (name === 'required_if') return String(getValue(data, args[0])) === args[1] && isEmpty(value) ? message(field, 'required', args, options) : null;
    if (name === 'same') return value === getValue(data, args[0]) ? null : message(field, name, args, options);
    if (name === 'size') return lengthForRule(value, name) === Number(args[0]) ? null : message(field, name, args, options);
    if (name === 'starts_with') return args.some(arg => String(value).startsWith(arg)) ? null : message(field, name, args, options);
    if (name === 'ends_with') return args.some(arg => String(value).endsWith(arg)) ? null : `${label(field, options)} must end with one of: ${args.join(', ')}`;
    if (name === 'string') return typeof value === 'string' ? null : message(field, name, args, options);
    if (name === 'uppercase') return String(value) === String(value).toUpperCase() ? null : message(field, name, args, options);
    if (name === 'url') {
        try { new URL(String(value)); return null; } catch { return message(field, name, args, options); }
    }
    if (name === 'uuid') return uuidPattern.test(String(value)) ? null : message(field, name, args, options);
    return null;
}

/** Apply nullable/sometimes/exclude_if controls before running normal rules. */
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

/** Create mutable state for errors, validated data, and excluded fields. */
function createValidationState(data) {
    return {
        input: isObject(data) || Array.isArray(data) ? data : {},
        errors: {},
        validated: {},
    };
}

/** Record one field's errors or validated value into the validation state. */
function finishField(state, field, value, fieldErrors) {
    if (fieldErrors.length) {
        state.errors[field] = fieldErrors;
    }
    else if (!isEmpty(value)) {
        setValue(state.validated, field, value);
    }
}

/** Build the public validation result object from accumulated state. */
function finishValidation(state, options = {}) {
    const result = { valid: Object.keys(state.errors).length === 0, data: state.validated, errors: state.errors };
    if (options.errorBag) {
        result.errorBag = options.errorBag;
        result.errorBags = { [options.errorBag]: state.errors };
    }
    return result;
}

/** Run the synchronous validation pipeline. */
function runValidation(data, rules, options = {}) {
    const state = createValidationState(data);
    for (const [pattern, rawRules] of Object.entries(rules)) {
        const ruleList = asRules(rawRules);
        if (hasDatabaseRule(ruleList)) throw new Error('Database validation rule used with validate(); use validateAsync().');
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
                    error = runBuiltIn(rule, value, field, state.input, options);
                }
                if (typeof error === 'string' && error.length > 0) {
                    fieldErrors.push(error);
                    if (ruleList.some(item => item.name === 'bail')) break;
                }
            }
            finishField(state, field, value, fieldErrors);
        }
    }
    return finishValidation(state, options);
}

/** Execute one async unique/exists database rule. */
async function runDatabaseRule(rule, value, field, options) {
    const [table, column = field, exceptValue, idColumn = 'id'] = rule.args || [];
    if (!table) throw new Error(`${rule.name} validation requires a table name.`);
    const count = await databaseCount(options.db, table, column, value, exceptValue, idColumn);
    if (rule.name === 'unique') return Number(count) === 0 ? null : message(field, 'unique', rule.args, options);
    return Number(count) > 0 ? null : message(field, 'exists', rule.args, options);
}

/** Run the validation pipeline including database and async custom rules. */
async function runValidationAsync(data, rules, options = {}) {
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
                else if (['unique', 'exists'].includes(rule.name)) {
                    error = await runDatabaseRule(rule, value, field, options);
                }
                else {
                    error = runBuiltIn(rule, value, field, state.input, options);
                }
                if (typeof error === 'string' && error.length > 0) {
                    fieldErrors.push(error);
                    if (ruleList.some(item => item.name === 'bail')) break;
                }
            }
            finishField(state, field, value, fieldErrors);
        }
    }
    return finishValidation(state, options);
}

/**
 * Validate input and return filtered data plus field-level errors.
 *
 * @param {unknown} data Untrusted input, usually req.body.
 * @param {Record<string, string|Array<string|Function>|Function|object>} rules Field rules.
 * @param {{messages?: Record<string, string>, labels?: Record<string, string>, attributes?: Record<string, string>, errorBag?: string}} [options]
 * @returns {{valid: boolean, data: Record<string, unknown>, errors: Record<string, string[]>, errorBag?: string, errorBags?: Record<string, Record<string, string[]>>}}
 */
/** Validate data synchronously and return errors plus validated values. */
function validate(data, rules, options = {}) {
    return runValidation(data, rules, options);
}

/** Validate input with async custom rule and database-backed rule support. */
/** Validate data asynchronously for database and async custom rules. */
function validateAsync(data, rules, options = {}) {
    return runValidationAsync(data, rules, options);
}

/**
 * Express middleware/handler helper. Throws a validation error so global error
 * handling can render or serialize it consistently.
 */
/** Validate data and throw a structured ValidationError when it fails. */
function assert(data, rules, options = {}) {
    const result = validate(data, rules, options);
    if (!result.valid) {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.status = 422;
        error.errors = result.errors;
        error.errorBag = result.errorBag;
        error.errorBags = result.errorBags;
        throw error;
    }
    return result.data;
}

/** Async variant of assert. */
async function assertAsync(data, rules, options = {}) {
    const result = await validateAsync(data, rules, options);
    if (!result.valid) {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.status = 422;
        error.errors = result.errors;
        error.errorBag = result.errorBag;
        error.errorBags = result.errorBags;
        throw error;
    }
    return result.data;
}

/** Merge request body, query, params, and files into the validation input payload. */
function requestValidationInput(req) {
    return {
        ...(isObject(req.body) ? req.body : {}),
        ...(isObject(req.file) ? { file: req.file } : {}),
        ...(isObject(req.files) && !Array.isArray(req.files) ? req.files : {}),
        ...(Array.isArray(req.files) ? { files: req.files } : {}),
    };
}

/**
 * Express middleware for request-level validation without per-request classes.
 * Successful validation writes filtered fields to `req.validated`.
 */
/** Build Express middleware that validates a request and assigns req.validated. */
function request(rules, options = {}) {
    return async (req, res, next) => {
        const validationOptions = {
            ...options,
            db: options.db || req.ctx?.db,
        };
        const result = await validateAsync(requestValidationInput(req), rules, validationOptions);
        if (result.valid) {
            req.validated = result.data;
            return next();
        }
        if (options.page && typeof res.render === 'function') {
            return res.status(422).render(options.page, {
                ...(options.props || {}),
                errors: result.errors,
                errorBag: result.errorBag,
                errorBags: result.errorBags,
            });
        }
        return res.status(422).json({ errors: result.errors, errorBag: result.errorBag, errorBags: result.errorBags });
    };
}

/** Validation facade for sync, async, assertion, and Express request validation. */
export const Validation = Object.freeze({
    validate,
    validateAsync,
    assert,
    assertAsync,
    request,
});
