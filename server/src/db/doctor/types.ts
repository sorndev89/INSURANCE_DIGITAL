export type DoctorMode = 'off' | 'report' | 'check' | 'repair';
export type DoctorFailOn = 'critical' | 'warning' | 'never';
export type DoctorSeverity = 'info' | 'warning' | 'critical';
export type DoctorCategory = 'database' | 'migration' | 'schema' | 'data' | 'storage' | 'lock';
export type DoctorStatus = 'healthy' | 'warning' | 'repaired' | 'failed' | 'skipped';

export type DoctorIssue = {
  code: string;
  category: DoctorCategory;
  severity: DoctorSeverity;
  message: string;
  details?: unknown;
  repair?: string;
};

export type DoctorRepair = {
  code: string;
  description: string;
  sql?: string;
  applied: boolean;
  error?: string;
};

export type MigrationState = {
  applied: number;
  expected: number;
  currentTag: string | null;
  latestTag: string | null;
  pending: string[];
};

export type DatabaseInfo = {
  name: string;
  version: string;
  charset: string;
  collation: string;
  timezone: string;
};

export type DoctorReport = {
  mode: DoctorMode;
  status: DoctorStatus;
  triggeredBy: 'deploy' | 'cli' | 'api';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  database: DatabaseInfo | null;
  migrations: MigrationState;
  issues: DoctorIssue[];
  repairs: DoctorRepair[];
  counts: {
    critical: number;
    warning: number;
    info: number;
  };
};

export type RunDoctorOptions = {
  mode: DoctorMode;
  failOn?: DoctorFailOn;
  dataChecks?: boolean | 'deep';
  audit?: boolean;
  triggeredBy?: 'deploy' | 'cli' | 'api';
  migrationsFolder?: string;
  appVersion?: string | null;
};

export const emptyMigrationState = (): MigrationState => ({
  applied: 0,
  expected: 0,
  currentTag: null,
  latestTag: null,
  pending: [],
});

export const countIssues = (issues: DoctorIssue[]) => ({
  critical: issues.filter((issue) => issue.severity === 'critical').length,
  warning: issues.filter((issue) => issue.severity === 'warning').length,
  info: issues.filter((issue) => issue.severity === 'info').length,
});

export const shouldFailDoctor = (
  report: DoctorReport,
  failOn: DoctorFailOn = 'critical',
) => {
  if (report.mode === 'off' || report.mode === 'report') return false;
  if (failOn === 'never') return false;
  if (report.counts.critical > 0) return true;
  if (failOn === 'warning' && report.counts.warning > 0) return true;
  return false;
};
