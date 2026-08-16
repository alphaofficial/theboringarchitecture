const templates = new Map();

/**
 * Registers a named mail template renderer.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @param {(data?: Record<string, string|number|boolean|null|undefined>) => {subject: string, html: string}} renderer - Renderer returning a subject and HTML body.
 * @returns {void}
 */
function define(name, renderer) { templates.set(name, renderer); }

/**
 * Renders a registered mail template with data.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [data={}] Template data.
 * @returns {{subject: string, html: string}} Rendered mail message.
 */
function render(name, data = {}) {
    const renderer = templates.get(name);
    if (!renderer) throw new Error(`Unknown mail template: ${name}`);
    return renderer(data);
}

/**
 * Lists registered mail template names.
 *
 * @returns {string[]} Template names.
 */
function list() { return [...templates.keys()]; }

/**
 * Clears registered mail templates; used by tests.
 *
 * @returns {void}
 */
function reset() { templates.clear(); }

/** Named mail template registry and renderer facade. */
export const MailTemplate = Object.freeze({ define, render, list, reset });
