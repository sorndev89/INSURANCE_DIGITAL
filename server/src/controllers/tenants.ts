import type { Request, Response } from 'express';
import { and, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  customers,
  plans,
  policies,
  tenantDomains,
  tenants,
  users,
  type TenantSettings,
} from '../db/schema.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import {
  asObject,
  optionalString,
  parsePagination,
  requireEmail,
  requireHostname,
  requirePassword,
  requireSlug,
  requireString,
} from '../utils/validate.js';
import { generateTenantToken } from '../utils/auth.js';
import {
  domainDnsInstructions,
  normalizeHostname,
  createVerificationToken,
  verifyDomainOwnership,
} from '../services/domains.js';
import { provisionTenant } from '../services/provisioning.js';
import { invalidateTenantCache } from '../services/tenantCache.js';
import { writeAuditLog } from '../services/audit.js';
import { findUserById } from '../repositories/users.js';

const actor = (req: Request) => ({
  actorId: req.platformAuth?.platformUserId ?? null,
  ip: req.ip,
});

const getTenantOrThrow = async (id: number) => {
  const rows = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, id), isNull(tenants.deletedAt)))
    .limit(1);
  if (!rows[0]) throw ApiError.notFound('Tenant not found');
  return rows[0];
};

const requireTenantId = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid tenant id');
  return id;
};

const listDomains = (tenantId: number) =>
  db
    .select({
      id: tenantDomains.id,
      hostname: tenantDomains.hostname,
      type: tenantDomains.type,
      isPrimary: tenantDomains.isPrimary,
      verifiedAt: tenantDomains.verifiedAt,
      sslStatus: tenantDomains.sslStatus,
      verificationToken: tenantDomains.verificationToken,
      createdAt: tenantDomains.createdAt,
    })
    .from(tenantDomains)
    .where(eq(tenantDomains.tenantId, tenantId))
    .orderBy(desc(tenantDomains.isPrimary), desc(tenantDomains.createdAt));

const maskDomain = (domain: Awaited<ReturnType<typeof listDomains>>[number]) => ({
  ...domain,
  dns:
    domain.type === 'custom' && domain.verificationToken && !domain.verifiedAt
      ? domainDnsInstructions(domain.hostname, domain.verificationToken)
      : null,
});

