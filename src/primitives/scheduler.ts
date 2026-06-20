import * as cron from 'node-cron';
import type { ScheduledTask as CronTask } from 'node-cron';
import { PinoLogger } from '@/logger/pinoLogger';
import { loadRelativeDirectory } from '@/runtime/loadRelativeDirectory';
import { getPrimitiveRuntime, hasPrimitiveRuntime, registerPrimitiveRuntime } from '@/runtime/primitiveRegistry';

export interface ScheduledTask {
	expression: string;
	handler: () => void | Promise<void>;
	task: CronTask;
}

interface SchedulerRuntime {
	tasks: ScheduledTask[];
}

/** Configure the scheduler runtime. */
const configure = (): void => {
	if (hasPrimitiveRuntime('scheduler')) {
		return;
	}

	registerPrimitiveRuntime<SchedulerRuntime>('scheduler', {
		tasks: [],
	});
};

/** Register a cron task. */
const on = (expression: string, handler: () => void | Promise<void>): CronTask => {
	if (!cron.validate(expression)) {
		throw new Error(`Invalid cron expression: "${expression}"`);
	}

	const runTask = async (): Promise<void> => {
		try {
			await handler();
		} catch (err) {
			PinoLogger.error({ scope: 'runTask', message: 'Cron task failed', expression, err });
		}
	};

	const task = cron.schedule(expression, runTask);

	getPrimitiveRuntime<SchedulerRuntime>('scheduler').tasks.push({ expression, handler, task });
	return task;
};

/** Register a cron task. */
const schedule = (expression: string, handler: () => void | Promise<void>): CronTask => {
	return on(expression, handler);
};

/** Start all registered tasks. */
const startAll = (): void => {
	getPrimitiveRuntime<SchedulerRuntime>('scheduler').tasks.forEach(entry => entry.task.start());
};

/** Stop all registered tasks without logging lifecycle messages. */
const stopAll = (): void => {
	getPrimitiveRuntime<SchedulerRuntime>('scheduler').tasks.forEach(entry => entry.task.stop());
};

/** List registered task expressions. */
const getRegisteredTasks = (): ReadonlyArray<{ expression: string }> => {
	return getPrimitiveRuntime<SchedulerRuntime>('scheduler').tasks.map(task => ({ expression: task.expression }));
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
