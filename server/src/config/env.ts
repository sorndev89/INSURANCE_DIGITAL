import dotenv from 'dotenv';

dotenv.config();

const read = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const readNumber = (key: string, fallback: number) => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

const readEnum = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const raw = (process.env[key] || '').trim().toLowerCase();
  if (!raw) return fallback;
  if (!allowed.includes(raw as T)) {
    throw new Error(`Environment variable ${key} must be one of: ${allowed.join(', ')}`);
  }
  return raw as T;
};

const readBoolean = (key: string, fallback: boolean) => {
  const raw = (process.env[key] || '').trim().toLowerCase();
  if (!raw) return fallback;
  if (['true', '1', 'yes', 'on'].includes(raw)) return true;
  if (['false', '0', 'no', 'off'].includes(raw)) return false;
  throw new Error(`Environment variable ${key} must be true or false`);
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const runMigrationsOnStart = readBoolean('RUN_MIGRATIONS_ON_START', false);
const dbDoctorModeFallback = runMigrationsOnStart ? 'repair' : isProduction ? 'repair' : 'off';

export const env = {
  nodeEnv,
  isProduction,
  port: readNumber('PORT', 5055),
  databaseUrl: read('DATABASE_URL'),
  jwtSecret: read('JWT_SECRET', isProduction ? undefined : 'dev-jwt-secret'),
  platformJwtSecret: read(
    'PLATFORM_JWT_SECRET',
    isProduction ? undefined : 'dev-platform-jwt-secret',
  ),
  jwtIssuer: process.env.JWT_ISSUER || 'saiyfon',
  rootDomain: process.env.ROOT_DOMAIN || 'saiyfon.app',
  adminHost: process.env.ADMIN_HOST || 'admin.saiyfon.app',
  cnameTarget: process.env.CNAME_TARGET || 'cname.saiyfon.app',
  tenantCacheTtlMs: readNumber('TENANT_CACHE_TTL_MS', 60_000),
  redisUrl: process.env.REDIS_URL || '',
  redisKeyPrefix: process.env.REDIS_KEY_PREFIX || 'saiyfon:',
  corsExtraOrigins: (process.env.CORS_EXTRA_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  corsAllowRootSubdomains: readBoolean('CORS_ALLOW_ROOT_SUBDOMAINS', false),
  tlsAskToken: process.env.TLS_ASK_TOKEN || '',
  runMigrationsOnStart,
  dbDoctorMode: readEnum(
    'DB_DOCTOR_MODE',
    ['off', 'report', 'check', 'repair'] as const,
    dbDoctorModeFallback,
  ),
  dbDoctorFailOn: readEnum(
    'DB_DOCTOR_FAIL_ON',
    ['critical', 'warning', 'never'] as const,
    'critical',
  ),
  dbDoctorDataChecks: (() => {
    const raw = (process.env.DB_DOCTOR_DATA_CHECKS || '').trim().toLowerCase();
    if (raw === 'deep') return 'deep' as const;
    if (['false', '0', 'no', 'off'].includes(raw)) return false;
    if (['true', '1', 'yes', 'on'].includes(raw)) return true;
    return true;
  })(),
  dbDoctorLockTimeoutMs: readNumber('DB_DOCTOR_LOCK_TIMEOUT_MS', 45_000),
  dbDoctorDataBudgetMs: readNumber('DB_DOCTOR_DATA_BUDGET_MS', 15_000),
  dbDoctorAudit: readBoolean('DB_DOCTOR_AUDIT', true),
  appVersion:
    process.env.APP_VERSION || process.env.COOLIFY_COMMIT_SHA || process.env.GIT_COMMIT || null,
  trustProxy: (() => {
    const raw = process.env.TRUST_PROXY || '1';
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : raw;
  })(),
  platformAdminEmail: process.env.PLATFORM_ADMIN_EMAIL || 'platform@saiyfon.com',
  platformAdminUsername: process.env.PLATFORM_ADMIN_USERNAME || 'platform',
  platformAdminPassword: process.env.PLATFORM_ADMIN_PASSWORD || '',
  platformAdminAutoSeed: readBoolean('PLATFORM_ADMIN_AUTO_SEED', true),
  defaultTenantSlug: process.env.DEFAULT_TENANT_SLUG || 'saiyfon',
  defaultTenantName: process.env.DEFAULT_TENANT_NAME || 'ສາຍຝົນ ປະກັນໄພ',
  defaultTenantAdminEmail: process.env.DEFAULT_TENANT_ADMIN_EMAIL || 'admin@saiyfon.com',
  defaultTenantAdminPassword:
    process.env.DEFAULT_TENANT_ADMIN_PASSWORD || (isProduction ? '' : 'Demo@1234'),
};
