import { PinoLogger } from '../../lib/logger/pinoLogger.js';
let shuttingDown = false;
/**
 * Stops process resources in order and exits in response to a termination signal.
 *
 * Repeated calls are ignored. The process exits with status 1 if cleanup fails
 * or exceeds the timeout, and status 0 after successful cleanup.
 *
 * @param {'SIGTERM'|'SIGINT'} signal - Signal that initiated shutdown.
 * @param {Array<{stop: () => void|Promise<void>}>} [disposables=[]] - Resources to stop sequentially.
 * @param {number} [timeoutMs=10000] - Maximum cleanup time before a forced failure exit.
 * @returns {Promise<void>} Resolves only if the host intercepts the process exit.
 */
export async function shutdown(signal, disposables = [], timeoutMs = 10_000) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    PinoLogger.info({ scope: 'shutdown', message: 'Received signal, shutting down', signal });
    const timeout = setTimeout(() => process.exit(1), timeoutMs);
    timeout.unref();
    try {
        for (const disposable of disposables) {
            await disposable.stop();
        }
        clearTimeout(timeout);
        process.exit(0);
    }
    catch (err) {
        PinoLogger.error({
            scope: 'shutdown',
            message: 'Shutdown failed',
            err,
        });
        process.exit(1);
    }
}
