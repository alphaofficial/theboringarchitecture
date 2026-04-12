import { run, quickAddJob } from 'graphile-worker';
import type { Runner } from 'graphile-worker';
import { PinoLogger } from '../logger/pinoLogger';
import variables from '../config/variables';

let runner: Runner | null = null;

export async function startWorker(connectionString: string, taskList: Record<string, (payload: unknown) => Promise<void>>) {
	runner = await run({
		connectionString,
		taskList,
		parsedCronItems: [],
		crontabFile: undefined,
	});
	return runner;
}

export async function dispatch(jobName: string, payload: unknown = {}) {
	const connectionString = variables.DATABASE_URL;
	if (!connectionString) {
		PinoLogger.warn('queue', `DATABASE_URL not set — job dispatch is a no-op`, { jobName });
		return;
	}
	await quickAddJob({ connectionString }, jobName, payload);
}
