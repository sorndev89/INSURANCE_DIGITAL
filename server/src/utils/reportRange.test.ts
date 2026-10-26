import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from './errors.js';
import {
  addDays,
  monthKeys,
  previousRange,
  resolveReportRange,
  trailingMonths,
} from './reportRange.js';

test('resolveReportRange keeps explicit inclusive dates', () => {
  assert.deepEqual(resolveReportRange({ from: '2026-01-01', to: '2026-03-31' }), {
    from: '2026-01-01',
    to: '2026-03-31',
  });
});

test('resolveReportRange rejects invalid dates and reversed ranges', () => {
  assert.throws(
    () => resolveReportRange({ from: '2026-02-30', to: '2026-03-31' }),
    (error) => error instanceof ApiError && error.code === 'bad_request',
  );
  assert.throws(
    () => resolveReportRange({ from: '2026-04-01', to: '2026-03-31' }),
    (error) => error instanceof ApiError && error.code === 'bad_request',
  );
});

test('resolveReportRange defaults to a 12-month window', () => {
  const range = resolveReportRange({});
  assert.match(range.from, /^\d{4}-\d{2}-01$/);
  assert.match(range.to, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(range.from <= range.to);
});

test('previousRange returns the equal-length period before the range', () => {
  assert.deepEqual(previousRange({ from: '2026-10-01', to: '2026-10-31' }), {
    from: '2026-08-31',
    to: '2026-09-30',
  });
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('monthKeys lists every month touched by the range', () => {
  assert.deepEqual(monthKeys({ from: '2025-12-15', to: '2026-02-02' }), [
    '2025-12',
    '2026-01',
    '2026-02',
  ]);
});

test('trailingMonths anchors the window to the end date', () => {
  assert.deepEqual(trailingMonths('2026-10-15', 12), {
    from: '2025-11-01',
    to: '2026-10-31',
  });
});
