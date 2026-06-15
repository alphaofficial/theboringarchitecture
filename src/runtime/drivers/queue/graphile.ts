import { quickAddJob, run } from 'graphile-worker';
import type { Runner, Task } from 'graphile-worker';
import { PinoLogger } from '@/logger/pinoLogger';
import type { QueueDriver, QueueHandler } from '@/primitives/queue';

export function createGraphileQueueDriver(connectionString?: string): QueueDriver {
	let runner: Runner | null = null;
	let runnerPromise: Promise<Runner> | null = null;

	return {
		start(handlers: ReadonlyMap<string, QueueHandler>): void {
			if (runner || runnerPromise) {
				return;
			}

			if (!connectionString) {
				PinoLogger.warn({
					scope: 'queue',
					message: 'DATABASE_URL not set — queue worker is disabled',
				});
				return;
			}

			PinoLogger.info({ scope: 'queue', message: 'Starting queue...' });

			const taskList = Object.fromEntries(handlers) as Record<string, Task>;
			runnerPromise = run({
				connectionString,
				taskList,
				parsedCronItems: [],
				crontabFile: undefined,
			});

			void runnerPromise
				.then(startedRunner => {
					runner = startedRunner;
					runnerPromise = null;
					PinoLogger.info({ scope: 'queue', message: 'Queue started.' });
				})
				.catch(err => {
					runnerPromise = null;
					PinoLogger.error({
						scope: 'queue',
						message: 'Queue failed to start',
						params: { error: err },
					});
					process.exit(1);
				});
		},

		async stop(): Promise<void> {
			if (runnerPromise) {
				await runnerPromise.catch(() => undefined);
			}

			if (!runner) {
				return;
			}

			PinoLogger.info({ scope: 'queue', message: 'Stopping queue...' });
			await runner.stop();
			runner = null;
			PinoLogger.info({ scope: 'queue', message: 'Queue stopped.' });
		},

		async dispatch(jobName: string, payload: unknown = {}): Promise<void> {
			if (!connectionString) {
				PinoLogger.warn({
					scope: 'queue',
					message: 'DATABASE_URL not set — job dispatch is a no-op',
					params: { jobName },
				});
				return;
			}

			await quickAddJob({ connectionString }, jobName, payload);
		},
	};
}
