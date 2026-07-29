import pino from 'pino';
import { pinoHttp, stdSerializers } from 'pino-http';
const baseOptions = {
    serializers: {
        ...stdSerializers,
        req: (req) => ({
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
        error: stdSerializers.err,
    },
    formatters: {
        level(level) {
            return { level };
        },
    },
};
const httpOptions = {
    customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
        }
        if (res.statusCode >= 500 || err) {
            return 'error';
        }
        if (res.statusCode >= 300 && res.statusCode < 400) {
            return 'silent';
        }
        return 'info';
    },
    customSuccessMessage: (req, _res) => {
        if (req.statusCode === 404) {
            return 'Resource not found';
        }
        return `${req.method} ${req.originalUrl} completed`;
    },
    customReceivedMessage: (req, _res) => `Request received: ${req.method}`,
};
const logger = pino(baseOptions);
const httpLogger = pinoHttp({ logger, ...httpOptions });
const log = (level, options) => {
    const { message, ...rest } = options;
    logger[level]({ msg: message, ...rest });
};
export const PinoLogger = {
    instance: httpLogger,
    fatal(options) {
        log('fatal', options);
    },
    error(options) {
        log('error', options);
    },
    warn(options) {
        log('warn', options);
    },
    info(options) {
        log('info', options);
    },
    debug(options) {
        log('debug', options);
    },
    trace(options) {
        log('trace', options);
    },
};