export const list = async (req: Request, res: Response) => {
  const { page, pageSize, offset } = parsePagination(req.query as Record<string, unknown>);
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where = search
    ? and(
        isNull(tenants.deletedAt),
        or(like(tenants.name, `%${search}%`), like(tenants.slug, `%${search}%`)),
      )
    : isNull(tenants.deletedAt);

  const items = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      name: tenants.name,
      status: tenants.status,
      planId: tenants.planId,
      planCode: plans.code,
      planName: plans.name,
      primaryHostname: tenantDomains.hostname,
      settings: tenants.settings,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .leftJoin(plans, eq(plans.id, tenants.planId))
    .leftJoin(
      tenantDomains,
      and(eq(tenantDomains.tenantId, tenants.id), eq(tenantDomains.isPrimary, true)),
    )
    .where(where)
    .orderBy(desc(tenants.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(tenants)
    .where(where);

  res.json({
    data: items,
    meta: { total: Number(totalRow?.total ?? 0), page, pageSize },
  });
};

export const create = async (req: Request, res: Response) => {
  const body = asObject(req.body);
  const name = requireString(body.name, 'name', { min: 2, max: 255 });
  const slug = requireSlug(body.slug);
  const planCode = optionalString(body.planCode, 'planCode', { max: 50 });
  const customDomain = optionalString(body.customDomain, 'customDomain', { max: 255 });
  const status = body.status === 'trial' ? 'trial' : 'active';
  const admin = asObject(body.admin);

  const adminEmail = requireEmail(admin.email, 'admin.email');
  const adminPassword = requirePassword(admin.password, 'admin.password');
  const adminUsername = optionalString(admin.username, 'admin.username', { max: 255 });
  const brand = body.brand && typeof body.brand === 'object' ? asObject(body.brand) : undefined;

  const result = await provisionTenant({
    name,
    slug,
    status,
    planCode,
    customDomain: customDomain ? requireHostname(customDomain, 'customDomain') : null,
    brand: brand
      ? {
          name: typeof brand.name === 'string' ? brand.name : undefined,
          shortName: typeof brand.shortName === 'string' ? brand.shortName : undefined,
          logoUrl: typeof brand.logoUrl === 'string' ? brand.logoUrl : undefined,
          primaryColor:
            typeof brand.primaryColor === 'string' ? brand.primaryColor : undefined,
          accentColor: typeof brand.accentColor === 'string' ? brand.accentColor : undefined,
        }
      : undefined,
    settings: body.settings && typeof body.settings === 'object' ? (body.settings as TenantSettings) : undefined,
    admin: {
      email: adminEmail,
      password: adminPassword,
      username: adminUsername ?? undefined,
      phone: optionalString(admin.phone, 'admin.phone', { max: 20 }),
    },
  });

  await writeAuditLog({
    ...actor(req),
    tenantId: result.tenantId,
    action: 'tenant.create',
    target: `${result.slug}`,
    meta: { planCode, customDomain: result.domains.custom?.hostname ?? null },
  });

  res.status(201).json({ data: result });
};

export const get = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  const domains = await listDomains(id);
  res.json({ data: { ...tenant, domains: domains.map(maskDomain) } });
};

export const update = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  const body = asObject(req.body);

  const patch: {
    name?: string;
    status?: 'active' | 'trial' | 'suspended';
    planId?: number | null;
    settings?: TenantSettings;
  } = {};

  if (body.name !== undefined) {
    patch.name = requireString(body.name, 'name', { min: 2, max: 255 });
  }
  if (body.status !== undefined) {
    if (!['active', 'trial', 'suspended'].includes(String(body.status))) {
      throw ApiError.badRequest('status must be active, trial or suspended');
    }
    patch.status = body.status as 'active' | 'trial' | 'suspended';
  }
  if (body.planId !== undefined) {
    if (body.planId === null) {
      patch.planId = null;
    } else {
      const planId = Number(body.planId);
      if (!Number.isInteger(planId)) throw ApiError.badRequest('planId must be a number');
      const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
      if (!plan) throw ApiError.badRequest('Unknown plan');
      patch.planId = planId;
    }
  }
  if (body.settings !== undefined) {
    if (!body.settings || typeof body.settings !== 'object' || Array.isArray(body.settings)) {
      throw ApiError.badRequest('settings must be an object');
    }
    const current = tenant.settings ?? {};
    const incoming = body.settings as TenantSettings;
    patch.settings = {
      ...current,
      ...incoming,
      brand: { ...(current.brand ?? {}), ...(incoming.brand ?? {}) },
    };
  }

  if (Object.keys(patch).length === 0) {
    throw ApiError.badRequest('No supported fields to update');
  }

  await db.update(tenants).set(patch).where(eq(tenants.id, id));
  await invalidateTenantCache();

  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'tenant.update',
    target: tenant.slug,
    meta: patch as Record<string, unknown>,
  });

  res.json({ data: { ...tenant, ...patch } });
};

export const setStatus = (status: 'active' | 'suspended') => async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  await db.update(tenants).set({ status }).where(eq(tenants.id, id));
  await invalidateTenantCache();
  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: status === 'suspended' ? 'tenant.suspend' : 'tenant.activate',
    target: tenant.slug,
  });
  res.json({ data: { id, status } });
};

export const remove = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  const suffix = `-deleted-${Date.now()}`;
  const nextSlug = `${tenant.slug.slice(0, Math.max(1, 63 - suffix.length))}${suffix}`;
  const domains = await db
    .select({ id: tenantDomains.id, hostname: tenantDomains.hostname })
    .from(tenantDomains)
    .where(eq(tenantDomains.tenantId, id));

  await db.transaction(async (tx) => {
    for (const domain of domains) {
      await tx
        .update(tenantDomains)
        .set({
          hostname: `${id}-deleted-${domain.hostname}`.slice(0, 255),
          verifiedAt: null,
          isPrimary: false,
          sslStatus: 'inactive',
        })
        .where(eq(tenantDomains.id, domain.id));
    }
    await tx
      .update(tenants)
      .set({ slug: nextSlug, deletedAt: new Date(), status: 'suspended' })
      .where(eq(tenants.id, id));
  });

  await invalidateTenantCache();
  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'tenant.delete',
    target: tenant.slug,
  });
  res.json({ data: { id, deleted: true } });
};

