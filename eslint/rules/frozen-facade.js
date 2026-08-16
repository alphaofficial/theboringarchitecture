/**
 * Checks whether a node is Object.freeze(...).
 * @param {import('estree').Node | null} node Node to inspect.
 * @returns {boolean} Whether the node is an Object.freeze call.
 * @example
 * isFrozen(declaration.init);
 */
const isFrozen = (node) => node?.type === 'CallExpression'
    && node.callee.type === 'MemberExpression'
    && node.callee.object.type === 'Identifier'
    && node.callee.object.name === 'Object'
    && node.callee.property.type === 'Identifier'
    && node.callee.property.name === 'freeze';

/**
 * Require selected exported facades to be frozen.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * export const Mailer = Object.freeze({ send });
 */
const frozenFacade = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce frozen configured facade exports',
        },
        messages: {
            frozen: 'Facade "{{name}}" must use Object.freeze(...).',
        },
        schema: [{
            type: 'object',
            properties: {
                names: {
                    type: 'array',
                    items: { type: 'string' },
                    uniqueItems: true,
                },
            },
            additionalProperties: false,
        }],
    },
    /**
     * Create an export visitor for the selected facade names.
     * @param {import('eslint').Rule.RuleContext} context ESLint rule context.
     * @returns {import('eslint').Rule.RuleListener} Export visitor.
     * @example
     * rule.create(context);
     */
    create(context) {
        const names = new Set(context.options[0]?.names ?? []);

        return {
            ExportNamedDeclaration(node) {
                if (node.declaration?.type !== 'VariableDeclaration') {
                    return;
                }

                for (const declaration of node.declaration.declarations) {
                    const name = declaration.id.type === 'Identifier' ? declaration.id.name : null;
                    if (name && names.has(name) && !isFrozen(declaration.init)) {
                        context.report({ node: declaration, messageId: 'frozen', data: { name } });
                    }
                }
            },
        };
    },
};

/**
 * Require selected exported facades to be frozen.
 * @example
 * architecture.rules['frozen-facade'];
 */
export default frozenFacade;
