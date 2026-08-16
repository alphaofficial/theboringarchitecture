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
            '**/app/primitives/**',
            '**/app/requests/**',
            '**/app/router/**',
            '**/app/scheduler/**',
            '**/app/support/**',
            '**/lib/runtime/**',
        ],
        message: 'Views receive props and must not import server runtime modules.',
    },
];

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

const namedFunctions = [
    'FunctionDeclaration',
    'VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
    'VariableDeclarator[id.type="Identifier"] > FunctionExpression',
];

const publicFunctions = [
    'ExportNamedDeclaration > FunctionDeclaration',
    'ExportDefaultDeclaration > FunctionDeclaration',
    'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
    'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.type="Identifier"] > FunctionExpression',
];

export default [
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
            'import-x/extensions': ['error', 'always', {
                ignorePackages: true,
            }],
            'import-x/no-cycle': 'error',
            'import-x/no-named-as-default': 'off',
            'import-x/no-rename-default': ['warn', { preventRenamingBindings: false }],
            'import-x/prefer-default-export': 'off',
            'padding-line-between-statements': ['error', {
                blankLine: 'always',
                prev: ['function', 'class'],
                next: ['function', 'class'],
            }],
            'react/jsx-uses-vars': 'error',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'jsdoc/require-example': ['error', { contexts: publicFunctions }],
            'jsdoc/require-jsdoc': ['error', {
                contexts: namedFunctions,
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
        },
    },
    {
        files: ['app/router/**/*.js'],
        rules: {
            'architecture/controller-import-style': 'error',
        },
    },
    {
        files: [
            'app/middleware/passwordConfirmation.js',
            'app/primitives/**/*.js',
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
    {
        files: ['test/**/*.js', 'eslint/**/*.spec.js'],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
        },
    },
    {
        files: ['vite.config.mjs', 'vite.ssr.config.mjs'],
        rules: {
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
        },
    },
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
        rules: {
            'import-x/extensions': 'off',
            'import-x/no-cycle': 'off',
            'import-x/no-useless-path-segments': 'off',
        },
    },
    {
        files: ['db/migrations/**/*.js', 'eslint/**/*.js', 'eslint.config.js', 'vite.config.mjs', 'vite.ssr.config.mjs'],
        rules: {
            'jsdoc/require-example': 'off',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-returns': 'off',
            'jsdoc/require-returns-description': 'off',
        },
    },
];
