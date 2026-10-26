import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareSchema,
  getExpectedSchema,
  type ActualSchema,
  type ExpectedTable,
} from './schema-snapshot.js';

const table = (overrides: Partial<ExpectedTable> = {}): ExpectedTable => ({
  name: 'users',
  columns: [
    {
      name: 'id',
      sqlType: 'int',
      notNull: true,
      hasDefault: true,
      defaultLiteral: null,
      defaultSql: null,
      primary: true,
      unique: false,
      autoIncrement: true,
    },
    {
      name: 'email',
      sqlType: 'varchar(255)',
      notNull: true,
      hasDefault: false,
      defaultLiteral: null,
      defaultSql: null,
      primary: false,
      unique: false,
      autoIncrement: false,
    },
  ],
  indexes: [{ name: 'users_email_idx', columns: ['email'], unique: false }],
  foreignKeys: [],
  ...overrides,
});

const actual = (overrides: Partial<ActualSchema['tables'] extends Map<string, infer T> ? T : never> = {}): ActualSchema => ({
  tables: new Map([
    [
      'users',
      {
        name: 'users',
        engine: 'InnoDB',
        collation: 'utf8mb4_0900_ai_ci',
        columns: new Map([
          ['id', { name: 'id', type: 'int', nullable: false, primary: true }],
          ['email', { name: 'email', type: 'varchar(255)', nullable: false, primary: false }],
        ]),
        indexes: new Map([
          ['users_email_idx', { name: 'users_email_idx', columns: ['email'], unique: false }],
        ]),
        foreignKeys: new Map(),
        ...overrides,
      },
    ],
  ]),
});

test('matching schema produces no issues', () => {
  const diff = compareSchema(new Map([['users', table()]]), actual());
  assert.deepEqual(diff.issues, []);
  assert.deepEqual(diff.repairColumns, []);
  assert.deepEqual(diff.repairIndexes, []);
});

test('missing table is critical and manual', () => {
  const diff = compareSchema(new Map([['users', table()]]), { tables: new Map() });
  assert.equal(diff.issues[0].code, 'schema_table_missing');
  assert.equal(diff.issues[0].severity, 'critical');
  assert.equal(diff.issues[0].repair, 'manual');
});

test('missing column is queued for additive repair', () => {
  const schema = actual();
  schema.tables.get('users')?.columns.delete('email');
  const diff = compareSchema(new Map([['users', table()]]), schema);

  assert.equal(diff.issues[0].code, 'schema_column_missing');
  assert.equal(diff.issues[0].severity, 'critical');
  assert.deepEqual(diff.repairColumns, [
    { table: 'users', column: table().columns[1] },
  ]);
});

test('column type mismatch is critical but never auto-modified', () => {
  const schema = actual();
  const column = schema.tables.get('users')?.columns.get('email');
  if (column) column.type = 'varchar(100)';
  const diff = compareSchema(new Map([['users', table()]]), schema);

  assert.equal(diff.issues[0].code, 'schema_column_type');
  assert.equal(diff.issues[0].repair, 'manual');
  assert.equal(diff.repairColumns.length, 0);
});

test('nullability mismatch is critical', () => {
  const schema = actual();
  const column = schema.tables.get('users')?.columns.get('email');
  if (column) column.nullable = true;
  const diff = compareSchema(new Map([['users', table()]]), schema);

  assert.ok(diff.issues.some((issue) => issue.code === 'schema_column_nullable'));
});

test('missing index and foreign key are queued for repair', () => {
  const expected = table({
    foreignKeys: [
      {
        name: 'users_tenant_id_tenants_id_fk',
        columns: ['id'],
        refTable: 'tenants',
        refColumns: ['id'],
        onDelete: 'CASCADE',
      },
    ],
  });
  const schema = actual();
  schema.tables.get('users')?.indexes.delete('users_email_idx');
  const diff = compareSchema(new Map([['users', expected]]), schema);

  assert.ok(diff.issues.some((issue) => issue.code === 'schema_index_missing'));
  assert.ok(diff.issues.some((issue) => issue.code === 'schema_foreign_key_missing'));
  assert.equal(diff.repairIndexes[0].index.name, 'users_email_idx');
  assert.equal(diff.repairForeignKeys[0].foreignKey.name, 'users_tenant_id_tenants_id_fk');
});

test('extra database table only produces a warning', () => {
  const schema = actual();
  schema.tables.set('legacy_table', {
    name: 'legacy_table',
    engine: 'InnoDB',
    collation: 'utf8mb4_0900_ai_ci',
    columns: new Map(),
    indexes: new Map(),
    foreignKeys: new Map(),
  });
  const diff = compareSchema(new Map([['users', table()]]), schema);

  assert.equal(diff.issues.length, 1);
  assert.equal(diff.issues[0].code, 'schema_table_extra');
  assert.equal(diff.issues[0].severity, 'warning');
});

test('expected schema includes synthetic unique indexes for column.unique()', () => {
  const expected = getExpectedSchema();
  assert.ok(expected.has('db_doctor_runs'));
  assert.ok(expected.get('plans')?.indexes.some((index) => index.name === 'plans_code_unique'));
  assert.ok(
    expected
      .get('platform_users')
      ?.indexes.some((index) => index.name === 'platform_users_username_unique'),
  );
});
