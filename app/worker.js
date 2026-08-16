import 'dotenv-defaults/config.js';
import { shutdown } from '../lib/primitives/shutdown.js';
import { startWorker } from '../lib/runtime/startWorker.js';

/**
 * Starts the queue and scheduler worker and installs graceful-shutdown handlers.
 *
 * @returns {Promise<void>} Resolves once both background runtimes have started.
 */
async function bootstrap() {
    const disposables = await startWorker();
    process.on('SIGTERM', async () => shutdown('SIGTERM', [...disposables]));
    process.on('SIGINT', async () => shutdown('SIGINT', [...disposables]));
}
bootstrap().catch(err => {
    process.stderr.write(`${String(err)}\n`);
    process.exitCode = 1;
});
