import { plugins, rules } from 'eslint-config-airbnb-extended';
import sonarjs from 'eslint-plugin-sonarjs';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import architecture from './eslint/index.js';

const serverRuntimePatterns = [
    {
        group: [
            '**/app/controllers/**',
            '**/app/core/**',
            '**/app/events/**',
            '**/app/jobs/**',
            '**/app/mail/**',
            '**/app/middleware/**',
            '**/app/models/**',
            '**/lib/primitives/**',
            '**/app/requests/**',
            '**/app/router/**',
            '**/app/scheduler/**',
            '**/app/support/**',
            '**/lib/runtime/**',
        ],
        message: 'Views receive props and must not import server runtime modules.',
    },
];

// Preserve the preset order because later flat-config entries override earlier rules.
const airbnbPlugins = [
    plugins.importX,
    plugins.node,
    plugins.react,
    plugins.reactA11y,
    plugins.reactHooks,
];

const airbnbRules = [
    rules.base.bestPractices,
    rules.base.errors,
    rules.base.es6,
    rules.base.imports,
    rules.base.strict,
    rules.base.variables,
    rules.node.base,
    rules.node.promises,
    rules.node.noUnsupportedFeatures,
    rules.react.jsxA11y,
    rules.react.hooks,
];

// Require documentation for named functions without targeting inline callbacks.
const documentedFunctions = [
    'FunctionDeclaration',
    'VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
    'VariableDeclarator[id.type="Identifier"] > FunctionExpression',
];

// Public functions additionally need a usable example.
const publicDocumentedFunctions = [
    'ExportNamedDeclaration > FunctionDeclaration',
    'ExportDefaultDeclaration > FunctionDeclaration',
    'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
    'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.type="Identifier"] > FunctionExpression',
];

const developmentDependencyFiles = [
    'eslint/**/*.spec.js',
    'test/**/*.js',
    'vite.config.mjs',
    'vite.ssr.config.mjs',
];

const jsdocExemptFiles = [
    'db/migrations/**/*.js',
    'eslint.config.js',
    'eslint/**/*.js',
    'vite.config.mjs',
    'vite.ssr.config.mjs',
];

const jsdocRules = {
    'jsdoc/require-example': ['error', { contexts: publicDocumentedFunctions }],
    'jsdoc/require-jsdoc': ['error', {
        contexts: documentedFunctions,
        enableFixer: false,
        require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
        },
    }],
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
};

const disabledJsdocRules = Object.fromEntries(Object.keys(jsdocRules).map(rule => [rule, 'off']));

export default [
    // Generated assets and dependencies are outside the authored source tree.
    {
        ignores: ['.ssr/**', '.vscode/**', 'dist/**', 'node_modules/**', 'public/**', 'config/pages.js'],
    },
    ...airbnbPlugins,
    ...airbnbRules,
    sonarjs.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: globals.node,
            sourceType: 'module',
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            architecture,
            jsdoc,
        },
        rules: {
            ...jsdocRules,
            'import-x/extensions': ['error', 'always', {
                ignorePackages: true,
            }],
            'import-x/no-cycle': 'error',
            'import-x/no-named-as-default': 'off',
            'import-x/no-rename-default': ['warn', { preventRenamingBindings: false }],
            'import-x/newline-after-import': ['error', { considerComments: true }],
            'import-x/prefer-default-export': 'off',
            'padding-line-between-statements': ['error', {
                blankLine: 'always',
                prev: ['function', 'class'],
                next: ['function', 'class'],
            }],
            'react/jsx-uses-vars': 'error',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
    // Architecture rules encode boundaries that generic presets cannot express.
    {
        files: ['app/router/**/*.js'],
        rules: {
            'architecture/controller-import-style': 'error',
        },
    },
    {
        files: [
            'app/middleware/passwordConfirmation.js',
            'lib/primitives/**/*.js',
            'app/router/routing.js',
            'app/support/**/*.js',
        ],
        rules: {
            'architecture/frozen-facade': ['error', {
                names: [
                    'Bus',
                    'Cache',
                    'Command',
                    'Config',
                    'Gate',
                    'Mailer',
                    'MailTemplate',
                    'NotificationCenter',
                    'PasswordConfirmation',
                    'Policy',
                    'PolicyDiscovery',
                    'Queue',
                    'QueueMonitor',
                    'RateLimitPresets',
                    'RequestModules',
                    'Router',
                    'Scheduler',
                    'SignedUrl',
                    'Storage',
                    'Validation',
                ],
            }],
        },
    },
    {
        files: ['app/models/**/*.js'],
        rules: {
            'no-restricted-imports': ['error', {
                patterns: [{
                    group: ['**/controllers/**', '**/router/**', '**/middleware/**', '**/views/**'],
                    message: 'Models must not import controllers, routes, middleware, or views.',
                }],
            }],
        },
    },
    {
        files: ['app/views/**/*.{js,jsx}'],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            'import-x/extensions': 'off',
            'import-x/no-unresolved': ['error', { ignore: ['^@/'] }],
            'no-restricted-imports': ['error', { patterns: serverRuntimePatterns }],
        },
    },
    // Tests and build configuration may import development-only packages.
    {
        files: developmentDependencyFiles,
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
        },
    },
    // CLI entry points intentionally use process control and synchronous operations.
    {
        files: ['bin/**/*.js'],
        rules: {
            'no-console': 'off',
            'n/no-process-exit': 'off',
            'n/no-sync': 'off',
        },
    },
    {
        files: ['eslint/**/*.js', 'eslint.config.js'],
        settings: {
            'import-x/ignore': ['eslint-plugin-jsdoc'],
        },
        rules: {
            'import-x/extensions': 'off',
            'import-x/no-cycle': 'off',
            'import-x/no-useless-path-segments': 'off',
        },
    },
    // Generated migrations and configuration modules are declarative, not public APIs.
    {
        files: jsdocExemptFiles,
        rules: disabledJsdocRules,
    },
];
