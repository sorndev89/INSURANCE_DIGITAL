import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareSchemaToSnapshot,
  latestSnapshotPath,
  readSnapshot,
} from './static-check.js';
import { getExpectedSchema, type ExpectedTable } from './schema-snapshot.js';

const expectedTable: ExpectedTable = {
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
  ],
  indexes: [{ name: 'users_id_idx', columns: ['id'], unique: false }],
  foreignKeys: [],
};

const snapshot = {
  tables: {
    users: {
      name: 'users',
      columns: {
        id: { name: 'id', type: 'int', notNull: true },
      },
      indexes: {
        users_id_idx: { name: 'users_id_idx', columns: ['id'], isUnique: false },
      },
      uniqueConstraints: {},
      foreignKeys: {},
    },
  },
};

test('schema and latest snapshot match', () => {
  assert.deepEqual(
    compareSchemaToSnapshot(new Map([['users', expectedTable]]), snapshot),
    [],
  );
});

test('reports missing table, column and index in snapshot', () => {
  const errors = compareSchemaToSnapshot(
    new Map([['accounts', { ...expectedTable, name: 'accounts' }]]),
    snapshot,
  );
  assert.ok(errors.some((error) => error.includes('accounts') && error.includes('table')));
});

test('reports missing column in snapshot', () => {
  const errors = compareSchemaToSnapshot(
    new Map([
      [
        'users',
        {
          ...expectedTable,
          columns: [
            ...expectedTable.columns,
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
        },
      ],
    ]),
    snapshot,
  );
  assert.ok(errors.some((error) => error.includes('users.email')));
});

test('reports type mismatch and missing index', () => {
  const errors = compareSchemaToSnapshot(
    new Map([
      [
        'users',
        {
          ...expectedTable,
          columns: [{ ...expectedTable.columns[0], sqlType: 'bigint' }],
          indexes: [
            ...expectedTable.indexes,
            { name: 'users_missing_idx', columns: ['id'], unique: false },
          ],
        },
      ],
    ]),
    snapshot,
  );
  assert.ok(errors.some((error) => error.includes('type')));
  assert.ok(errors.some((error) => error.includes('users_missing_idx')));
});

test('reports snapshot objects removed from the Drizzle schema', () => {
  const snapshotWithExtra = {
    tables: {
      ...snapshot.tables,
      users: {
        ...snapshot.tables.users,
        columns: {
          ...snapshot.tables.users.columns,
          legacy_flag: { name: 'legacy_flag', type: 'boolean', notNull: false },
        },
      },
    },
  };
  const errors = compareSchemaToSnapshot(new Map([['users', expectedTable]]), snapshotWithExtra);
  assert.ok(errors.some((error) => error.includes('legacy_flag')));
});

test('latest snapshot path points at the final journal entry', () => {
  const path = latestSnapshotPath('./drizzle');
  assert.match(path, /drizzle\/meta\/\d{4}_snapshot\.json$/);
});

test('real schema matches the committed snapshot', () => {
  const snapshotFile = latestSnapshotPath('./drizzle');
  assert.deepEqual(
    compareSchemaToSnapshot(getExpectedSchema(), readSnapshot(snapshotFile)),
    [],
  );
});
