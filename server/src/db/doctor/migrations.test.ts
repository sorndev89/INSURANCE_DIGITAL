import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeMigrations,
  toMigrationState,
  type AppliedMigration,
  type ExpectedMigration,
} from './migrations.js';

const migration = (tag: string, folderMillis: number, hash = `hash-${tag}`): ExpectedMigration => ({
  tag,
  folderMillis,
  hash,
});

const applied = (
  createdAt: number,
  hash = `hash-m${createdAt}`,
  id = 1,
): AppliedMigration => ({ id, createdAt, hash });

test('pending newer migrations are safe to apply', () => {
  const expected = [migration('0000', 100, 'h0'), migration('0001', 200, 'h1')];
  const analysis = analyzeMigrations(expected, [
    { id: 1, createdAt: 100, hash: 'h0' },
  ]);

  assert.deepEqual(analysis.pending.map((item) => item.tag), ['0001']);
  assert.equal(analysis.outOfOrder.length, 0);
  assert.equal(analysis.issues.length, 0);
  assert.equal(analysis.currentTag, '0000');
  assert.equal(analysis.latestTag, '0001');
});

test('a fresh database marks every migration as pending', () => {
  const expected = [migration('0000', 100), migration('0001', 200)];
  const analysis = analyzeMigrations(expected, []);
  assert.deepEqual(analysis.pending.map((item) => item.tag), ['0000', '0001']);
  assert.equal(analysis.issues.length, 0);
});

test('modified applied migration produces a critical hash mismatch', () => {
  const expected = [migration('0000', 100, 'expected-hash')];
  const analysis = analyzeMigrations(expected, [applied(100, 'changed-hash')]);

  assert.equal(analysis.issues.length, 1);
  assert.equal(analysis.issues[0].code, 'migration_hash_mismatch');
  assert.equal(analysis.issues[0].severity, 'critical');
});

test('applied migration without a file is critical', () => {
  const analysis = analyzeMigrations([migration('0000', 100)], [applied(999)]);
  assert.equal(analysis.issues[0].code, 'migration_file_missing');
  assert.equal(analysis.issues[0].severity, 'critical');
});

test('an older pending migration is out of order and critical', () => {
  const expected = [
    migration('0000', 100),
    migration('0001', 200),
    migration('0002-old', 150),
  ];
  const analysis = analyzeMigrations(expected, [
    { id: 1, createdAt: 100, hash: 'hash-0000' },
    { id: 2, createdAt: 200, hash: 'hash-0001' },
  ]);

  assert.deepEqual(analysis.pending, []);
  assert.deepEqual(analysis.outOfOrder.map((item) => item.tag), ['0002-old']);
  assert.equal(analysis.issues[0].code, 'migration_out_of_order');
  assert.equal(analysis.issues[0].severity, 'critical');
});

test('duplicate applied timestamps are critical', () => {
  const expected = [migration('0000', 100)];
  const analysis = analyzeMigrations(expected, [
    { id: 1, createdAt: 100, hash: 'hash-0000' },
    { id: 2, createdAt: 100, hash: 'hash-0000' },
  ]);

  assert.ok(analysis.issues.some((issue) => issue.code === 'migration_applied_duplicate'));
});

test('migration state exposes counts, tags and pending list', () => {
  const expected = [migration('0000', 100, 'h0'), migration('0001', 200, 'h1')];
  const actual = [{ id: 1, createdAt: 100, hash: 'h0' }];
  const analysis = analyzeMigrations(expected, actual);

  assert.deepEqual(toMigrationState(expected, actual, analysis), {
    applied: 1,
    expected: 2,
    currentTag: '0000',
    latestTag: '0001',
    pending: ['0001'],
  });
});
