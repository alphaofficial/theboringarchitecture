/**
 * Rule-based validation helper for controllers, middleware, and tests.
 *
 * Supports nested paths (`user.email`), wildcard paths (`items.*.sku`),
 * pipe-delimited rules, array rules, object rules, and custom rule functions.
 */

const implicitRules = new Set(['accepted', 'declined', 'filled', 'present', 'required']);
const emailPattern = /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Return true for non-array objects used as rule maps and option bags.
 * @param {string|number|boolean|null} value Candidate value.
  * @returns {boolean} Whether the condition is satisfied.
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determine whether a value should fail implicit presence rules.
 * @param {string|number|boolean|null} value Candidate value.
  * @returns {boolean} Whether the condition is satisfied.
 */
function isEmpty(value) {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Read a dot-notated value from nested validation data.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {string} path Resource path.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function getValue(data, path) {
    return path.split('.').reduce((value, segment) => {
        if (value === undefined || value === null) return undefined;
        return value[segment];
    }, data);
}

/**
 * Write a dot-notated value into the validated output payload.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {string} path Resource path.
 * @param {string|number|boolean|null} value Candidate value.
 */
function setValue(data, path, value) {
    const segments = path.split('.');
    let cursor = data;
    for (const segment of segments.slice(0, -1)) {
        if (!isObject(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment];
    }
    cursor[segments.at(-1)] = value;
}

/**
 * Expand wildcard field paths such as items.*.sku against the input data.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {string|RegExp} pattern Pattern value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function expandWildcardPaths(data, pattern) {
    if (!pattern.includes('*')) return [pattern];
    const segments = pattern.split('.');
    const paths = [];

    /**
     * Traverses a validation value path.
     *
     * @param {string|number|boolean|null} value Candidate value.
     * @param {number} index Index value.
     * @param {number} current Current value.
    * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
     */
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

/**
 * Normalize a string, object, or function rule into an executable rule descriptor.
 * @param {string|RegExp} rule Rule value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function parseRule(rule) {
    if (typeof rule === 'function') return { name: 'custom', args: [], callback: rule };
    if (isObject(rule)) return rule;
    const [name, rawArgs = ''] = String(rule).split(/:(.*)/s);
    return { name, args: rawArgs === '' ? [] : rawArgs.split(',') };
}

/**
 * Convert one field's rule declaration into an ordered rule list.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function asRules(rules) {
    if (typeof rules === 'string') return rules.split('|').filter(Boolean).map(parseRule);
    if (Array.isArray(rules)) return rules.map(parseRule);
    if (typeof rules === 'function' || isObject(rules)) return [parseRule(rules)];
    return [];
}

/**
 * Convert numeric path segments back to wildcard keys for custom messages.
 * @param {string} field Field value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function wildcardKey(field) {
    return field.replace(/\.\d+(?=\.|$)/g, '.*');
}

/**
 * Resolve a human-readable field label from labels/attributes options.
 * @param {string} field Field value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function label(field, options = {}) {
    const labels = options.labels || options.attributes || {};
    return labels[field] || labels[wildcardKey(field)] || field.replace(/\.\d+\./g, '.').replaceAll('.', ' ').replaceAll('_', ' ');
}

/**
 * Fill validation message placeholders like :attribute and :max.
 * @param {string} template Template value.
 * @param {string} field Field value.
 * @param {string|RegExp} rule Rule value.
 * @param {Record<string, string|number|boolean>} args Args value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {string} Interpolated validation message.
 */
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

/**
 * Build the validation error message for one failed rule.
 * @param {string} field Field value.
 * @param {string|RegExp} rule Rule value.
 * @param {Record<string, string|number|boolean>} args Args value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function message(field, rule, args, options = {}) {
    const messages = options.messages || {};
    const custom = messages[`${field}.${rule}`] || messages[`${wildcardKey(field)}.${rule}`] || messages[rule];
    if (custom) return interpolate(custom, field, rule, args, options);
    const name = label(field, options);
    const values = args.join(', ');
    const messagesByRule = {
        accepted: `${name} must be accepted`, array: `${name} must be an array`, between: `${name} must be between ${args[0]} and ${args[1]}`,
        boolean: `${name} must be true or false`, confirmed: `${name} confirmation does not match`, date: `${name} must be a valid date`,
        declined: `${name} must be declined`, different: `${name} must be different from ${args[0]}`, email: `${name} must be a valid email address`,
        exists: `${name} must reference an existing record`, file: `${name} must be a file`, filled: `${name} must not be empty`, image: `${name} must be an image`,
        in: `${name} must be one of: ${values}`, integer: `${name} must be an integer`, lowercase: `${name} must be lowercase`, max: `${name} must be at most ${args[0]}`,
        max_file: `${name} must be at most ${args[0]} kilobytes`, mimes: `${name} must be a file of type: ${values}`, mimetypes: `${name} must have MIME type: ${values}`,
        min: `${name} must be at least ${args[0]}`, min_file: `${name} must be at least ${args[0]} kilobytes`, not_in: `${name} must not be one of: ${values}`,
        not_regex: `${name} format is invalid`, number: `${name} must be a number`, numeric: `${name} must be a number`, object: `${name} must be an object`,
        present: `${name} must be present`, regex: `${name} format is invalid`, required: `${name} is required`, same: `${name} must match ${args[0]}`,
        size: `${name} must have size ${args[0]}`, starts_with: `${name} must start with one of: ${values}`, string: `${name} must be a string`,
        unique: `${name} has already been taken`, uppercase: `${name} must be uppercase`, url: `${name} must be a valid URL`, uuid: `${name} must be a valid UUID`,
    };
    return messagesByRule[rule] || `${name} is invalid`;
}

/**
 * Measure numbers, strings, arrays, and objects for size rules.
 * @param {string|number|boolean|null} value Candidate value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function lengthOf(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' || Array.isArray(value)) return value.length;
    if (isObject(value)) return Object.keys(value).length;
    return Number.NaN;
}

/**
 * Compare two date-like values for before/after rules.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {number} other Other value.
 * @param {string} operator Operator value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function compareDate(value, other, operator) {
    const first = Date.parse(value);
    const second = Date.parse(other);
    if (Number.isNaN(first) || Number.isNaN(second)) return false;
    return operator === 'after' ? first > second : first < second;
}

/**
 * Detect the minimal uploaded-file shape used by file validation rules.
 * @param {string|number|boolean|null} value Candidate value.
  * @returns {boolean} Whether the condition is satisfied.
 */
function isUploadedFile(value) {
    return isObject(value)
        && (typeof value.size === 'number' || typeof value.path === 'string' || Buffer.isBuffer(value.buffer))
        && (typeof value.originalname === 'string' || typeof value.name === 'string' || typeof value.filename === 'string');
}

/**
 * Return the lowercase extension for an uploaded file name.
 * @param {string|number|boolean|null} value Candidate value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function fileExtension(value) {
    const name = value?.originalname || value?.name || value?.filename || '';
    const extension = String(name).split('.').pop();
    return extension && extension !== name ? extension.toLowerCase() : '';
}

/**
 * Convert uploaded file size bytes to kilobytes for min/max file rules.
 * @param {string|number|boolean|null} value Candidate value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function fileSizeKilobytes(value) {
    return typeof value?.size === 'number' ? value.size / 1024 : Number.NaN;
}

/**
 * Choose string/object size or uploaded-file size for min/max/size rules.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string|RegExp} rule Rule value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function lengthForRule(value, rule) {
    if (isUploadedFile(value) && ['min', 'max', 'between', 'size'].includes(rule)) return fileSizeKilobytes(value);
    return lengthOf(value);
}

/**
 * Pick the message key for scalar size rules versus file size rules.
 * @param {string|RegExp} rule Rule value.
 * @param {string|number|boolean|null} value Candidate value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function sizeRuleName(rule, value) {
    return isUploadedFile(value) && ['min', 'max'].includes(rule) ? `${rule}_file` : rule;
}

/**
 * Detect async database-backed rules before choosing sync validation.
 * @param {string|string[]} ruleList Rules to inspect.
  * @returns {boolean} Whether the condition is satisfied.
 */
function hasDatabaseRule(ruleList) {
    return ruleList.some(rule => ['unique', 'exists'].includes(rule.name));
}

/**
 * Quote a SQL identifier for the fallback db.get()/db.all() rule adapter.
 * @param {string|number} identifier Identifier value.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function quoteIdentifier(identifier) {
    if (!/^[A-Za-z_]\w*$/.test(identifier)) {
        throw new Error(`Unsafe database identifier in validation rule: ${identifier}`);
    }
    return `"${identifier}"`;
}

/**
 * Count matching rows through the request db context for unique/exists rules.
 * @param {import('@mikro-orm/core').EntityManager} db Database entity manager.
 * @param {string} table Table value.
 * @param {string} column Column value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string|number|null} exceptValue Record identifier excluded from the count.
 * @param {string} idColumn Identifier column name.
 * @returns {Promise<number>} Matching row count.
 */
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

/**
 * Checks whether a value is a valid URL.
 *
 * @param {string|number|boolean|null} value Candidate value.
 * @returns {boolean} Whether the condition is satisfied.
 */
function isValidUrl(value) {
    try {
        return Boolean(new URL(String(value)));
    }
    catch {
        return false;
    }
}

const builtInValidators = {
    accepted: ({ value }) => ['yes', 'on', '1', 1, true, 'true'].includes(value),
    after: ({ value, args, data }) => compareDate(value, getValue(data, args[0]) ?? args[0], 'after'),
    array: ({ value }) => Array.isArray(value),
    before: ({ value, args, data }) => compareDate(value, getValue(data, args[0]) ?? args[0], 'before'),
    between: ({ value, args, name }) => lengthForRule(value, name) >= Number(args[0]) && lengthForRule(value, name) <= Number(args[1]),
    boolean: ({ value }) => typeof value === 'boolean' || ['true', 'false', '1', '0', 1, 0].includes(value),
    confirmed: ({ value, field, data }) => value === getValue(data, `${field}_confirmation`),
    date: ({ value }) => !Number.isNaN(Date.parse(value)),
    declined: ({ value }) => ['no', 'off', '0', 0, false, 'false'].includes(value),
    different: ({ value, args, data }) => value !== getValue(data, args[0]),
    email: ({ value }) => emailPattern.test(String(value)),
    file: ({ value }) => isUploadedFile(value),
    filled: ({ value }) => !isEmpty(value),
    image: ({ value }) => isUploadedFile(value) && String(value.mimetype || value.type || '').startsWith('image/'),
    in: ({ value, args }) => args.includes(String(value)),
    integer: ({ value }) => Number.isInteger(typeof value === 'number' ? value : Number(value)),
    lowercase: ({ value }) => String(value) === String(value).toLowerCase(),
    max: ({ value, args, name }) => lengthForRule(value, name) <= Number(args[0]),
    mimes: ({ value, args }) => args.map(arg => arg.toLowerCase()).includes(fileExtension(value)),
    mimetypes: ({ value, args }) => args.includes(String(value?.mimetype || value?.type || '')),
    min: ({ value, args, name }) => lengthForRule(value, name) >= Number(args[0]),
    not_in: ({ value, args }) => !args.includes(String(value)),
    not_regex: ({ value, args }) => !new RegExp(args.join(':')).test(String(value)),
    nullable: () => true,
    number: ({ value }) => value !== '' && !Number.isNaN(Number(value)),
    numeric: ({ value }) => value !== '' && !Number.isNaN(Number(value)),
    object: ({ value }) => isObject(value),
    present: ({ value }) => value !== undefined,
    regex: ({ value, args }) => new RegExp(args.join(':')).test(String(value)),
    required: ({ value }) => !isEmpty(value),
    required_if: ({ value, args, data }) => String(getValue(data, args[0])) !== args[1] || !isEmpty(value),
    same: ({ value, args, data }) => value === getValue(data, args[0]),
    size: ({ value, args, name }) => lengthForRule(value, name) === Number(args[0]),
    starts_with: ({ value, args }) => args.some(arg => String(value).startsWith(arg)),
    ends_with: ({ value, args }) => args.some(arg => String(value).endsWith(arg)),
    string: ({ value }) => typeof value === 'string',
    uppercase: ({ value }) => String(value) === String(value).toUpperCase(),
    url: ({ value }) => isValidUrl(value),
    uuid: ({ value }) => uuidPattern.test(String(value)),
};

/**
 * Builds the default validation failure message.
 *
 * @param {string|RegExp} rule Rule value.
 * @param {string} field Field value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {string} Failure message formatted for the built-in rule.
 */
function builtInFailureMessage(rule, field, value, options) {
    if (rule.name === 'after' || rule.name === 'before') return `${label(field, options)} must be ${rule.name} ${rule.args[0]}`;
    if (rule.name === 'ends_with') return `${label(field, options)} must end with one of: ${rule.args.join(', ')}`;
    if (rule.name === 'required_if') return message(field, 'required', rule.args, options);
    return message(field, sizeRuleName(rule.name, value), rule.args, options);
}

/**
 * Execute one built-in non-database rule and return an error message on failure.
 * @param {string|RegExp} rule Rule value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function runBuiltIn(rule, value, field, data, options = {}) {
    if (!implicitRules.has(rule.name) && isEmpty(value)) return null;
    if (['unique', 'exists'].includes(rule.name)) throw new Error('Database validation rule used with validate(); use validateAsync().');
    const validator = builtInValidators[rule.name];
    if (!validator) return null;
    const valid = validator({ value, field, data, args: rule.args || [], name: rule.name });
    return valid ? null : builtInFailureMessage(rule, field, value, options);
}

/**
 * Apply nullable/sometimes/exclude_if controls before running normal rules.
 * @param {string|string[]} ruleList Rules controlling field validation.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
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

/**
 * Create mutable state for errors, validated data, and excluded fields.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @returns {{input: Record<string, string|number|boolean|null|undefined>|unknown[], errors: Record<string, string[]>, validated: Record<string, string|number|boolean|null|undefined>}} Mutable validation state.
 */
function createValidationState(data) {
    return {
        input: isObject(data) || Array.isArray(data) ? data : {},
        errors: {},
        validated: {},
    };
}

/**
 * Record one field's errors or validated value into the validation state.
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string} field Field value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string[]} fieldErrors Validation errors for the field.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function finishField(state, field, value, fieldErrors) {
    const validationState = state;
    if (fieldErrors.length) {
        validationState.errors[field] = fieldErrors;
    }
    else if (!isEmpty(value)) {
        setValue(validationState.validated, field, value);
    }
}

/**
 * Runs synchronous validation rules for a field.
 *
 * @param {string|string[]} ruleList Rules to execute.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {string} input Input value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {string[]} Validation errors produced for the field.
 */
function runSyncField(ruleList, value, field, input, options) {
    const fieldErrors = [];
    const actionableRules = ruleList.filter(rule => !['bail', 'nullable', 'sometimes', 'exclude_if'].includes(rule.name));
    const bail = ruleList.some(rule => rule.name === 'bail');
    for (const rule of actionableRules) {
        const error = rule.name === 'custom' ? rule.callback(value, field, input) : runBuiltIn(rule, value, field, input, options);
        if (error instanceof Promise) throw new Error('Async validation rule used with validate(); use validateAsync().');
        if (typeof error === 'string' && error.length > 0) fieldErrors.push(error);
        if (bail && fieldErrors.length) break;
    }
    return fieldErrors;
}

/**
 * Build the public validation result object from accumulated state.
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
function finishValidation(state, options = {}) {
    const result = { valid: Object.keys(state.errors).length === 0, data: state.validated, errors: state.errors };
    if (options.errorBag) {
        result.errorBag = options.errorBag;
        result.errorBags = { [options.errorBag]: state.errors };
    }
    return result;
}

/**
 * Run the synchronous validation pipeline.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {{valid: boolean, data: Record<string, string|number|boolean|null|undefined>, errors: Record<string, string[]>}} Validation result.
 */
function runValidation(data, rules, options = {}) {
    const state = createValidationState(data);
    for (const [pattern, rawRules] of Object.entries(rules)) {
        const ruleList = asRules(rawRules);
        if (hasDatabaseRule(ruleList)) throw new Error('Database validation rule used with validate(); use validateAsync().');
        for (const field of expandWildcardPaths(state.input, pattern)) {
            const value = getValue(state.input, field);
            if (shouldSkipField(ruleList, value, field, state.input)) continue;

            const fieldErrors = runSyncField(ruleList, value, field, state.input, options);
            finishField(state, field, value, fieldErrors);
        }
    }
    return finishValidation(state, options);
}

/**
 * Execute one async unique/exists database rule.
 * @param {string|RegExp} rule Rule value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<string|null>} Database-rule error message, or null when the value passes.
 */
async function runDatabaseRule(rule, value, field, options) {
    const [table, column = field, exceptValue, idColumn = 'id'] = rule.args || [];
    if (!table) throw new Error(`${rule.name} validation requires a table name.`);
    const count = await databaseCount(options.db, table, column, value, exceptValue, idColumn);
    if (rule.name === 'unique') return Number(count) === 0 ? null : message(field, 'unique', rule.args, options);
    return Number(count) > 0 ? null : message(field, 'exists', rule.args, options);
}

/**
 * Runs one asynchronous validation rule.
 *
 * @param {string|RegExp} rule Rule value.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {string} input Input value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<string|null>} Asynchronous rule error message, or null when the value passes.
 */
async function runAsyncRule(rule, value, field, input, options) {
    if (rule.name === 'custom') return rule.callback(value, field, input);
    if (['unique', 'exists'].includes(rule.name)) return runDatabaseRule(rule, value, field, options);
    return runBuiltIn(rule, value, field, input, options);
}

/**
 * Runs asynchronous validation rules for a field.
 *
 * @param {string|string[]} ruleList Rules to execute.
 * @param {string|number|boolean|null} value Candidate value.
 * @param {string} field Field value.
 * @param {string} input Input value.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<string[]>} Asynchronous validation errors produced for the field.
 */
async function runAsyncField(ruleList, value, field, input, options) {
    const actionableRules = ruleList.filter(rule => !['bail', 'nullable', 'sometimes', 'exclude_if'].includes(rule.name));
    const errors = await Promise.all(actionableRules.map(rule => runAsyncRule(rule, value, field, input, options)));
    const fieldErrors = errors.filter(error => typeof error === 'string' && error.length > 0);
    return ruleList.some(rule => rule.name === 'bail') ? fieldErrors.slice(0, 1) : fieldErrors;
}

/**
 * Validates input with asynchronous rules.
 *
 * @param {Record<string, string|number|boolean|null|Map<string, (...args: never[]) => Promise<void>>>} state Driver state.
 * @param {string|RegExp} pattern Pattern value.
 * @param {string|string[]} rawRules Unparsed rules for the field pattern.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 */
async function validateAsyncPattern(state, pattern, rawRules, options) {
    const ruleList = asRules(rawRules);
    const fields = expandWildcardPaths(state.input, pattern);
    const results = await Promise.all(fields.map(async field => {
        const value = getValue(state.input, field);
        if (shouldSkipField(ruleList, value, field, state.input)) return null;
        const fieldErrors = await runAsyncField(ruleList, value, field, state.input, options);
        return { field, value, fieldErrors };
    }));
    results.filter(Boolean).forEach(result => finishField(state, result.field, result.value, result.fieldErrors));
}

/**
 * Run the validation pipeline including database and async custom rules.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<{valid: boolean, data: Record<string, string|number|boolean|null|undefined>, errors: Record<string, string[]>}>} Validation outcome containing accepted data and field errors.
 */
async function runValidationAsync(data, rules, options = {}) {
    const state = createValidationState(data);
    await Promise.all(Object.entries(rules).map(([pattern, rawRules]) => validateAsyncPattern(state, pattern, rawRules, options)));
    return finishValidation(state, options);
}

/**
 * Validate data synchronously and return errors plus validated values.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate against the supplied rules.
 * @param {Record<string, string|string[]>} rules Validation rules keyed by input field.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Validation options including database access and custom messages.
 * @returns {{valid: boolean, data: Record<string, string|number|boolean|null|undefined>, errors: Record<string, string[]>, errorBag?: string, errorBags?: Record<string, Record<string, string[]>>}} Validation result.
 * @example
 * validate(data, rules, options);
 */
export function validate(data, rules, options = {}) {
    return runValidation(data, rules, options);
}

/**
 * Validate data asynchronously for database and async custom rules.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<{valid: boolean, data: Record<string, string|number|boolean|null|undefined>, errors: Record<string, string[]>}>} Validation result.
 */
function validateAsync(data, rules, options = {}) {
    return runValidationAsync(data, rules, options);
}

/**
 * Validate data and throw a structured ValidationError when it fails.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Record<string, string|number|boolean|null|undefined>} Validated data.
 */
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

/**
 * Async variant of assert.
 * @param {Record<string, string|number|boolean|null|undefined>} data Input values to validate.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {Promise<Record<string, string|number|boolean|null|undefined>>} Validated data.
 */
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

/**
 * Merge request body, query, params, and files into the validation input payload.
 * @param {import('express').Request} req Express request.
 * @returns {Record<string, string|number|boolean|null|undefined>} Request input.
 */
function requestValidationInput(req) {
    return {
        ...(isObject(req.body) ? req.body : {}),
        ...(isObject(req.file) ? { file: req.file } : {}),
        ...(isObject(req.files) && !Array.isArray(req.files) ? req.files : {}),
        ...(Array.isArray(req.files) ? { files: req.files } : {}),
    };
}

/**
 * Build Express middleware that validates a request and assigns req.validated.
 * @param {Record<string, string|string[]>} rules Validation rules.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {import('express').RequestHandler} Validation middleware.
 */
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
