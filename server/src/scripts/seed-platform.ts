import { closeDb } from '../db/index.js';
import { closeCache } from '../services/cache.js';
import { ensurePlans, seedPlatformAdmin, seedPlatformSuperadmin } from './seed-common.js';

const run = async () => {
  try {
    await ensurePlans();
    await seedPlatformAdmin();
    await seedPlatformSuperadmin();
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
