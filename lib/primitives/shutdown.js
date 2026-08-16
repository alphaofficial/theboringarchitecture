import { PinoLogger } from '../logger/pinoLogger.js';

let shuttingDown = false;
/**
 * Stops process resources in order and exits in response to a termination signal.
 * Repeated calls are ignored. The process exits with status 1 if cleanup fails
 * or exceeds the timeout, and status 0 after successful cleanup.
 * @param {string} signal Operating-system signal that initiated shutdown.
 * @param disposables Cleanup callbacks invoked before process exit.
 * @param {number} timeoutMs Maximum time in milliseconds allowed for all cleanup callbacks.
 * @returns {Record<string, string|number|boolean|null>} Rule configuration.
 * @example
 * shutdown(signal, disposables, timeoutMs);
 */
export async function shutdown(signal, disposables = [], timeoutMs = 10_000) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    PinoLogger.info({ scope: 'shutdown', message: 'Received signal, shutting down', signal });
    const timeout = setTimeout(() => {
        process.exitCode = 1;
    }, timeoutMs);
    timeout.unref();
    try {
        await Promise.all(disposables.map(disposable => disposable.stop()));
        clearTimeout(timeout);
        process.exitCode = 0;
    }
    catch (err) {
        PinoLogger.error({
            scope: 'shutdown',
            message: 'Shutdown failed',
            err,
        });
        process.exitCode = 1;
    }
}