export const addDomain = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  const body = asObject(req.body);
  const hostname = normalizeHostname(requireHostname(body.hostname));

  if (hostname === env.rootDomain || hostname === env.adminHost) {
    throw ApiError.badRequest('This domain is reserved for the platform');
  }
  if (hostname.endsWith(`.${env.rootDomain}`)) {
    throw ApiError.badRequest('Subdomains of the platform domain are provisioned automatically');
  }

  const [existing] = await db
    .select({ id: tenantDomains.id })
    .from(tenantDomains)
    .where(eq(tenantDomains.hostname, hostname))
    .limit(1);
  if (existing) throw ApiError.conflict('Domain is already registered');

  const token = createVerificationToken();
  const [result] = await db.insert(tenantDomains).values({
    tenantId: id,
    hostname,
    type: 'custom',
    isPrimary: false,
    verificationToken: token,
    sslStatus: 'pending',
  });

  await invalidateTenantCache();
  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'domain.add',
    target: hostname,
    meta: { domainId: result.insertId },
  });

  res.status(201).json({
    data: {
      id: result.insertId,
      tenantId: id,
      hostname,
      type: 'custom',
      isPrimary: false,
      verifiedAt: null,
      sslStatus: 'pending',
      dns: domainDnsInstructions(hostname, token),
    },
    tenant: { id: tenant.id, slug: tenant.slug },
  });
};

export const verifyDomain = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  await getTenantOrThrow(id);
  const domainId = Number(req.params.domainId);
  if (!Number.isInteger(domainId)) throw ApiError.badRequest('Invalid domain id');

  const [domain] = await db
    .select()
    .from(tenantDomains)
    .where(and(eq(tenantDomains.id, domainId), eq(tenantDomains.tenantId, id)))
    .limit(1);
  if (!domain) throw ApiError.notFound('Domain not found');

  if (domain.verifiedAt) {
    res.json({ data: { ...domain, alreadyVerified: true } });
    return;
  }
  if (!domain.verificationToken) {
    throw ApiError.badRequest('Domain has no verification token');
  }

  // Force verification is limited to the authenticated platform superadmin route
  // and is always recorded in the audit log (`forced: true`).
  const force = String(req.query.force ?? '').toLowerCase() === 'true' && Boolean(req.platformAuth);
  const verified = await verifyDomainOwnership(domain.hostname, domain.verificationToken, {
    force,
  });

  if (!verified) {
    res.status(400).json({
      error: {
        code: 'domain_verification_failed',
        message:
          'DNS verification failed. Add the TXT record below, wait for propagation and try again.',
        details: domainDnsInstructions(domain.hostname, domain.verificationToken),
      },
    });
    return;
  }

  const verifiedAt = new Date();
  await db
    .update(tenantDomains)
    .set({ verifiedAt, sslStatus: 'pending' })
    .where(eq(tenantDomains.id, domain.id));
  await invalidateTenantCache();

  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'domain.verify',
    target: domain.hostname,
    meta: { forced: force },
  });

  res.json({
    data: {
      ...domain,
      verifiedAt,
      sslStatus: 'pending',
      dns: domainDnsInstructions(domain.hostname, domain.verificationToken),
    },
  });
};

export const removeDomain = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  await getTenantOrThrow(id);
  const domainId = Number(req.params.domainId);
  if (!Number.isInteger(domainId)) throw ApiError.badRequest('Invalid domain id');

  const [domain] = await db
    .select()
    .from(tenantDomains)
    .where(and(eq(tenantDomains.id, domainId), eq(tenantDomains.tenantId, id)))
    .limit(1);
  if (!domain) throw ApiError.notFound('Domain not found');
  if (domain.isPrimary) throw ApiError.badRequest('The primary domain cannot be removed');

  await db.delete(tenantDomains).where(eq(tenantDomains.id, domainId));
  await invalidateTenantCache();
  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'domain.remove',
    target: domain.hostname,
  });

  res.json({ data: { id: domainId, deleted: true } });
};

export const impersonate = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  const tenant = await getTenantOrThrow(id);
  const body = asObject(req.body);
  const requestedUserId = body.userId === undefined ? null : Number(body.userId);

  let user;
  if (requestedUserId !== null) {
    if (!Number.isInteger(requestedUserId)) throw ApiError.badRequest('Invalid userId');
    user = await findUserById(id, requestedUserId);
  } else {
    const [admin] = await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, id), eq(users.role, 'admin')))
      .limit(1);
    user = admin;
  }

  if (!user) throw ApiError.notFound('No user available to impersonate in this tenant');

  const token = generateTenantToken(user);
  await writeAuditLog({
    ...actor(req),
    tenantId: id,
    action: 'tenant.impersonate',
    target: user.email,
    meta: { userId: user.id },
  });

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    },
  });
};

export const usage = async (req: Request, res: Response) => {
  const id = requireTenantId(req);
  await getTenantOrThrow(id);

  const [userCount] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.tenantId, id));
  const [customerCount] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, id));
  const [policyCount] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(eq(policies.tenantId, id));

  res.json({
    data: {
      tenantId: id,
      users: Number(userCount?.total ?? 0),
      customers: Number(customerCount?.total ?? 0),
      policies: Number(policyCount?.total ?? 0),
    },
  });
};
