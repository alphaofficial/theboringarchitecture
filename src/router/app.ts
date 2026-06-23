import express from 'express';
import session from 'express-session';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import routes from '@/router/route';
import ormConfig from '@/database/orm.config';
import { PinoLogger } from '@/logger/pinoLogger';
import variables from '@/config/variables';
import { SessionStore, generateSessionToken } from '@/middleware/sessionStore';
import { verifyOrigin } from '@/middleware/csrf';
import { notFoundHandler, globalErrorHandler } from '@/middleware/errorHandler';
import { bootstrapPrimitives } from '@/runtime/bootstrapPrimitives';
import { createApplicationCtx } from '@/runtime/context';

/**
 * Build the Express application and its shared ORM instance.
 */
export async function createApp() {
	const orm = await MikroORM.init(ormConfig);
	const sessionStore = new SessionStore(orm);
	const app = express();
	app.use((req, _res, next) => {
		req.ctx = createApplicationCtx(orm);
		RequestContext.create(req.ctx.db, next);
	});
	bootstrapPrimitives(orm);


	app.set('trust proxy', variables.TRUST_PROXY);

	app.use(
		helmet({
			contentSecurityPolicy: variables.NODE_ENV === 'production' ? undefined : false,
		}),
	);

	app.use(compression());

	app.get('/healthz', (_req, res) => {
		res.status(200).json({ status: 'ok' });
	});

	app.get('/readyz', async (_req, res) => {
		try {
			await orm.em.getConnection().execute('select 1');
			res.status(200).json({ status: 'ready' });
		} catch {
			res.status(503).json({ status: 'not_ready' });
		}
	});

	app.use((req, _, next) => {
		if (req.sessionID) {
			sessionStore.setRequestData(req.sessionID, req.ip || '', req.get('User-Agent') || '');
		}
		next();
	});

	app.use(
		session({
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
		}),
	);

	app.use((req, _, next) => {
		const { injectAuthHelpers } = require('@/middleware/authUtils');
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

	return { app, orm };
}
