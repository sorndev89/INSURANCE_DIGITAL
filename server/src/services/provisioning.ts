import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import type { Transaction } from '../db/index.js';
import {
  plans,
  subscriptions,
  tenantDomains,
  tenants,
  users,
  type TenantSettings,
} from '../db/schema.js';
import { env } from '../config/env.js';
import { hashPassword } from '../utils/auth.js';
import { ApiError } from '../utils/errors.js';
import { invalidateTenantCache } from './tenantCache.js';
import { ensureSystemRoles } from './roles.js';
import {
  createVerificationToken,
  domainDnsInstructions,
  normalizeHostname,
} from './domains.js';

const RESERVED_SLUGS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'static',
  'assets',
  'cdn',
  'cname',
]);

export type ProvisionTenantInput = {
  name: string;
  slug: string;
  status?: 'active' | 'trial';
  planCode?: string | null;
  customDomain?: string | null;
  brand?: {
    name?: string;
    shortName?: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  settings?: TenantSettings;
  admin: {
    username?: string;
    email: string;
    password: string;
    phone?: string | null;
  };
};

const buildSettings = (input: ProvisionTenantInput): TenantSettings => ({
  brand: {
    name: input.brand?.name || input.name,
    ...input.brand,
  },
  locale: 'lo',
  currency: 'LAK',
  timezone: 'Asia/Vientiane',
  features: ['policies', 'quotations', 'claims', 'commissions', 'finance', 'reports'],
  ...input.settings,
  ...(input.settings?.brand ? { brand: { ...input.brand, ...input.settings.brand } } : {}),
});

const ensureAvailable = async (tx: Transaction, slug: string, hostnames: string[]) => {
  if (RESERVED_SLUGS.has(slug)) {
    throw ApiError.conflict(`Slug "${slug}" is reserved`);
  }

  const existingSlug = await tx
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  if (existingSlug.length) {
    throw ApiError.conflict(`Slug "${slug}" is already taken`);
  }

  for (const hostname of hostnames) {
    const existingHost = await tx
      .select({ id: tenantDomains.id })
      .from(tenantDomains)
      .where(eq(tenantDomains.hostname, hostname))
      .limit(1);
    if (existingHost.length) {
      throw ApiError.conflict(`Domain "${hostname}" is already registered`);
    }
  }
};

const usernameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 50) || 'admin';

export const provisionTenant = async (input: ProvisionTenantInput) => {
  const primaryHost = normalizeHostname(`${input.slug}.${env.rootDomain}`);
  const customHost = input.customDomain ? normalizeHostname(input.customDomain) : null;

  if (customHost && (customHost === env.adminHost || customHost === env.rootDomain)) {
    throw ApiError.badRequest('Custom domain cannot be the platform domain');
  }
  if (customHost && customHost === primaryHost) {
    throw ApiError.badRequest('Custom domain cannot be the same as the primary domain');
  }

  const passwordHash = await hashPassword(input.admin.password);
  const verificationToken = customHost ? createVerificationToken() : null;

  try {
    const result = await db.transaction(async (tx) => {
      await ensureAvailable(tx, input.slug, [primaryHost, ...(customHost ? [customHost] : [])]);

      const plan = input.planCode
        ? (
            await tx
              .select()
              .from(plans)
              .where(and(eq(plans.code, input.planCode), eq(plans.active, true)))
              .limit(1)
          )[0]
        : null;

      if (input.planCode && !plan) {
        throw ApiError.badRequest(`Unknown plan "${input.planCode}"`);
      }

      const [tenantResult] = await tx.insert(tenants).values({
        slug: input.slug,
        name: input.name,
        status: input.status ?? 'active',
        planId: plan?.id ?? null,
        settings: buildSettings(input),
      });
      const tenantId = tenantResult.insertId;

      await ensureSystemRoles(tenantId, tx, input.settings?.rolePermissions ?? null);

      await tx.insert(tenantDomains).values({
        tenantId,
        hostname: primaryHost,
        type: 'primary',
        isPrimary: true,
        verifiedAt: new Date(),
        sslStatus: 'active',
      });

      if (customHost && verificationToken) {
        await tx.insert(tenantDomains).values({
          tenantId,
          hostname: customHost,
          type: 'custom',
          isPrimary: false,
          verificationToken,
          sslStatus: 'pending',
        });
      }

      if (plan) {
        await tx.insert(subscriptions).values({
          tenantId,
          planId: plan.id,
          status: input.status === 'trial' ? 'trialing' : 'active',
        });
      }

      const [adminResult] = await tx.insert(users).values({
        tenantId,
        username: input.admin.username || usernameFromEmail(input.admin.email),
        email: input.admin.email,
        password: passwordHash,
        role: 'admin',
        phone: input.admin.phone ?? null,
        status: 'active',
      });

      return { tenantId, adminUserId: adminResult.insertId, plan };
    });

    await invalidateTenantCache();

    return {
      tenantId: result.tenantId,
      slug: input.slug,
      name: input.name,
      status: input.status ?? 'active',
      plan: result.plan ? { id: result.plan.id, code: result.plan.code, name: result.plan.name } : null,
      adminUserId: result.adminUserId,
      domains: {
        primary: {
          hostname: primaryHost,
          type: 'primary' as const,
          verified: true,
          sslStatus: 'active',
        },
        custom: customHost
          ? {
              hostname: customHost,
              type: 'custom' as const,
              verified: false,
              token: verificationToken,
              dns: domainDnsInstructions(customHost, verificationToken!),
            }
          : null,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw ApiError.conflict('Tenant slug or domain already exists');
    }
    throw error;
  }
};

export const findProvisionedTenant = async (tenantId: number) => {
  const rows = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), isNull(tenants.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
};
