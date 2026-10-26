import { is } from 'drizzle-orm';
import { getTableConfig, MySqlTable } from 'drizzle-orm/mysql-core';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import * as schema from '../schema.js';
import type { DoctorIssue } from './types.js';

export type ExpectedColumn = {
  name: string;
  sqlType: string;
  notNull: boolean;
  hasDefault: boolean;
  defaultLiteral: string | number | boolean | null;
  defaultSql: string | null;
  primary: boolean;
  unique: boolean;
  autoIncrement: boolean;
};

export type ExpectedIndex = {
  name: string;
  columns: string[];
  unique: boolean;
};

export type ExpectedForeignKey = {
  name: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
  onDelete: string;
};

export type ExpectedTable = {
  name: string;
  columns: ExpectedColumn[];
  indexes: ExpectedIndex[];
  foreignKeys: ExpectedForeignKey[];
};

export type ActualColumn = {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
};

export type ActualIndex = {
  name: string;
  columns: string[];
  unique: boolean;
};

export type ActualForeignKey = {
  name: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
  onDelete: string;
};

export type ActualTable = {
  name: string;
  engine: string;
  collation: string;
  columns: Map<string, ActualColumn>;
  indexes: Map<string, ActualIndex>;
  foreignKeys: Map<string, ActualForeignKey>;
};

export type ExpectedSchema = Map<string, ExpectedTable>;

export type ActualSchema = {
  tables: Map<string, ActualTable>;
};

export type SchemaDiff = {
  issues: DoctorIssue[];
  repairColumns: Array<{ table: string; column: ExpectedColumn }>;
  repairIndexes: Array<{ table: string; index: ExpectedIndex }>;
  repairForeignKeys: Array<{ table: string; foreignKey: ExpectedForeignKey }>;
};

type RawTableRow = RowDataPacket & {
  TABLE_NAME: string;
  ENGINE: string | null;
  TABLE_COLLATION: string | null;
};

type RawColumnRow = RowDataPacket & {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_KEY: string;
};

type RawIndexRow = RowDataPacket & {
  TABLE_NAME: string;
  INDEX_NAME: string;
  NON_UNIQUE: number;
  SEQ_IN_INDEX: number;
  COLUMN_NAME: string;
};

type RawForeignKeyRow = RowDataPacket & {
  TABLE_NAME: string;
  CONSTRAINT_NAME: string;
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
  DELETE_RULE: string;
  ORDINAL_POSITION: number;
};

const normalizeSqlType = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
  if (normalized === 'boolean') return 'tinyint(1)';
  return normalized;
};

const columnName = (column: unknown) => {
  if (column && typeof column === 'object' && 'name' in column) {
    return String((column as { name: unknown }).name);
  }
  return '';
};

const defaultValue = (column: ReturnType<typeof getTableConfig>['columns'][number]) => {
  if (!column.hasDefault) {
    return { literal: null, sql: null };
  }
  const value = column.default;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return { literal: value, sql: null };
  }
  if (normalizeSqlType(column.getSQLType()) === 'timestamp') {
    return { literal: null, sql: 'CURRENT_TIMESTAMP' };
  }
  return { literal: null, sql: null };
};

export const getExpectedSchema = (): Map<string, ExpectedTable> => {
  const expected = new Map<string, ExpectedTable>();

  for (const value of Object.values(schema)) {
    if (!is(value, MySqlTable)) continue;
    const config = getTableConfig(value);
    const columns: ExpectedColumn[] = config.columns.map((column) => {
      const defaults = defaultValue(column);
      return {
        name: column.name,
        sqlType: normalizeSqlType(column.getSQLType()),
        notNull: column.notNull,
        hasDefault: column.hasDefault,
        defaultLiteral: defaults.literal,
        defaultSql: defaults.sql,
        primary: column.primary,
        unique: column.isUnique,
        autoIncrement: Boolean((column as { autoIncrement?: boolean }).autoIncrement),
      };
    });

    const indexes: ExpectedIndex[] = config.indexes.map((index) => ({
      name: index.config.name,
      columns: index.config.columns.map(columnName).filter(Boolean),
      unique: Boolean(index.config.unique),
    }));

    for (const column of config.columns) {
      if (column.isUnique) {
        indexes.push({
          name: `${config.name}_${column.name}_unique`,
          columns: [column.name],
          unique: true,
        });
      }
    }

    const foreignKeys: ExpectedForeignKey[] = config.foreignKeys.map((foreignKey) => {
      const reference = foreignKey.reference();
      return {
        name: foreignKey.getName(),
        columns: reference.columns.map((column) => column.name),
        refTable: getTableConfig(reference.foreignTable).name,
        refColumns: reference.foreignColumns.map((column) => column.name),
        onDelete: String(foreignKey.onDelete ?? 'no action').toUpperCase(),
      };
    });

    expected.set(config.name, { name: config.name, columns, indexes, foreignKeys });
  }

  return expected;
};

