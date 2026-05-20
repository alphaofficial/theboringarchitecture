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

/**
 * Scheduler primitive for registering and running cron-based tasks.
 */
export class Scheduler {
	private static runtimeKey = 'scheduler';

	static configure(): void {
		if (hasPrimitiveRuntime(Scheduler.runtimeKey)) {
			return;
		}

		registerPrimitiveRuntime<SchedulerRuntime>(Scheduler.runtimeKey, {
			tasks: [],
		});
	}

	private static runtime(): SchedulerRuntime {
		return getPrimitiveRuntime<SchedulerRuntime>(Scheduler.runtimeKey);
	}

	static on(expression: string, handler: () => void | Promise<void>): CronTask {
		if (!cron.validate(expression)) {
			throw new Error(`Invalid cron expression: "${expression}"`);
		}

		const task = cron.schedule(expression, async () => {
			try {
				await handler();
			} catch (err) {
				PinoLogger.error({
					scope: 'scheduler',
					message: `Task failed (${expression})`,
					params: { error: err },
				});
			}
		});

		Scheduler.runtime().tasks.push({ expression, handler, task });
		return task;
	}

	static schedule(expression: string, handler: () => void | Promise<void>): CronTask {
		return Scheduler.on(expression, handler);
	}

	static start(): void {
		loadRelativeDirectory('scheduler');
		PinoLogger.info({ scope: 'scheduler', message: 'Starting scheduler...' });
		Scheduler.startAll();
		const registered = Scheduler.getRegisteredTasks();
		PinoLogger.info({
			scope: 'scheduler',
			message: `Scheduler started with ${registered.length} task(s)`,
			params: { tasks: registered.map(task => task.expression) },
		});
	}

	static startAll(): void {
		Scheduler.runtime().tasks.forEach(entry => entry.task.start());
	}

	static stop(): void {
		PinoLogger.info({ scope: 'scheduler', message: 'Stopping scheduler...' });
		Scheduler.stopAll();
		PinoLogger.info({ scope: 'scheduler', message: 'Scheduler stopped.' });
	}

	static stopAll(): void {
		Scheduler.runtime().tasks.forEach(entry => entry.task.stop());
	}

	static getRegisteredTasks(): ReadonlyArray<{ expression: string }> {
		return Scheduler.runtime().tasks.map(task => ({ expression: task.expression }));
	}
}
