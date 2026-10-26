import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index.js';

export const runMigrations = async () => {
  const migrationsFolder = process.env.DRIZZLE_MIGRATIONS_DIR || './drizzle';
  await migrate(db, { migrationsFolder });
};
