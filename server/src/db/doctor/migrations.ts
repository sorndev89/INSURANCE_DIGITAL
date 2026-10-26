import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { DoctorIssue, MigrationState } from './types.js';

export type ExpectedMigration = {
  tag: string;
  folderMillis: number;
  hash: string;
};

export type AppliedMigration = {
  id: number;
  hash: string;
  createdAt: number;
};

type AppliedRow = RowDataPacket & {
  id: number;
  hash: string;
  created_at: number | string;
};

export const loadExpectedMigrations = (migrationsFolder: string): ExpectedMigration[] => {
  const journalPath = join(migrationsFolder, 'meta', '_journal.json');
  if (!existsSync(journalPath)) {
    throw new Error(`Can't find ${journalPath}`);
  }

  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
    entries?: Array<{ tag?: string; when?: number }>;
  };

  return (journal.entries ?? [])
    .filter((entry): entry is { tag: string; when: number } =>
      typeof entry.tag === 'string' && typeof entry.when === 'number',
    )
    .map((entry) => {
      const migrationPath = join(migrationsFolder, `${entry.tag}.sql`);
      if (!existsSync(migrationPath)) {
        throw new Error(`Migration file is missing: ${migrationPath}`);
      }
      const sql = readFileSync(migrationPath, 'utf8');
      return {
        tag: entry.tag,
        folderMillis: entry.when,
        hash: createHash('sha256').update(sql).digest('hex'),
      };
    })
    .sort((left, right) => left.folderMillis - right.folderMillis);
};

export const readAppliedMigrations = async (
  connection: PoolConnection,
): Promise<AppliedMigration[]> => {
  const [tables] = await connection.query<RowDataPacket[]>(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = '__drizzle_migrations' LIMIT 1`,
  );
  if (!tables.length) return [];

  const [rows] = await connection.query<AppliedRow[]>(
    'SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY created_at ASC, id ASC',
  );

  return rows.map((row) => ({
    id: Number(row.id),
    hash: String(row.hash),
    createdAt: Number(row.created_at),
  }));
};

export type MigrationAnalysis = {
  issues: DoctorIssue[];
  pending: ExpectedMigration[];
  outOfOrder: ExpectedMigration[];
  latestTag: string | null;
  currentTag: string | null;
};

export const analyzeMigrations = (
  expected: ExpectedMigration[],
  applied: AppliedMigration[],
): MigrationAnalysis => {
  const issues: DoctorIssue[] = [];
  const expectedByTime = new Map<number, ExpectedMigration>();
  const appliedByTime = new Map<number, AppliedMigration>();
  const pending: ExpectedMigration[] = [];
  const outOfOrder: ExpectedMigration[] = [];

  for (const migration of expected) {
    if (expectedByTime.has(migration.folderMillis)) {
      issues.push({
        code: 'migration_duplicate_timestamp',
        category: 'migration',
        severity: 'critical',
        message: `Migration journal has two entries with timestamp ${migration.folderMillis}.`,
      });
    }
    expectedByTime.set(migration.folderMillis, migration);
  }

  for (const migration of applied) {
    if (appliedByTime.has(migration.createdAt)) {
      issues.push({
        code: 'migration_applied_duplicate',
        category: 'migration',
        severity: 'critical',
        message: `Database has duplicate applied migration timestamp ${migration.createdAt}.`,
      });
    }
    appliedByTime.set(migration.createdAt, migration);

    const expectedMigration = expectedByTime.get(migration.createdAt);
    if (!expectedMigration) {
      issues.push({
        code: 'migration_file_missing',
        category: 'migration',
        severity: 'critical',
        message: `Database has migration ${migration.createdAt} but no matching file in drizzle/meta/_journal.json.`,
      });
      continue;
    }
    if (expectedMigration.hash !== migration.hash) {
      issues.push({
        code: 'migration_hash_mismatch',
        category: 'migration',
        severity: 'critical',
        message: `Migration ${expectedMigration.tag} was modified after it was applied. Create a new migration instead of editing history.`,
        details: {
          expectedHash: expectedMigration.hash,
          appliedHash: migration.hash,
        },
      });
    }
  }

  const maxApplied =
    applied.length > 0 ? Math.max(...applied.map((migration) => migration.createdAt)) : 0;

  for (const migration of expected) {
    if (appliedByTime.has(migration.folderMillis)) continue;

    if (applied.length === 0 || migration.folderMillis > maxApplied) {
      pending.push(migration);
    } else {
      outOfOrder.push(migration);
      issues.push({
        code: 'migration_out_of_order',
        category: 'migration',
        severity: 'critical',
        message: `Pending migration ${migration.tag} is older than the latest applied migration. Drizzle will silently skip it. Renumber it before deploying.`,
      });
    }
  }

  const latestExpected = expected.at(-1) ?? null;
  const currentExpected =
    maxApplied > 0
      ? [...expected].reverse().find((migration) => migration.folderMillis <= maxApplied) ?? null
      : null;

  return {
    issues,
    pending,
    outOfOrder,
    latestTag: latestExpected?.tag ?? null,
    currentTag: currentExpected?.tag ?? null,
  };
};

export const toMigrationState = (
  expected: ExpectedMigration[],
  applied: AppliedMigration[],
  analysis: MigrationAnalysis,
): MigrationState => ({
  applied: applied.length,
  expected: expected.length,
  currentTag: analysis.currentTag,
  latestTag: analysis.latestTag,
  pending: analysis.pending.map((migration) => migration.tag),
});
