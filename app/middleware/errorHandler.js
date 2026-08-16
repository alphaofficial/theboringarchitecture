import variables from '../../config/variables.js';
import { renderPage } from '../primitives/inertia.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';

/** Forwards unmatched requests as a 404 error to the global error handler.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').Next(...args: never[]) => void} next Express callback that continues to the next middleware.
 * @returns {Promise<import('express').Response|void>} Promise resolving after the response is sent.
 * @example
 * notFoundHandler(req, res, next);
 */
export const notFoundHandler = async (req, res, next) => {
    try {
        if (!req.inertia)
            {return next();}
        await renderPage(req, res, 'Error', {
            status: 404,
            message: 'Page not found',
        });
        return undefined;
    }
    catch (err) {
        return next(err);
    }
};
/** Logs request failures and renders an Inertia or JSON error response.
 * @param {Error} err Error raised while processing the request.
 * @param {import('express').Request} req Express request containing route, query, body, session, and application context data.
 * @param {import('express').Response} res Express response used to render, redirect, or send the route result.
 * @param {import('express').Next(...args: never[]) => void} _next Express callback reserved for the error-handler signature.
 * @returns {Record<string, string|number|boolean|null>} Configured runtime interface.
 * @example
 * globalErrorHandler(err, req, res, _next);
 */
export const globalErrorHandler = (err, req, res, _next) => {
    const status = (err && (err.status || err.statusCode)) || 500;
    const isProd = variables.NODE_ENV === 'production';
    PinoLogger.error({
        scope: 'globalErrorHandler',
        message: 'Unhandled error',
        method: req.method,
        url: req.originalUrl,
        err,
    });
    if (res.headersSent)
        {return;}
    const payload = {
        status,
        message: isProd ? 'Something went wrong' : (err?.message || 'Unknown error'),
        ...(isProd ? {} : { stack: err?.stack }),
    };
    if (req.inertia) {
        try {
            res.status(status);
            renderPage(req, res, 'Error', payload).catch(() => {
                if (!res.headersSent)
                    {res.status(status).json({ error: payload.message });}
            });
            return;
        }
        catch (renderError) {
            PinoLogger.error({ scope: 'globalErrorHandler', message: 'Error page rendering failed', err: renderError });
        }
    }
    res.status(status).json({ error: payload.message });
};
