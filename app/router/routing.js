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
 * @param {string} [path=''] - Path fragment.
 * @returns {string} Normalized path fragment.
 */
function normalizePath(path = '') {
    if (!path || path === '/') return '';
    return `/${String(path).replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Joins normalized path fragments into one Express path.
 *
 * @param {...string} parts - Path fragments.
 * @returns {string} Joined Express path.
 */
function joinPaths(...parts) {
    const path = parts.map(normalizePath).join('');
    return path || '/';
}

/**
 * Flattens middleware/handler arrays and removes empty entries.
 *
 * @param {Array<unknown>} handlers - Handler values.
 * @returns {Function[]} Flattened handlers.
 */
function normalizeHandlers(handlers) {
    return handlers.flat(Infinity).filter(Boolean);
}

/**
 * Derives the default route parameter name for a resource path.
 *
 * @param {string} name - Resource path.
 * @returns {string} Route parameter name.
 */
function singularResourceName(name) {
    return String(name).replace(/^\/+|\/+$/g, '').split('/').at(-1).replace(/ies$/i, 'y').replace(/s$/i, '') || 'id';
}

/**
 * Accepts either a prefix string or a full group options object.
 *
 * @param {string|object} [options={}] - Group options or prefix.
 * @returns {{prefix?: string, name?: string, middleware?: Function|Function[]}} Normalized group options.
 */
function normalizeGroupOptions(options = {}) {
    if (typeof options === 'string') return { prefix: options };
    return options;
}

/**
 * Substitutes named :params into a registered route path and tracks consumed params.
 *
 * @param {string} pattern - Registered route path.
 * @param {Record<string, unknown>} params - Route parameters.
 * @returns {{path: string, used: Set<string>}} Built path and consumed parameter names.
 */
function applyPathParams(pattern, params) {
    const used = new Set();
    const path = pattern.replace(/:([A-Za-z0-9_]+)(\?)?/g, (_match, key, optional) => {
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
 * @param {string} path - URL path.
 * @param {Record<string, unknown>} query - Query parameters.
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
 *
 * @param {import('express').RouterOptions} options
 * @returns {import('express').Router & {
 *   name: (name: string) => Record<string, Function>,
 *   group: (options: {prefix?: string, name?: string, middleware?: Function|Function[]}|string, callback: Function) => void,
 *   resource: (name: string, controller: Record<string, Function>, options?: {only?: string[], except?: string[], middleware?: Function|Function[], param?: string, names?: Record<string, string>}) => void,
 *   url: (name: string, params?: Record<string, unknown>, options?: {query?: Record<string, unknown>}) => string,
 *   urls: () => import('express').RequestHandler,
 *   namedRoutes: Map<string, {method: string, path: string}>
 * }}
 */
function create(options = {}) {
    const router = ExpressRouter(options);
    const native = Object.fromEntries(httpMethods.map(method => [method, router[method].bind(router)]));
    const namedRoutes = new Map();
    const groups = [{ prefix: '', name: '', middleware: [] }];

    /**
     * Returns the active group context while nested groups register routes.
     *
     * @returns {{prefix: string, name: string, middleware: Function[]}} Current group context.
     */
    function currentGroup() {
        return groups.at(-1);
    }

    /**
     * Registers one Express route and optionally records its generated URL name.
     *
     * @param {string} method - HTTP method.
     * @param {string|string[]} path - Route path or paths.
     * @param {Function[]} handlers - Route middleware and handler stack.
     * @param {string} [routeName] - Optional route name.
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
        const options = normalizeGroupOptions(rawOptions);
        const parent = currentGroup();
        groups.push({
            prefix: joinPaths(parent.prefix, options.prefix || ''),
            name: `${parent.name}${options.name || ''}`,
            middleware: [...parent.middleware, ...normalizeHandlers([options.middleware])],
        });
        try {
            callback(router);
        }
        finally {
            groups.pop();
        }
        return router;
    };

    router.resource = (name, controller, options = {}) => {
        const only = options.only ? new Set(options.only) : null;
        const except = new Set(options.except || []);
        const param = options.param || singularResourceName(name);
        const base = normalizePath(name);
        for (const definition of resourceActions) {
            if (only && !only.has(definition.action)) continue;
            if (except.has(definition.action)) continue;
            const handler = controller[definition.action];
            if (typeof handler !== 'function') continue;
            const path = `${base}${definition.path.replace(':param', `:${param}`)}`;
            const routeName = options.names?.[definition.action] || `${name}.${definition.action}`;
            const methods = Array.isArray(definition.method) ? definition.method : [definition.method];
            for (const method of methods) {
                register(method, path, [options.middleware, handler], routeName);
            }
        }
        return router;
    };

    router.url = (name, params = {}, options = {}) => {
        const route = namedRoutes.get(name);
        if (!route) throw new Error(`Unknown route name: ${name}`);
        const { path, used } = applyPathParams(route.path, params);
        const query = { ...Object.fromEntries(Object.entries(params).filter(([key]) => !used.has(key))), ...(options.query || {}) };
        return appendQuery(path, query);
    };

    router.urls = () => (req, res, next) => {
        const routeUrl = (name, params, options) => router.url(name, params, options);
        req.routeUrl = routeUrl;
        res.locals.routeUrl = routeUrl;
        next();
    };

    router.namedRoutes = namedRoutes;
    return router;
}

/** Router facade for named routes, groups, and resource routes. */
export const Router = Object.freeze({ create });
