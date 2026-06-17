import 'dotenv-defaults/config';
import { PinoLogger } from '@/logger/pinoLogger';
import variables from '@/config/variables';
import { Bus } from '@/primitives/bus';
import { shutdown } from '@/primitives/shutdown';
import { createApp } from '@/router/app';
const port = variables.PORT;

async function bootstrap() {
  const { app, orm } = await createApp();
  Bus.start();

  const server = app.listen(port, () => {
    PinoLogger.info({ scope: 'bootstrap', message: 'Server running', url: `http://localhost:${port}`, port });
  });

  const disposables = [{
    async stop() {
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close(err => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      }

      await orm.close(true);
    },
  }];

  process.on('SIGTERM', () => void shutdown('SIGTERM', disposables));
  process.on('SIGINT', () => void shutdown('SIGINT', disposables));
}

const onBootstrapError = (err: unknown): void => {
  PinoLogger.error({ scope: 'onBootstrapError', message: 'Failed to start server', err });
  process.exit(1);
};

bootstrap().catch(onBootstrapError);
