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

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

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
  tlsAskToken: process.env.TLS_ASK_TOKEN || '',
  runMigrationsOnStart: process.env.RUN_MIGRATIONS_ON_START === 'true',
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
  defaultTenantSlug: process.env.DEFAULT_TENANT_SLUG || 'saiyfon',
  defaultTenantName: process.env.DEFAULT_TENANT_NAME || 'ສາຍຝົນ ປະກັນໄພ',
  defaultTenantAdminEmail: process.env.DEFAULT_TENANT_ADMIN_EMAIL || 'admin@saiyfon.com',
  defaultTenantAdminPassword:
    process.env.DEFAULT_TENANT_ADMIN_PASSWORD || (isProduction ? '' : 'Demo@1234'),
};
