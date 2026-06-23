import 'dotenv-defaults/config';
import variables from '@/config/variables';
import { Bus } from '@/primitives/bus';
import { shutdown } from '@/primitives/shutdown';
import { createApp } from '@/router/app';
const port = variables.PORT;

async function bootstrap() {
  const { app, ctx } = await createApp();

  /** Starts the server */
  const server = app.listen(port, () => {
    ctx.logger.info({ scope: 'bootstrap', message: 'Server running', url: `http://localhost:${port}`, port });
  });

  /** Starts the event bus */
  Bus.start();

  /** Defines the cleanup functions for the application */
  const disposables = [
    { async stop() { server.close(); } },
    { async stop() { await ctx.db.getConnection().close(true)}}
  ];

  process.on('SIGTERM', () => void shutdown('SIGTERM', disposables));
  process.on('SIGINT', () => void shutdown('SIGINT', disposables));
}

bootstrap().catch(process.exit(1));
