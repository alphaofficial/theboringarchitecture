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
    PinoLogger.info({ scope: 'App', message: `Server running at http://localhost:${port}` });
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

bootstrap().catch(err => {
  PinoLogger.error({ scope: 'App', message: 'Failed to start server', params: { error: err } });
  process.exit(1);
});
