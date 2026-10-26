import { access, constants } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db, dbPool } from '../index.js';
import { runMigrations } from '../migrate.js';
import { dbDoctorRuns } from '../schema.js';
import { runDataChecks } from './data-checks.js';
import { withDatabaseLock } from './lock.js';
import {
  analyzeMigrations,
  loadExpectedMigrations,
  readAppliedMigrations,
  toMigrationState,
} from './migrations.js';
import { applySchemaRepairs } from './repair.js';
import {
  compareSchema,
  getExpectedSchema,
  readActualSchema,
  type SchemaDiff,
} from './schema-snapshot.js';
import {
  countIssues,
  emptyMigrationState,
  type DatabaseInfo,
  type DoctorIssue,
  type DoctorReport,
  type DoctorRepair,
  type RunDoctorOptions,
} from './types.js';

type DatabaseInfoRow = RowDataPacket & {
  name: string;
  version: string;
  charset: string;
  collation: string;
  timezone: string;
};

const databaseInfo = async (connection: PoolConnection): Promise<DatabaseInfo> => {
  const [rows] = await connection.query<DatabaseInfoRow[]>(
    `SELECT DATABASE() AS name, VERSION() AS version,
            @@character_set_database AS charset,
            @@collation_database AS collation,
            @@session.time_zone AS timezone`,
  );
  const row = rows[0];
  return {
    name: String(row?.name ?? ''),
    version: String(row?.version ?? ''),
    charset: String(row?.charset ?? ''),
    collation: String(row?.collation ?? ''),
    timezone: String(row?.timezone ?? ''),
  };
};

const storageIssues = async (): Promise<DoctorIssue[]> => {
  const directory = resolve(process.env.UPLOADS_DIR || 'uploads');
  try {
    await access(directory, constants.R_OK | constants.W_OK);
    return [];
  } catch {
    return [
      {
        code: 'storage_uploads_unwritable',
        category: 'storage',
        severity: 'warning',
        message: `Uploads directory ${directory} is missing or not writable.`,
      },
    ];
  }
};

const applyRepairs = async (
  connection: PoolConnection,
  diff: SchemaDiff,
): Promise<DoctorRepair[]> =>
  applySchemaRepairs(connection, {
    columns: diff.repairColumns,
    indexes: diff.repairIndexes,
    foreignKeys: diff.repairForeignKeys,
  });

