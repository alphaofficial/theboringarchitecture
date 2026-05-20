import { quickAddJob, run } from 'graphile-worker';
import type { Runner, Task } from 'graphile-worker';
import { PinoLogger } from '@/logger/pinoLogger';
import type { QueueDriver, QueueHandler } from '@/primitives/queue';

export class Graphile implements QueueDriver {
	private runner: Runner | null = null;
	private runnerPromise: Promise<Runner> | null = null;

	constructor(private readonly connectionString?: string) {}

	start(handlers: ReadonlyMap<string, QueueHandler>): void {
		if (this.runner || this.runnerPromise) {
			return;
		}

		if (!this.connectionString) {
			PinoLogger.warn({
				scope: 'queue',
				message: 'DATABASE_URL not set — queue worker is disabled',
			});
			return;
		}

		PinoLogger.info({ scope: 'queue', message: 'Starting queue...' });

		const taskList = Object.fromEntries(handlers) as Record<string, Task>;
		this.runnerPromise = run({
			connectionString: this.connectionString,
			taskList,
			parsedCronItems: [],
			crontabFile: undefined,
		});

		void this.runnerPromise
			.then(runner => {
				this.runner = runner;
				this.runnerPromise = null;
				PinoLogger.info({ scope: 'queue', message: 'Queue started.' });
			})
			.catch(err => {
				this.runnerPromise = null;
				PinoLogger.error({
					scope: 'queue',
					message: 'Queue failed to start',
					params: { error: err },
				});
				process.exit(1);
			});
	}

	async stop(): Promise<void> {
		if (this.runnerPromise) {
			await this.runnerPromise.catch(() => undefined);
		}

		if (!this.runner) {
			return;
		}

		PinoLogger.info({ scope: 'queue', message: 'Stopping queue...' });
		await this.runner.stop();
		this.runner = null;
		PinoLogger.info({ scope: 'queue', message: 'Queue stopped.' });
	}

	async dispatch(jobName: string, payload: unknown = {}): Promise<void> {
		if (!this.connectionString) {
			PinoLogger.warn({
				scope: 'queue',
				message: 'DATABASE_URL not set — job dispatch is a no-op',
				params: { jobName },
			});
			return;
		}

		await quickAddJob({ connectionString: this.connectionString }, jobName, payload);
	}
}
