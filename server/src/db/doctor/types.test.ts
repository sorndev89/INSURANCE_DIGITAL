import assert from 'node:assert/strict';
import test from 'node:test';
import { countIssues, shouldFailDoctor, type DoctorReport } from './types.js';

const report = (overrides: Partial<DoctorReport> = {}): DoctorReport => ({
  mode: 'check',
  status: 'healthy',
  triggeredBy: 'cli',
  startedAt: new Date(0).toISOString(),
  finishedAt: new Date(0).toISOString(),
  durationMs: 0,
  database: null,
  migrations: {
    applied: 0,
    expected: 0,
    currentTag: null,
    latestTag: null,
    pending: [],
  },
  issues: [],
  repairs: [],
  counts: { critical: 0, warning: 0, info: 0 },
  ...overrides,
});

test('counts issues by severity', () => {
  assert.deepEqual(
    countIssues([
      { code: 'a', category: 'schema', severity: 'critical', message: 'a' },
      { code: 'b', category: 'schema', severity: 'warning', message: 'b' },
      { code: 'c', category: 'schema', severity: 'warning', message: 'c' },
    ]),
    { critical: 1, warning: 2, info: 0 },
  );
});

test('critical fails check and repair modes', () => {
  for (const mode of ['check', 'repair'] as const) {
    assert.equal(
      shouldFailDoctor(
        report({ mode, counts: { critical: 1, warning: 0, info: 0 } }),
        'critical',
      ),
      true,
    );
  }
});

test('warning only fails when failOn is warning', () => {
  const warning = report({ counts: { critical: 0, warning: 1, info: 0 } });
  assert.equal(shouldFailDoctor(warning, 'critical'), false);
  assert.equal(shouldFailDoctor(warning, 'warning'), true);
});

test('report mode and never never fail the deploy', () => {
  const critical = report({ counts: { critical: 1, warning: 0, info: 0 } });
  assert.equal(shouldFailDoctor({ ...critical, mode: 'report' }, 'critical'), false);
  assert.equal(shouldFailDoctor(critical, 'never'), false);
  assert.equal(shouldFailDoctor({ ...critical, mode: 'off' }, 'critical'), false);
});
