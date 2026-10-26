import { closeDb } from '../db/index.js';
import { closeCache } from '../services/cache.js';
import { seedDemoData } from './demo-data.js';

const run = async () => {
  try {
    await seedDemoData();
  } catch (error) {
    console.error('[demo] failed:', error);
    process.exitCode = 1;
  } finally {
    await closeCache();
    await closeDb();
  }
  process.exit(process.exitCode ?? 0);
};

void run();
