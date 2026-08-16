import { Router as ExpressRouter } from 'express';

const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
const resourceActions = [
    { action: 'index', method: 'get', path: '' },
    { action: 'create', method: 'get', path: '/create' },
    { action: 'store', method: 'post', path: '' },
    { action: 'show', method: 'get', path: '/:param' },
    { action: 'edit', method: 'get', path: '/:param/edit' },
    { action: 'update', method: ['put', 'patch'], path: '/:param' },
    { action: 'destroy', method: 'delete', path: '/:param' },
];

/**
 * Normalizes path fragments so group prefixes and route paths join predictably.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} [path=''] Path fragment.
 * @param {string} path Resource path.
 * @returns {string} Normalized path fragment.
 */
function normalizePath(path = '') {
    if (!path || path === '/') return '';
    return `/${String(path).split('/').filter(Boolean).join('/')}`;
}

/**
 * Joins normalized path fragments into one Express path.
 *
 * @param {string|number|boolean|null|Record<string, string|number|boolean|null>} parts Path fragments to join.
 * @returns {string} Joined Express path.
 */
function joinPaths(...parts) {
    const path = parts.map(normalizePath).join('');
    return path || '/';
}

/**
 * Flattens middleware/handler arrays and removes empty entries.
 *
 * @param {Map<string, (...args: never[]) => Promise<string|number|boolean|null|void>>} handlers Route handlers to normalize.
 * @returns {Array<(...args: never[]) => void>} Flattened handlers.
 */
function normalizeHandlers(handlers) {
    return handlers.flat(Infinity).filter(Boolean);
}

/**
 * Derives the default route parameter name for a resource path.
 *
 * @param {string} name Name used to identify or label the generated value.
 * @returns {string} Route parameter name.
 */
function singularResourceName(name) {
    return String(name).split('/').filter(Boolean).at(-1).replace(/ies$/i, 'y').replace(/s$/i, '') || 'id';
}

/**
 * Accepts either a prefix string or a full group options object.
 *
 * @param {Record<string, string|number|boolean|undefined>} [options={}] Group options or prefix.
 * @param {Record<string, string|number|boolean|string[]|undefined>} options Configuration options.
 * @returns {{prefix?: string, name?: string, middleware?: (...args: never[]) => void|Array<(...args: never[]) => void>}} Normalized group options.
 */
function normalizeGroupOptions(options = {}) {
    if (typeof options === 'string') return { prefix: options };
    return options;
}

/**
 * Substitutes named :params into a registered route path and tracks consumed params.
 *
 * @param {string|RegExp} pattern Route path pattern.
 * @param {Record<string, string|number>} params Route parameter values.
 * @returns {{path: string, used: Set<string>}} Built path and consumed parameter names.
 */
function applyPathParams(pattern, params) {
    const used = new Set();
    const path = pattern.replace(/:(\w+)(\?)?/g, (_match, key, optional) => {
        const value = params[key];
        if ((value === undefined || value === null || value === '') && optional) return '';
        if (value === undefined || value === null) throw new Error(`Missing route parameter: ${key}`);
        used.add(key);
        return encodeURIComponent(String(value));
    });
    return { path: path.replace(/\/+/g, '/').replace(/\/$/, '') || '/', used };
}

/**
 * Appends remaining parameters as a URL query string.
 *
 * @param {string} path URL or route path.
 * @param {Record<string, string|number|boolean>} query Query parameter values.
 * @returns {string} URL path with query string.
 */
function appendQuery(path, query) {
    const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null);
    if (!entries.length) return path;
    const search = new URLSearchParams();
    for (const [key, value] of entries) {
        if (Array.isArray(value)) value.forEach(item => search.append(key, String(item)));
        else search.append(key, String(value));
    }
    const serialized = search.toString();
    return serialized ? `${path}?${serialized}` : path;
}

/**
 * Create an Express Router with named-route URLs, groups, and resource routes.
 * @param routerOptions Options passed to the Express Router constructor.
 * @returns Express Router instance with additional methods for named routes, groups, and resources.
 */
