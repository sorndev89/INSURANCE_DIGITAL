import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { closeDb } from './db/index.js';
import { runDatabaseDoctor } from './db/doctor/index.js';
import { printDoctorReport } from './db/doctor/report.js';
import { shouldFailDoctor } from './db/doctor/types.js';
import { closeCache } from './services/cache.js';
import { bootstrapPlatformAdmin } from './services/bootstrap.js';

const bootstrap = async () => {
  if (env.dbDoctorMode !== 'off') {
    const report = await runDatabaseDoctor({
      mode: env.dbDoctorMode,
      failOn: env.dbDoctorFailOn,
      dataChecks: env.dbDoctorDataChecks,
      audit: env.dbDoctorAudit,
      triggeredBy: 'deploy',
      appVersion: env.appVersion,
    });
    printDoctorReport(report);

    if (shouldFailDoctor(report, env.dbDoctorFailOn)) {
      console.error('[db-doctor] critical database issues detected; refusing to start.');
      await closeDb().catch(() => undefined);
      process.exit(1);
    }
  }

  try {
    await bootstrapPlatformAdmin();
  } catch (error) {
    console.error('[bootstrap] platform admin bootstrap failed:', error);
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
