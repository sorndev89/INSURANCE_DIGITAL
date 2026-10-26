import { getExpectedSchema } from '../db/doctor/schema-snapshot.js';
import {
  compareSchemaToSnapshot,
  latestSnapshotPath,
  readSnapshot,
} from '../db/doctor/static-check.js';

const folder = process.env.DRIZZLE_MIGRATIONS_DIR || './drizzle';

try {
  const snapshotPath = latestSnapshotPath(folder);
  const snapshot = readSnapshot(snapshotPath);
  const errors = compareSchemaToSnapshot(getExpectedSchema(), snapshot);

  if (errors.length) {
    console.error('[db-static-check] schema and migrations are out of sync:');
    for (const error of errors) console.error(`  - ${error}`);
    console.error('[db-static-check] run: npm run db:generate');
    process.exit(1);
  }

  console.log(`[db-static-check] OK (${snapshotPath})`);
} catch (error) {
  console.error(`[db-static-check] ${(error as Error).message}`);
  process.exit(1);
}
