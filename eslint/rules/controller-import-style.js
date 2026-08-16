const pascalCase = /^[A-Z][A-Za-z0-9]*$/u;

/**
 * Enforces controller PascalCase module namespaces.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * // Valid
 * import * as Users from '../controllers/users.js';
 * @example
 * // Invalid
 * import users from '../controllers/users.js';
 */
const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce controller PascalCase module namespaces',
        },
        messages: {
            namespace: 'Import controllers with a namespace import.',
            pascalCase: 'Controller namespace "{{name}}" must use PascalCase.',
        },
        schema: [],
    },
    /**
     * Creates an import declaration visitor for the rule.
     * @param {import('eslint').Rule.RuleContext} context ESLint rule context.
     * @returns {import('eslint').Rule.RuleListener} Import declaration visitor.
     * @example
     * rule.create(context);
     */
    create(context) {
        return {
            ImportDeclaration(node) {
                if (!/(?:^|\/)controllers(?:\/|$)/u.test(node.source.value)) {
                    return;
                }

                if (node.specifiers.length !== 1 || node.specifiers[0].type !== 'ImportNamespaceSpecifier') {
                    context.report({ node, messageId: 'namespace' });
                    return;
                }

                const [{ local }] = node.specifiers;
                if (!pascalCase.test(local.name)) {
                    context.report({ node: local, messageId: 'pascalCase', data: { name: local.name } });
                }
            },
        };
    },
};

/**
 * Enforces controller PascalCase module namespaces.
 * @example
 * architecture.rules['controller-import-style'];
 */
export default rule;
