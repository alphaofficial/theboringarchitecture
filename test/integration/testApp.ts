import express from 'express';
import session from 'express-session';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import supertest from 'supertest';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import routes from '@/router/route';
import variables from '@/config/variables';
import { PasswordResetMapper } from '@/database/mappings/PasswordReset.map';
import { SessionMapper } from '@/database/mappings/session.map';
import { UserMapper } from '@/database/mappings/user.map';
import { PinoLogger } from '@/logger/pinoLogger';
import { notFoundHandler, globalErrorHandler } from '@/middleware/errorHandler';
import { verifyOrigin } from '@/middleware/csrf';
import { generateSessionToken, SessionStore } from '@/middleware/sessionStore';
import { bootstrapPrimitives } from '@/runtime/bootstrapPrimitives';

export async function bootstrapTestApp() {
	const orm = await MikroORM.init({
		entities: [UserMapper, SessionMapper, PasswordResetMapper],
		dbName: process.env.DB_PATH,
		driver: SqliteDriver,
		allowGlobalContext: true,
	});

	await orm.getSchemaGenerator().refreshDatabase();
	bootstrapPrimitives();
	await import('@/events/auth');

	const sessionStore = new SessionStore(orm);
	const app = express();

	app.set('trust proxy', variables.TRUST_PROXY);
	app.use(
		helmet({
			contentSecurityPolicy: variables.NODE_ENV === 'production' ? undefined : false,
		}),
	);
	app.use(compression());

	app.use((req, _, next) => {
		req.orm = orm;
		req.entityManager = orm.em.fork();
		req.logger = PinoLogger;
		next();
	});

	app.use((_, __, next) => RequestContext.create(orm.em.fork(), next));

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
				secure: false,
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

	return {
		app,
		orm,
		request: supertest(app),
		agent: () => supertest.agent(app),
	};
}
