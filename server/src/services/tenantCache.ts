import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import { plans, tenantDomains, tenants } from '../db/schema.js';
import { env } from '../config/env.js';
import { cacheDeleteByPrefix, cacheGet, cacheSet } from './cache.js';
import type { TenantContext, TenantStatus } from '../types/context.js';

const TENANT_PREFIX = 'tenant:';
const DOMAINS_KEY = 'tenant:domains:all';

const normalizeHost = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');

const toTenantContext = (row: {
  id: number;
  slug: string;
  name: string;
  status: TenantStatus;
  planId: number | null;
  settings: TenantContext['settings'];
  features: string[] | null;
  limits: TenantContext['limits'];
  hostname: string;
}): TenantContext => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  status: row.status,
  planId: row.planId,
  settings: row.settings,
  features: row.features ?? [],
  limits: row.limits,
  hostname: row.hostname,
});

const findTenant = async (column: 'hostname' | 'slug', value: string) => {
  const match =
    column === 'hostname'
      ? eq(tenantDomains.hostname, value)
      : and(eq(tenants.slug, value), eq(tenantDomains.isPrimary, true));

  const rows = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      name: tenants.name,
      status: tenants.status,
      planId: tenants.planId,
      settings: tenants.settings,
      features: plans.features,
      limits: plans.limits,
      hostname: tenantDomains.hostname,
    })
    .from(tenants)
    .innerJoin(tenantDomains, eq(tenantDomains.tenantId, tenants.id))
    .leftJoin(plans, eq(plans.id, tenants.planId))
    .where(
      and(
        match,
        isNull(tenants.deletedAt),
        isNotNull(tenantDomains.verifiedAt),
      ),
    )
    .limit(1);

  return rows[0] ? toTenantContext(rows[0]) : null;
};

const getCached = async (key: string) => {
  const raw = await cacheGet(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as TenantContext | null;
  } catch {
    return undefined;
  }
};

const setCached = (key: string, value: TenantContext | null) =>
  cacheSet(key, JSON.stringify(value), env.tenantCacheTtlMs);

export const resolveTenantByHost = async (host: string) => {
  const hostname = normalizeHost(host);
  if (!hostname) return null;
  const key = `${TENANT_PREFIX}host:${hostname}`;
  const cached = await getCached(key);
  if (cached !== undefined) return cached;
  const tenant = await findTenant('hostname', hostname);
  await setCached(key, tenant);
  return tenant;
};

export const resolveTenantBySlug = async (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const key = `${TENANT_PREFIX}slug:${normalized}`;
  const cached = await getCached(key);
  if (cached !== undefined) return cached;
  const tenant = await findTenant('slug', normalized);
  await setCached(key, tenant);
  return tenant;
};

export const invalidateTenantCache = () => cacheDeleteByPrefix(TENANT_PREFIX);

export const getVerifiedHostnames = async (): Promise<Set<string>> => {
  const cached = await cacheGet(DOMAINS_KEY);
  if (cached !== null) {
    try {
      return new Set(JSON.parse(cached) as string[]);
    } catch {
      // fall through to refresh
    }
  }

  const rows = await db
    .select({ hostname: tenantDomains.hostname })
    .from(tenantDomains)
    .innerJoin(tenants, eq(tenants.id, tenantDomains.tenantId))
    .where(and(isNotNull(tenantDomains.verifiedAt), isNull(tenants.deletedAt)));

  const hostnames = rows.map((row) => row.hostname);
  await cacheSet(DOMAINS_KEY, JSON.stringify(hostnames), env.tenantCacheTtlMs);
  return new Set(hostnames);
};