export const readActualSchema = async (connection: PoolConnection): Promise<ActualSchema> => {
  const tables = new Map<string, ActualTable>();

  const [tableRows] = await connection.query<RawTableRow[]>(
    `SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()`,
  );
  for (const row of tableRows) {
    tables.set(row.TABLE_NAME, {
      name: row.TABLE_NAME,
      engine: row.ENGINE ?? '',
      collation: row.TABLE_COLLATION ?? '',
      columns: new Map(),
      indexes: new Map(),
      foreignKeys: new Map(),
    });
  }

  const [columnRows] = await connection.query<RawColumnRow[]>(
    `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
     ORDER BY TABLE_NAME, ORDINAL_POSITION`,
  );
  for (const row of columnRows) {
    tables.get(row.TABLE_NAME)?.columns.set(row.COLUMN_NAME, {
      name: row.COLUMN_NAME,
      type: normalizeSqlType(row.COLUMN_TYPE),
      nullable: row.IS_NULLABLE === 'YES',
      primary: row.COLUMN_KEY === 'PRI',
    });
  }

  const [indexRows] = await connection.query<RawIndexRow[]>(
    `SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
     ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
  );
  for (const row of indexRows) {
    if (row.INDEX_NAME === 'PRIMARY') continue;
    const table = tables.get(row.TABLE_NAME);
    if (!table) continue;
    const existing = table.indexes.get(row.INDEX_NAME) ?? {
      name: row.INDEX_NAME,
      columns: [],
      unique: Number(row.NON_UNIQUE) === 0,
    };
    existing.columns.push(row.COLUMN_NAME);
    table.indexes.set(row.INDEX_NAME, existing);
  }

  const [foreignKeyRows] = await connection.query<RawForeignKeyRow[]>(
    `SELECT kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.COLUMN_NAME,
            kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME,
            rc.DELETE_RULE, kcu.ORDINAL_POSITION
     FROM information_schema.KEY_COLUMN_USAGE kcu
     JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
       ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
      AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
     WHERE kcu.TABLE_SCHEMA = DATABASE()
       AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
     ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME, kcu.ORDINAL_POSITION`,
  );
  for (const row of foreignKeyRows) {
    const table = tables.get(row.TABLE_NAME);
    if (!table) continue;
    const existing = table.foreignKeys.get(row.CONSTRAINT_NAME) ?? {
      name: row.CONSTRAINT_NAME,
      columns: [],
      refTable: row.REFERENCED_TABLE_NAME,
      refColumns: [],
      onDelete: String(row.DELETE_RULE).toUpperCase(),
    };
    existing.columns.push(row.COLUMN_NAME);
    existing.refColumns.push(row.REFERENCED_COLUMN_NAME);
    table.foreignKeys.set(row.CONSTRAINT_NAME, existing);
  }

  return { tables };
};

const sameColumns = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const compareSchema = (
  expected: Map<string, ExpectedTable>,
  actual: ActualSchema,
): SchemaDiff => {
  const issues: DoctorIssue[] = [];
  const repairColumns: SchemaDiff['repairColumns'] = [];
  const repairIndexes: SchemaDiff['repairIndexes'] = [];
  const repairForeignKeys: SchemaDiff['repairForeignKeys'] = [];

  for (const [tableName, expectedTable] of expected) {
    const actualTable = actual.tables.get(tableName);
    if (!actualTable) {
      issues.push({
        code: 'schema_table_missing',
        category: 'schema',
        severity: 'critical',
        message: `Table ${tableName} is missing.`,
        repair: 'manual',
      });
      continue;
    }

    if (actualTable.engine && actualTable.engine.toLowerCase() !== 'innodb') {
      issues.push({
        code: 'schema_table_engine',
        category: 'schema',
        severity: 'warning',
        message: `Table ${tableName} uses ${actualTable.engine} instead of InnoDB.`,
      });
    }
    if (actualTable.collation && !actualTable.collation.startsWith('utf8mb4')) {
      issues.push({
        code: 'schema_table_collation',
        category: 'schema',
        severity: 'warning',
        message: `Table ${tableName} uses collation ${actualTable.collation}, expected utf8mb4.`,
      });
    }

    for (const column of expectedTable.columns) {
      const actualColumn = actualTable.columns.get(column.name);
      if (!actualColumn) {
        issues.push({
          code: 'schema_column_missing',
          category: 'schema',
          severity: 'critical',
          message: `Column ${tableName}.${column.name} is missing.`,
          details: { expectedType: column.sqlType },
          repair: 'add_column',
        });
        repairColumns.push({ table: tableName, column });
        continue;
      }
      if (actualColumn.type !== column.sqlType) {
        issues.push({
          code: 'schema_column_type',
          category: 'schema',
          severity: 'critical',
          message: `Column ${tableName}.${column.name} has type ${actualColumn.type}, expected ${column.sqlType}.`,
          repair: 'manual',
        });
      }
      if (actualColumn.nullable === column.notNull) {
        issues.push({
          code: 'schema_column_nullable',
          category: 'schema',
          severity: 'critical',
          message: `Column ${tableName}.${column.name} nullability does not match schema.`,
          repair: 'manual',
        });
      }
      if (column.primary && !actualColumn.primary) {
        issues.push({
          code: 'schema_primary_key_missing',
          category: 'schema',
          severity: 'critical',
          message: `Primary key is missing on ${tableName}.${column.name}.`,
          repair: 'manual',
        });
      }
    }

    for (const index of expectedTable.indexes) {
      const actualIndex = actualTable.indexes.get(index.name);
      if (!actualIndex) {
        issues.push({
          code: 'schema_index_missing',
          category: 'schema',
          severity: 'critical',
          message: `Index ${index.name} is missing on ${tableName}.`,
          details: { columns: index.columns, unique: index.unique },
          repair: 'add_index',
        });
        repairIndexes.push({ table: tableName, index });
        continue;
      }
      if (
        actualIndex.unique !== index.unique ||
        !sameColumns(actualIndex.columns, index.columns)
      ) {
        issues.push({
          code: 'schema_index_mismatch',
          category: 'schema',
          severity: 'critical',
          message: `Index ${index.name} on ${tableName} does not match schema.`,
          details: { expected: index, actual: actualIndex },
          repair: 'manual',
        });
      }
    }

    for (const foreignKey of expectedTable.foreignKeys) {
      const actualForeignKey = actualTable.foreignKeys.get(foreignKey.name);
      if (!actualForeignKey) {
        issues.push({
          code: 'schema_foreign_key_missing',
          category: 'schema',
          severity: 'warning',
          message: `Foreign key ${foreignKey.name} is missing on ${tableName}.`,
          details: foreignKey,
          repair: 'add_foreign_key',
        });
        repairForeignKeys.push({ table: tableName, foreignKey });
        continue;
      }
      if (
        actualForeignKey.refTable !== foreignKey.refTable ||
        actualForeignKey.onDelete !== foreignKey.onDelete ||
        !sameColumns(actualForeignKey.columns, foreignKey.columns) ||
        !sameColumns(actualForeignKey.refColumns, foreignKey.refColumns)
      ) {
        issues.push({
          code: 'schema_foreign_key_mismatch',
          category: 'schema',
          severity: 'warning',
          message: `Foreign key ${foreignKey.name} on ${tableName} does not match schema.`,
          details: { expected: foreignKey, actual: actualForeignKey },
          repair: 'manual',
        });
      }
    }
  }

  for (const tableName of actual.tables.keys()) {
    if (!expected.has(tableName) && tableName !== '__drizzle_migrations') {
      issues.push({
        code: 'schema_table_extra',
        category: 'schema',
        severity: 'warning',
        message: `Table ${tableName} exists in the database but not in the Drizzle schema.`,
      });
    }
  }

  return { issues, repairColumns, repairIndexes, repairForeignKeys };
};
