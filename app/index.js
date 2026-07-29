import 'dotenv-defaults/config.js';
import variables from '../config/variables.js';
import { Bus } from './primitives/bus.js';
import { shutdown } from './primitives/shutdown.js';
import { createApp } from './router/app.js';
import { PinoLogger } from '../lib/logger/pinoLogger.js';
const port = variables.PORT;
/**
 * Starts the HTTP application and installs graceful-shutdown handlers.
 *
 * @returns {Promise<void>} Resolves after the server and process handlers are initialized.
 * @throws {unknown} Re-throws application initialization failures after logging them.
 */
async function bootstrap() {
    const scope = "ApplicationBootstrap";
    try {
        const { app, ctx } = await createApp();
        const server = app.listen(port, () => {
            PinoLogger.info({ scope: 'bootstrap', message: 'Server running', url: `http://localhost:${port}`, port });
        });
        await Bus.start();
        const disposables = [
            { async stop() { server.close(); } },
            { async stop() { await ctx.db.getConnection().close(true); } }
        ];
        process.on('SIGTERM', () => void shutdown('SIGTERM', disposables));
        process.on('SIGINT', () => void shutdown('SIGINT', disposables));
    }
    catch (error) {
        PinoLogger.error({ scope, message: 'Failed to start the application', err: error });
        throw error;
    }
}
bootstrap().catch(_err => process.exit(1));
