import { PinoLogger } from '@/logger/pinoLogger';
import { AppContext } from '@/runtime/context';
import { loadRelativeDirectory } from '@/runtime/loadRelativeDirectory';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export interface ScheduledTask {
	expression: string;
	handler: () => void | Promise<void>;
	start(): void | Promise<void>;
	stop(): void | Promise<void>;
}

export interface SchedulerDriver {
	schedule(expression: string, handler: () => void | Promise<void>): ScheduledTask;
	startAll(): void;
	stopAll(): void;
	getRegisteredTasks(): ReadonlyArray<{ expression: string }>;
}

interface SchedulerRuntime {
	driver: SchedulerDriver;
	ctx: AppContext;
}

/** Configure the scheduler runtime. */
const configure = (driver: SchedulerDriver, ctx: AppContext): void => {
	if (hasPrimitiveRuntime('scheduler')) {
		return;
	}

	registerPrimitiveRuntime<SchedulerRuntime>('scheduler', {
		driver,
		ctx,
	});
};

/** Register a cron task. */
const on = (expression: string, handler: (ctx: AppContext) => void | Promise<void>): ScheduledTask => {
	const runtime = getPrimitiveRuntime<SchedulerRuntime>('scheduler');

	return runtime.driver.schedule(expression, async () => {
		await handler(runtime.ctx);
	});
};

/** Register a cron task. */
const schedule = (expression: string, handler: (ctx: AppContext) => void | Promise<void>): ScheduledTask => {
	return on(expression, handler);
};

/** Start all registered tasks. */
const startAll = (): void => {
	getPrimitiveRuntime<SchedulerRuntime>('scheduler').driver.startAll();
};

/** Stop all registered tasks without logging lifecycle messages. */
const stopAll = (): void => {
	getPrimitiveRuntime<SchedulerRuntime>('scheduler').driver.stopAll();
};

/** List registered task expressions. */
const getRegisteredTasks = (): ReadonlyArray<{ expression: string }> => {
	return getPrimitiveRuntime<SchedulerRuntime>('scheduler').driver.getRegisteredTasks();
};

/** Load scheduled tasks and start them. */
const start = (): void => {
	loadRelativeDirectory('scheduler');
	PinoLogger.info({ scope: 'start', message: 'Starting scheduler...' });
	startAll();
	const registered = getRegisteredTasks();
	PinoLogger.info({
		scope: 'start',
		message: 'Scheduler started', count: registered.length,
		tasks: registered.map(task => task.expression),
	});
};

/** Stop all registered tasks. */
const stop = (): void => {
	PinoLogger.info({ scope: 'stop', message: 'Stopping scheduler...' });
	stopAll();
	PinoLogger.info({ scope: 'stop', message: 'Scheduler stopped.' });
};

/**
 * Scheduler primitive for registering and running cron-based tasks.
 */
export const Scheduler = Object.freeze({
	configure,
	on,
	schedule,
	start,
	startAll,
	stop,
	stopAll,
	getRegisteredTasks,
});
