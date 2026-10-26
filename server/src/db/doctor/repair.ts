import type { PoolConnection } from 'mysql2/promise';
import type { DoctorRepair } from './types.js';
import type { ExpectedColumn, ExpectedForeignKey, ExpectedIndex } from './schema-snapshot.js';

const quoteIdent = (value: string) => `\`${value.replace(/`/g, '``')}\``;

const quoteLiteral = (value: string | number | boolean) => {
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  return `'${value.replace(/'/g, "''")}'`;
};

const columnDefinition = (column: ExpectedColumn) => {
  const parts = [quoteIdent(column.name), column.sqlType];
  if (column.autoIncrement) parts.push('AUTO_INCREMENT');
  if (column.notNull) parts.push('NOT NULL');
  if (column.hasDefault) {
    if (column.defaultLiteral !== null && column.defaultLiteral !== undefined) {
      parts.push(`DEFAULT ${quoteLiteral(column.defaultLiteral)}`);
    } else if (column.defaultSql) {
      parts.push(`DEFAULT ${column.defaultSql}`);
    }
  }
  return parts.join(' ');
};

const hasRows = async (connection: PoolConnection, table: string) => {
  const [rows] = await connection.query(
    `SELECT 1 FROM ${quoteIdent(table)} LIMIT 1`,
  );
  return Array.isArray(rows) && rows.length > 0;
};

const hasOrphans = async (
  connection: PoolConnection,
  table: string,
  foreignKey: ExpectedForeignKey,
) => {
  if (foreignKey.columns.length !== 1 || foreignKey.refColumns.length !== 1) {
    return true;
  }
  const [rows] = await connection.query(
    `SELECT 1 FROM ${quoteIdent(table)} source
     WHERE source.${quoteIdent(foreignKey.columns[0])} IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM ${quoteIdent(foreignKey.refTable)} target
         WHERE target.${quoteIdent(foreignKey.refColumns[0])} =
               source.${quoteIdent(foreignKey.columns[0])}
       )
     LIMIT 1`,
  );
  return Array.isArray(rows) && rows.length > 0;
};

export const applySchemaRepairs = async (
  connection: PoolConnection,
  input: {
    columns: Array<{ table: string; column: ExpectedColumn }>;
    indexes: Array<{ table: string; index: ExpectedIndex }>;
    foreignKeys: Array<{ table: string; foreignKey: ExpectedForeignKey }>;
  },
): Promise<DoctorRepair[]> => {
  const repairs: DoctorRepair[] = [];

  for (const { table, column } of input.columns) {
    const code = `repair_column_${table}_${column.name}`;
    const sql = `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${columnDefinition(column)}`;
    try {
      if (column.notNull && !column.hasDefault && (await hasRows(connection, table))) {
        repairs.push({
          code,
          description: `Cannot add NOT NULL column ${table}.${column.name} without a default because the table has rows.`,
          sql,
          applied: false,
          error: 'manual_action_required',
        });
        continue;
      }
      await connection.query(sql);
      repairs.push({
        code,
        description: `Added column ${table}.${column.name}.`,
        sql,
        applied: true,
      });
    } catch (error) {
      repairs.push({
        code,
        description: `Failed to add column ${table}.${column.name}.`,
        sql,
        applied: false,
        error: (error as Error).message,
      });
    }
  }

  for (const { table, index } of input.indexes) {
    const code = `repair_index_${table}_${index.name}`;
    const columns = index.columns.map(quoteIdent).join(', ');
    const sql = `ALTER TABLE ${quoteIdent(table)} ADD ${
      index.unique ? 'UNIQUE ' : ''
    }INDEX ${quoteIdent(index.name)} (${columns})`;
    try {
      await connection.query(sql);
      repairs.push({
        code,
        description: `Added index ${index.name} on ${table}.`,
        sql,
        applied: true,
      });
    } catch (error) {
      repairs.push({
        code,
        description: `Failed to add index ${index.name} on ${table}.`,
        sql,
        applied: false,
        error: (error as Error).message,
      });
    }
  }

  for (const { table, foreignKey } of input.foreignKeys) {
    const code = `repair_foreign_key_${table}_${foreignKey.name}`;
    if (foreignKey.columns.length !== 1 || foreignKey.refColumns.length !== 1) {
      repairs.push({
        code,
        description: `Foreign key ${foreignKey.name} is composite and requires manual repair.`,
        applied: false,
        error: 'manual_action_required',
      });
      continue;
    }

    const sql = `ALTER TABLE ${quoteIdent(table)} ADD CONSTRAINT ${quoteIdent(
      foreignKey.name,
    )} FOREIGN KEY (${quoteIdent(foreignKey.columns[0])}) REFERENCES ${quoteIdent(
      foreignKey.refTable,
    )} (${quoteIdent(foreignKey.refColumns[0])}) ON DELETE ${foreignKey.onDelete}`;

    try {
      if (await hasOrphans(connection, table, foreignKey)) {
        repairs.push({
          code,
          description: `Skipped foreign key ${foreignKey.name}: orphan rows must be fixed first.`,
          sql,
          applied: false,
          error: 'orphan_rows',
        });
        continue;
      }
      await connection.query(sql);
      repairs.push({
        code,
        description: `Added foreign key ${foreignKey.name} on ${table}.`,
        sql,
        applied: true,
      });
    } catch (error) {
      repairs.push({
        code,
        description: `Failed to add foreign key ${foreignKey.name} on ${table}.`,
        sql,
        applied: false,
        error: (error as Error).message,
      });
    }
  }

  return repairs;
};
