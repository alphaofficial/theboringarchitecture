import session from "express-session";
import variables from "../../src/config/variables";
import { PinoLogger } from "../../src/logger/pinoLogger";
import { mock } from "jest-mock-extended";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import ormConfig from "../../src/database/orm.config";
import { SessionStore } from "../../src/middleware/sessionStore";
import express from 'express';
import routes from "../../src/routes/route";
import path from "node:path";
import { injectAuthHelpers } from "../../src/middleware/authUtils";

declare module "express-serve-static-core" {
	interface Request {
		orm: MikroORM;
		logger: PinoLogger;
		user(): Promise<any | null>;
		user_id(): string | null;
		is_authenticated(): boolean;
		is_guest(): boolean;
		authenticate(user: any): void;
		logout(): Promise<void>;
	}
}

export const bootstrapTestApp = async () => {
	const log = mock<PinoLogger>();
	const app = express();

	const orm = await MikroORM.init({ ...ormConfig, dbName: "express_inertia_test.db" });
	const sessionStore = new SessionStore(orm);

	app.use((req, _, next) => {
		req.orm = orm;
		req.logger = log;
		next();
	});

	app.use((_, __, next) =>
		RequestContext.create(orm.em.fork(), next),
	);

	app.use((req, _, next) => {
		if (req.sessionID) {
			sessionStore.setRequestData(req.sessionID, req.ip || '', req.get('User-Agent') || '');
		}
		next();
	});

	// Session middleware
	app.use(session({
		store: sessionStore,
		secret: variables.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // Always false for tests
			httpOnly: true,
			maxAge: variables.SESSION_MAX_AGE,
		}
	}));

	// inject authentication helper methods into request
	app.use(injectAuthHelpers);

	// Middleware
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Serve static files from public directory (template.html)
	app.use('/', express.static(path.join(process.cwd(), 'public')));

	// Routes
	app.use('/', routes);

	return { app, orm, mockLogger: log, sessionStore };
};
