import * as cron from 'node-cron';
import type { ScheduledTask as CronTask } from 'node-cron';
import { PinoLogger } from '@/logger/pinoLogger';
import type { ScheduledTask, SchedulerDriver } from '@/primitives/scheduler';

interface NodeCronTask extends ScheduledTask {
	task: CronTask;
}

interface NodeCronSchedulerState {
	tasks: NodeCronTask[];
}

const createScheduledTask = (
	state: NodeCronSchedulerState,
	expression: string,
	handler: () => void | Promise<void>,
): ScheduledTask => {
	if (!cron.validate(expression)) {
		throw new Error(`Invalid cron expression: "${expression}"`);
	}

	const runTask = async (): Promise<void> => {
		try {
			await handler();
		} catch (err) {
			PinoLogger.error({ scope: 'nodeCronSchedulerDriver', message: 'Cron task failed', expression, err });
		}
	};

	const task = cron.createTask(expression, runTask);
	const scheduledTask: NodeCronTask = {
		expression,
		handler,
		task,
		start: () => task.start(),
		stop: () => task.stop(),
	};

	state.tasks.push(scheduledTask);
	return scheduledTask;
};

export function createNodeCronSchedulerDriver(): SchedulerDriver {
	const state: NodeCronSchedulerState = { tasks: [] };

	return {
		schedule: (expression, handler) => createScheduledTask(state, expression, handler),
		startAll: () => {
			state.tasks.forEach(entry => entry.task.start());
		},
		stopAll: () => {
			state.tasks.forEach(entry => entry.task.stop());
		},
		getRegisteredTasks: () => state.tasks.map(task => ({ expression: task.expression })),
	};
}
