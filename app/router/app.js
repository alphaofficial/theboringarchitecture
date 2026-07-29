import express from 'express';
import session from 'express-session';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import routes from './route.js';
import ormConfig from '../../config/orm.config.js';
import { PinoLogger } from '../../lib/logger/pinoLogger.js';
import variables from '../../config/variables.js';
import { SessionStore, generateSessionToken } from '../middleware/sessionStore.js';
import { verifyOrigin } from '../middleware/csrf.js';
import { injectAuthHelpers } from '../middleware/authUtils.js';
import { notFoundHandler, globalErrorHandler } from '../middleware/errorHandler.js';
import { bootstrapPrimitives } from '../../lib/runtime/bootstrapPrimitives.js';
import { createApplicationCtx } from '../../lib/runtime/context.js';
/**
 * Creates the Express application, database context, and middleware stack.
 *
 * @returns {Promise<{
 *   app: import('express').Express,
 *   ctx: import('../../lib/runtime/context.js').ApplicationContext
 * }>} The configured application and its shared runtime context.
 * @throws {Error} If the ORM or another required runtime cannot be initialized.
 */
export async function createApp() {
    const orm = await MikroORM.init(ormConfig);
    const sessionStore = new SessionStore(orm);
    const app = express();
    const ctx = createApplicationCtx(orm);
    app.set('trust proxy', variables.TRUST_PROXY);
    app.use((_, __, next) => RequestContext.create(ctx.db.fork(), next));
    app.use((req, _res, next) => {
        req.ctx = ctx;
        next();
    });
    bootstrapPrimitives(ctx);
    app.use(helmet({
        contentSecurityPolicy: variables.NODE_ENV === 'production' ? undefined : false,
    }));
    app.use(compression());
    app.get('/healthz', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });
    app.get('/readyz', async (_req, res) => {
        try {
            await ctx.db.getConnection().execute('select 1');
            res.status(200).json({ status: 'ready' });
        }
        catch {
            res.status(503).json({ status: 'not_ready' });
        }
    });
    app.use((req, _, next) => {
        if (req.sessionID) {
            sessionStore.setRequestData(req.sessionID, req.ip || '', req.get('User-Agent') || '');
        }
        next();
    });
    app.use(session({
        store: sessionStore,
        secret: variables.SESSION_SECRET,
        genid: generateSessionToken,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: variables.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: variables.SESSION_MAX_AGE,
        },
    }));
    app.use((req, _, next) => {
        injectAuthHelpers(req, _, next);
    });
    app.use(express.json({ limit: '100kb' }));
    app.use(express.urlencoded({ extended: true, limit: '100kb' }));
    app.use(PinoLogger.instance);
    app.use('/', express.static(path.join(process.cwd(), 'public')));
    app.use(verifyOrigin);
    app.use('/', routes);
    app.use(notFoundHandler);
    app.use(globalErrorHandler);
    return { app, ctx };
}