function create(routerOptions = {}) {
    const router = ExpressRouter(routerOptions);
    const native = Object.fromEntries(httpMethods.map(method => [method, router[method].bind(router)]));
    const namedRoutes = new Map();
    const groups = [{ prefix: '', name: '', middleware: [] }];

    /**
     * Returns the active group context while nested groups register routes.
     *
     * @returns {{prefix: string, name: string, middleware: Array<(...args: never[]) => void>}} Current group context.
     */
    function currentGroup() {
        return groups.at(-1);
    }

    /**
     * Registers one Express route and optionally records its generated URL name.
     *
     * @param {string} method HTTP method.
     * @param {string} path URL or route path.
     * @param {Map<string, (...args: never[]) => Promise<string|number|boolean|null|void>>} handlers Route handlers to normalize.
     * @param {string} [routeName] Optional route name.
     * @returns {import('express').Router} Router instance.
     */
    function register(method, path, handlers, routeName = undefined) {
        if (Array.isArray(path)) {
            for (const item of path) register(method, item, handlers, routeName);
            return router;
        }
        const group = currentGroup();
        const fullPath = joinPaths(group.prefix, path);
        const stack = [...group.middleware, ...normalizeHandlers(handlers)];
        native[method](fullPath, ...stack);
        if (routeName) {
            namedRoutes.set(`${group.name}${routeName}`, { method: method.toUpperCase(), path: fullPath });
        }
        return router;
    }

    for (const method of httpMethods) {
        router[method] = (path, ...handlers) => register(method, path, handlers);
    }

    Object.defineProperty(router, 'name', {
        value: (routeName) => Object.fromEntries(httpMethods.map(method => [
            method,
            (path, ...handlers) => register(method, path, handlers, routeName),
        ])),
    });

    router.group = (rawOptions, callback) => {
        const groupOptions = normalizeGroupOptions(rawOptions);
        const parent = currentGroup();
        groups.push({
            prefix: joinPaths(parent.prefix, groupOptions.prefix || ''),
            name: `${parent.name}${groupOptions.name || ''}`,
            middleware: [...parent.middleware, ...normalizeHandlers([groupOptions.middleware])],
        });
        try {
            callback(router);
        }
        finally {
            groups.pop();
        }
        return router;
    };

    router.resource = (name, controller, resourceOptions = {}) => {
        const only = resourceOptions.only ? new Set(resourceOptions.only) : null;
        const except = new Set(resourceOptions.except || []);
        const param = resourceOptions.param || singularResourceName(name);
        const base = normalizePath(name);
        for (const definition of resourceActions) {
            if (only && !only.has(definition.action)) continue;
            if (except.has(definition.action)) continue;
            const handler = controller[definition.action];
            if (typeof handler !== 'function') continue;
            const parameterPath = definition.path.replace(':param', `:${param}`);
            const path = `${base}${parameterPath}`;
            const routeName = resourceOptions.names?.[definition.action] || `${name}.${definition.action}`;
            const methods = Array.isArray(definition.method) ? definition.method : [definition.method];
            for (const method of methods) {
                register(method, path, [resourceOptions.middleware, handler], routeName);
            }
        }
        return router;
    };

    router.url = (name, params = {}, urlOptions = {}) => {
        const route = namedRoutes.get(name);
        if (!route) throw new Error(`Unknown route name: ${name}`);
        const { path, used } = applyPathParams(route.path, params);
        const query = { ...Object.fromEntries(Object.entries(params).filter(([key]) => !used.has(key))), ...(urlOptions.query || {}) };
        return appendQuery(path, query);
    };

    router.urls = () => (req, res, next) => {
        /**
         * Builds a URL for a named route.
         *
         * @param {string} name Registered name.
         * @param {Record<string, string|number>} params Params value.
         * @param {{query?: Record<string, string|number|boolean>}} urlOptions URL generation options.
         * @returns {string} URL generated from the registered route name.
         */
        const routeUrl = (name, params, urlOptions) => router.url(name, params, urlOptions);
        req.routeUrl = routeUrl;
        res.locals.routeUrl = routeUrl;
        next();
    };

    router.namedRoutes = namedRoutes;
    return router;
}

/** Router facade for named routes, groups, and resource routes. */
export const Router = Object.freeze({ create });
