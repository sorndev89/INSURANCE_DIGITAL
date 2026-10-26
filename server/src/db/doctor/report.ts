import type { DoctorReport } from './types.js';

const severityLabel = {
  critical: 'CRITICAL',
  warning: 'WARNING',
  info: 'INFO',
} as const;

export const formatDoctorReport = (report: DoctorReport): string => {
  const lines: string[] = [];
  lines.push('[db-doctor] SAIYFON database health check');
  lines.push(
    `[db-doctor] mode=${report.mode} status=${report.status} duration=${report.durationMs}ms`,
  );

  if (report.database) {
    lines.push(
      `[db-doctor] database=${report.database.name} mysql=${report.database.version} ` +
        `charset=${report.database.charset} collation=${report.database.collation}`,
    );
  }

  lines.push(
    `[db-doctor] migrations applied=${report.migrations.applied}/${report.migrations.expected} ` +
      `current=${report.migrations.currentTag ?? '-'} latest=${report.migrations.latestTag ?? '-'}`,
  );
  if (report.migrations.pending.length) {
    lines.push(`[db-doctor] pending migrations: ${report.migrations.pending.join(', ')}`);
  }

  if (report.repairs.length) {
    lines.push(`[db-doctor] repairs (${report.repairs.length}):`);
    for (const repair of report.repairs) {
      const suffix = repair.applied ? 'applied' : `skipped (${repair.error ?? 'not applied'})`;
      lines.push(`  - ${repair.description} [${suffix}]`);
      if (repair.sql) lines.push(`    SQL: ${repair.sql}`);
    }
  }

  if (report.issues.length) {
    lines.push(`[db-doctor] issues (${report.issues.length}):`);
    for (const issue of report.issues) {
      lines.push(
        `  - [${severityLabel[issue.severity]}] ${issue.code}: ${issue.message}`,
      );
    }
  } else {
    lines.push('[db-doctor] issues: none');
  }

  lines.push(
    `[db-doctor] summary critical=${report.counts.critical} ` +
      `warning=${report.counts.warning} info=${report.counts.info}`,
  );
  return lines.join('\n');
};

export const printDoctorReport = (report: DoctorReport) => {
  console.log(formatDoctorReport(report));
};
