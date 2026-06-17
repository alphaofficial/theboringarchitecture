import pino, { type Options, stdSerializers } from "pino-http";

const isDev = process.env.NODE_ENV !== "production";

let coreConfig: Options = {
	serializers: {
		...stdSerializers,
		req: (req) => ({
			method: req.method,
			url: req.url,
			userAgent: req.headers["user-agent"],
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
	customLogLevel: (_req, res, err) => {
		if (res.statusCode >= 400 && res.statusCode < 500) {
			return "warn";
		} else if (res.statusCode >= 500 || err) {
			return "error";
		} else if (res.statusCode >= 300 && res.statusCode < 400) {
			return "silent";
		}
		return "info";
	},
	customSuccessMessage: (req, _res) => {
		const expressReq = req as any;
		if (expressReq.statusCode === 404) {
			return "Resource not found";
		}
		return `${expressReq.method} ${expressReq.originalUrl} completed`;
	},
	customReceivedMessage: (req, _res) => `Request received:  ${req.method}`,
};

if (isDev) {
	const isTestsRun = !!process.env.TESTS_RUN;
	const prettyOptions = {
		colorize: true,
		singleLine: true,
	};

	if (isTestsRun) {
		// eslint-disable-next-line import/no-extraneous-dependencies, global-require
		const pretty = require("pino-pretty");
		coreConfig = pretty(prettyOptions);
	} else {
		coreConfig = {
			...coreConfig,
			transport: {
				target: "pino-pretty",
				options: prettyOptions,
			},
		};
	}
}

const pinoInstance = pino(coreConfig);

export interface LogOptions {
	scope: string;
	message: string;
	[key: string]: unknown;
}

type LogLevel = "critical" | "fatal" | "error" | "warn" | "info" | "debug" | "trace";

const log = (level: LogLevel, options: LogOptions): void => {
	const logger = pinoInstance.logger as any;
	logger[level](options);
};

/**
 * Shared application logger used by HTTP middleware and runtime code.
 * `scope` is the name of the function emitting the log.
 */
export const PinoLogger = {
	instance: pinoInstance,

	critical(options: LogOptions): void {
		log("critical", options);
	},

	fatal(options: LogOptions): void {
		log("fatal", options);
	},

	error(options: LogOptions): void {
		log("error", options);
	},

	warn(options: LogOptions): void {
		log("warn", options);
	},

	info(options: LogOptions): void {
		log("info", options);
	},

	debug(options: LogOptions): void {
		log("debug", options);
	},

	trace(options: LogOptions): void {
		log("trace", options);
	},
};
