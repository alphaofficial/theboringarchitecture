import variables from '../../config/variables.js';
import { renderPage } from '../primitives/inertia.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
export const notFoundHandler = async (req, res, next) => {
    try {
        if (!req.inertia)
            return next();
        await renderPage(req, res, 'Error', {
            status: 404,
            message: 'Page not found',
        });
    }
    catch (err) {
        next(err);
    }
};
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
        return;
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
                    res.status(status).json({ error: payload.message });
            });
            return;
        }
        catch {
        }
    }
    res.status(status).json({ error: payload.message });
};