const persistRun = async (report: DoctorReport, options: RunDoctorOptions) => {
  try {
    const [table] = await dbPool.query<RowDataPacket[]>(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'db_doctor_runs' LIMIT 1`,
    );
    if (!table.length) return;

    await db.insert(dbDoctorRuns).values({
      mode: report.mode,
      status: report.status,
      triggeredBy: report.triggeredBy,
      appVersion: options.appVersion ?? null,
      migrationFrom: report.migrations.currentTag ?? null,
      migrationTo: report.migrations.latestTag ?? null,
      issuesCount: report.issues.length,
      repairsCount: report.repairs.filter((repair) => repair.applied).length,
      durationMs: report.durationMs,
      report,
      startedAt: new Date(report.startedAt),
      finishedAt: new Date(report.finishedAt),
    });
  } catch (error) {
    console.warn(`[db-doctor] could not persist audit run: ${(error as Error).message}`);
  }
};

export const runDatabaseDoctor = async (
  options: RunDoctorOptions,
): Promise<DoctorReport> => {
  const startedAt = new Date();
  const report: DoctorReport = {
    mode: options.mode,
    status: 'skipped',
    triggeredBy: options.triggeredBy ?? 'deploy',
    startedAt: startedAt.toISOString(),
    finishedAt: startedAt.toISOString(),
    durationMs: 0,
    database: null,
    migrations: emptyMigrationState(),
    issues: [],
    repairs: [],
    counts: { critical: 0, warning: 0, info: 0 },
  };

  if (options.mode === 'off') {
    return report;
  }

  const issues: DoctorIssue[] = [];
  const repairs: DoctorReport['repairs'] = [];
  const migrationsFolder = options.migrationsFolder || process.env.DRIZZLE_MIGRATIONS_DIR || './drizzle';
  const expectedSchema = getExpectedSchema();

  try {
    await withDatabaseLock(dbPool, Number(process.env.DB_DOCTOR_LOCK_TIMEOUT_MS || 45_000), async (connection) => {
      report.database = await databaseInfo(connection);

      let expectedMigrations = loadExpectedMigrations(migrationsFolder);
      let appliedMigrations = await readAppliedMigrations(connection);
      let migrationAnalysis = analyzeMigrations(expectedMigrations, appliedMigrations);

      if (options.mode === 'repair' && migrationAnalysis.pending.length && !migrationAnalysis.issues.some((issue) => issue.severity === 'critical')) {
        try {
          await runMigrations();
          repairs.push({
            code: 'repair_migrations',
            description: `Applied pending migrations: ${migrationAnalysis.pending.map((migration) => migration.tag).join(', ')}`,
            applied: true,
          });
        } catch (error) {
          issues.push({
            code: 'migration_apply_failed',
            category: 'migration',
            severity: 'critical',
            message: `Failed to apply migrations: ${(error as Error).message}`,
          });
        }
        expectedMigrations = loadExpectedMigrations(migrationsFolder);
        appliedMigrations = await readAppliedMigrations(connection);
        migrationAnalysis = analyzeMigrations(expectedMigrations, appliedMigrations);
      }

      issues.push(...migrationAnalysis.issues);
      report.migrations = toMigrationState(
        expectedMigrations,
        appliedMigrations,
        migrationAnalysis,
      );

      let actualSchema = await readActualSchema(connection);
      let schemaDiff = compareSchema(expectedSchema, actualSchema);
      let schemaRepairs: DoctorReport['repairs'] = [];

      const hasCriticalMigrationIssue = migrationAnalysis.issues.some(
        (issue) => issue.severity === 'critical',
      );
      if (
        options.mode === 'repair' &&
        !hasCriticalMigrationIssue &&
        !schemaDiff.issues.some(
          (issue) => issue.severity === 'critical' && issue.repair === 'manual',
        )
      ) {
        schemaRepairs = await applyRepairs(connection, schemaDiff);
        repairs.push(...schemaRepairs);
        if (schemaRepairs.some((repair) => repair.applied)) {
          actualSchema = await readActualSchema(connection);
          schemaDiff = compareSchema(expectedSchema, actualSchema);
        }
      }

      issues.push(...schemaDiff.issues);

      if (options.dataChecks !== false) {
        const deep = options.dataChecks === 'deep';
        const hasBlockingSchemaIssue = issues.some(
          (issue) =>
            issue.severity === 'critical' &&
            (issue.category === 'migration' || issue.category === 'schema'),
        );
        if (!hasBlockingSchemaIssue) {
          issues.push(
            ...(await runDataChecks(connection, {
              deep,
              budgetMs: Number(process.env.DB_DOCTOR_DATA_BUDGET_MS || 15_000),
            })),
          );
        } else {
          issues.push({
            code: 'data_checks_skipped',
            category: 'data',
            severity: 'info',
            message: 'Data checks were skipped because migration or schema checks have critical issues.',
          });
        }
      }

      issues.push(...(await storageIssues()));
    });
  } catch (error) {
    issues.push({
      code: 'db_doctor_failed',
      category: 'lock',
      severity: 'critical',
      message: `Database doctor failed: ${(error as Error).message}`,
    });
  }

  report.issues = issues;
  report.repairs = repairs;
  report.counts = countIssues(issues);
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - startedAt.getTime();

  if (report.counts.critical > 0) report.status = 'failed';
  else if (repairs.some((repair) => repair.applied)) report.status = 'repaired';
  else if (report.counts.warning > 0) report.status = 'warning';
  else report.status = 'healthy';

  if (options.audit !== false) {
    await persistRun(report, options);
  }

  return report;
};

export const doctorNeedsAttention = (report: DoctorReport) =>
  report.status === 'failed' || report.counts.warning > 0;

