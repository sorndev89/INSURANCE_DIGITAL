import { closeDb } from '../db/index.js';
import { closeCache } from '../services/cache.js';
import { seedDemoData } from './demo-data.js';
import {
  seedDefaultTenant,
  seedPlatformAdmin,
  seedPlatformSuperadmin,
} from './seed-common.js';

const run = async () => {
  try {
    await seedPlatformAdmin();
    await seedPlatformSuperadmin();
    const tenant = await seedDefaultTenant();
    await seedDemoData();
    console.log(`[seed] initial tenant ready: ${tenant.slug}`);
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
