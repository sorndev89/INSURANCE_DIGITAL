import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { closeDb } from './db/index.js';
import { runMigrations } from './db/migrate.js';
import { closeCache } from './services/cache.js';

const bootstrap = async () => {
  if (env.runMigrationsOnStart) {
    await runMigrations();
  }

  const app = createApp();
  const server = createServer(app);

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[server] port ${env.port} is already in use.`);
      console.error(
        `[server] stop the process using it (lsof -nP -iTCP:${env.port} -sTCP:LISTEN) or run: PORT=${
          env.port + 1
        } npm run dev`,
      );
      process.exit(1);
    }
    console.error('[server] failed:', error);
    process.exit(1);
  });

  server.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] received ${signal}, shutting down`);
    server.close(async () => {
      await closeCache();
      await closeDb();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

bootstrap().catch((error) => {
  console.error('[server] failed to start:', error);
  process.exit(1);
});
