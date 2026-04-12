import 'dotenv-defaults/config';
import { Queue } from './lib/queue';
import { sendWelcomeEmail } from './jobs/sendWelcomeEmail';
import { PinoLogger } from './logger/pinoLogger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	PinoLogger.error('worker', 'DATABASE_URL is not set. Worker requires a PostgreSQL connection.');
	process.exit(1);
}

const taskList = {
	sendWelcomeEmail,
};

PinoLogger.info('worker', 'Starting Graphile Worker...');

Queue.start(connectionString, taskList)
	.then(runner => {
		PinoLogger.info('worker', 'Worker started and listening for jobs.');
		const shutdown = async () => {
			PinoLogger.info('worker', 'Shutting down worker...');
			await runner.stop();
			process.exit(0);
		};
		process.on('SIGTERM', shutdown);
		process.on('SIGINT', shutdown);
	})
	.catch(err => {
		PinoLogger.error('worker', 'Worker failed to start', { error: err });
		process.exit(1);
	});
