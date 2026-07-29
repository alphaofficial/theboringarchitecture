import 'dotenv-defaults/config.js';
import { shutdown } from './primitives/shutdown.js';
import { startWorker } from '../lib/runtime/startWorker.js';
/**
 * Starts the queue and scheduler worker and installs graceful-shutdown handlers.
 *
 * @returns {Promise<void>} Resolves once both background runtimes have started.
 */
async function bootstrap() {
    const disposables = await startWorker();
    process.on('SIGTERM', () => void shutdown('SIGTERM', [...disposables]));
    process.on('SIGINT', () => void shutdown('SIGINT', [...disposables]));
}
bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
});
