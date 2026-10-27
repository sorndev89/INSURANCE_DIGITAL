import type { Request, Response } from 'express';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  plans,
  platformAuditLogs,
  policies,
  tenantDomains,
  tenants,
} from '../db/schema.js';
import { toNumber } from '../utils/list.js';

export const getPlatformDashboard = async (_req: Request, res: Response) => {
  // 1. Tenant status aggregation
  const [tenantAgg] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`coalesce(sum(case when ${tenants.status} = 'active' then 1 else 0 end), 0)`,
      trial: sql<number>`coalesce(sum(case when ${tenants.status} = 'trial' then 1 else 0 end), 0)`,
      suspended: sql<number>`coalesce(sum(case when ${tenants.status} = 'suspended' then 1 else 0 end), 0)`,
    })
    .from(tenants)
    .where(isNull(tenants.deletedAt));

  const totalTenants = toNumber(tenantAgg?.total);
  const activeTenants = toNumber(tenantAgg?.active);
  const trialTenants = toNumber(tenantAgg?.trial);
  const suspendedTenants = toNumber(tenantAgg?.suspended);
  const otherTenants = Math.max(0, totalTenants - activeTenants - trialTenants - suspendedTenants);

  // 2. Unverified domains count
  const [domainAgg] = await db
    .select({
      unverified: sql<number>`coalesce(sum(case when ${tenantDomains.verifiedAt} is null then 1 else 0 end), 0)`,
      total: sql<number>`count(*)`,
    })
    .from(tenantDomains);

  // 3. Platform Plans with tenant counts
  const planRows = await db
    .select({
      id: plans.id,
      code: plans.code,
      name: plans.name,
      price: plans.price,
      currency: plans.currency,
      tenantCount: sql<number>`count(${tenants.id})`,
    })
    .from(plans)
    .leftJoin(tenants, and(eq(tenants.planId, plans.id), isNull(tenants.deletedAt)))
    .groupBy(plans.id, plans.code, plans.name, plans.price, plans.currency)
    .orderBy(desc(sql`count(${tenants.id})`));

  // 4. Latest 5 Tenants with primary domain & plan name
  const recentTenantRows = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      createdAt: tenants.createdAt,
      planName: plans.name,
    })
    .from(tenants)
    .leftJoin(plans, eq(plans.id, tenants.planId))
    .where(isNull(tenants.deletedAt))
    .orderBy(desc(tenants.createdAt))
    .limit(5);

  // 5. Latest 5 Audit Logs
  const recentAuditRows = await db
    .select({
      id: platformAuditLogs.id,
      action: platformAuditLogs.action,
      target: platformAuditLogs.target,
      meta: platformAuditLogs.meta,
      createdAt: platformAuditLogs.createdAt,
    })
    .from(platformAuditLogs)
    .orderBy(desc(platformAuditLogs.createdAt))
    .limit(5);

  // 6. Total Gross Policies & Revenue volume across all tenants
  const [platformRevenue] = await db
    .select({
      totalPremium: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      totalPolicies: sql<number>`count(*)`,
    })
    .from(policies);

  const mem = process.memoryUsage();

  res.json({
    data: {
      stats: {
        total: totalTenants,
        active: activeTenants,
        trial: trialTenants,
        suspended: suspendedTenants,
        other: otherTenants,
        totalVolume: toNumber(platformRevenue?.totalPremium),
        totalPolicies: toNumber(platformRevenue?.totalPolicies),
      },
      triage: {
        trialCount: trialTenants,
        activeCount: activeTenants,
        unverifiedDomains: toNumber(domainAgg?.unverified),
        totalDomains: toNumber(domainAgg?.total),
      },
      statusDistribution: [
        { label: 'Active', value: activeTenants },
        { label: 'Trial', value: trialTenants },
        { label: 'Suspended', value: suspendedTenants },
        { label: 'Other', value: otherTenants },
      ],
      plans: planRows.map((p) => ({
        ...p,
        tenantCount: toNumber(p.tenantCount),
      })),
      recentTenants: recentTenantRows,
      recentAudits: recentAuditRows,
      systemHealth: {
        database: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: Math.round(mem.rss / 1024 / 1024),
        nodeVersion: process.version,
      },
    },
  });
};
