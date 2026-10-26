import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExpectedSchema } from './schema-snapshot.js';

type SnapshotColumn = {
  name: string;
  type: string;
  notNull?: boolean;
};

type SnapshotIndex = {
  name: string;
  columns: string[];
  isUnique?: boolean;
};

type SnapshotForeignKey = {
  name: string;
  columnsFrom: string[];
};

type SnapshotTable = {
  name: string;
  columns: Record<string, SnapshotColumn>;
  indexes: Record<string, SnapshotIndex>;
  uniqueConstraints: Record<string, SnapshotIndex>;
  foreignKeys: Record<string, SnapshotForeignKey>;
};

type Snapshot = {
  tables: Record<string, SnapshotTable>;
};

const normalizeType = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
  return normalized === 'boolean' ? 'tinyint(1)' : normalized;
};

export const latestSnapshotPath = (migrationsFolder: string) => {
  const journalPath = join(migrationsFolder, 'meta', '_journal.json');
  if (!existsSync(journalPath)) throw new Error(`Can't find ${journalPath}`);
  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
    entries?: Array<{ idx?: number }>;
  };
  const index = journal.entries?.at(-1)?.idx;
  if (typeof index !== 'number') throw new Error('Migration journal has no entries');
  return join(migrationsFolder, 'meta', `${String(index).padStart(4, '0')}_snapshot.json`);
};

export const compareSchemaToSnapshot = (
  expected: ExpectedSchema,
  snapshot: Snapshot,
): string[] => {
  const errors: string[] = [];

  for (const [tableName, snapshotTable] of Object.entries(snapshot.tables)) {
    const expectedTable = expected.get(tableName);
    if (!expectedTable) {
      errors.push(`Snapshot table ${tableName} is not present in the Drizzle schema.`);
      continue;
    }

    for (const snapshotColumn of Object.values(snapshotTable.columns)) {
      if (!expectedTable.columns.some((column) => column.name === snapshotColumn.name)) {
        errors.push(
          `Snapshot column ${tableName}.${snapshotColumn.name} is not present in the Drizzle schema.`,
        );
      }
    }

    const snapshotIndexes = {
      ...snapshotTable.indexes,
      ...snapshotTable.uniqueConstraints,
    };
    for (const indexName of Object.keys(snapshotIndexes)) {
      if (!expectedTable.indexes.some((index) => index.name === indexName)) {
        errors.push(
          `Snapshot index ${indexName} on ${tableName} is not present in the Drizzle schema.`,
        );
      }
    }

    for (const foreignKeyName of Object.keys(snapshotTable.foreignKeys)) {
      if (!expectedTable.foreignKeys.some((foreignKey) => foreignKey.name === foreignKeyName)) {
        errors.push(
          `Snapshot foreign key ${foreignKeyName} on ${tableName} is not present in the Drizzle schema.`,
        );
      }
    }
  }

  for (const [tableName, table] of expected) {
    const snapshotTable = snapshot.tables[tableName];
    if (!snapshotTable) {
      errors.push(`Schema table ${tableName} is not present in the latest migration snapshot.`);
      continue;
    }

    for (const column of table.columns) {
      const snapshotColumn = Object.values(snapshotTable.columns).find(
        (candidate) => candidate.name === column.name,
      );
      if (!snapshotColumn) {
        errors.push(
          `Schema column ${tableName}.${column.name} is not present in the latest migration snapshot.`,
        );
        continue;
      }
      if (normalizeType(snapshotColumn.type) !== column.sqlType) {
        errors.push(
          `Column ${tableName}.${column.name} type ${column.sqlType} does not match snapshot type ${snapshotColumn.type}.`,
        );
      }
      if (Boolean(snapshotColumn.notNull) !== column.notNull) {
        errors.push(
          `Column ${tableName}.${column.name} nullability does not match the latest migration snapshot.`,
        );
      }
    }

    const snapshotIndexes = {
      ...snapshotTable.indexes,
      ...snapshotTable.uniqueConstraints,
    };
    for (const index of table.indexes) {
      if (!snapshotIndexes[index.name]) {
        errors.push(
          `Schema index ${index.name} on ${tableName} is not present in the latest migration snapshot.`,
        );
      }
    }

    for (const foreignKey of table.foreignKeys) {
      if (!snapshotTable.foreignKeys[foreignKey.name]) {
        errors.push(
          `Schema foreign key ${foreignKey.name} on ${tableName} is not present in the latest migration snapshot.`,
        );
      }
    }
  }

  return errors;
};

export const readSnapshot = (filePath: string): Snapshot =>
  JSON.parse(readFileSync(filePath, 'utf8')) as Snapshot;
