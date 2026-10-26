import { closeDb } from '../db/index.js';
import { closeCache } from '../services/cache.js';
import { seedDefaultTenant } from './seed-common.js';

const run = async () => {
  try {
    await seedDefaultTenant();
    console.log('[seed] done');
  } catch (error) {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  } finally {
    await closeCache();
    await closeDb();
  }
  process.exit(process.exitCode ?? 0);
};

void run();
