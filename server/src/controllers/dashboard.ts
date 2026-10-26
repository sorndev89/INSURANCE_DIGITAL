import type { Request, Response } from 'express';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  claims,
  customers,
  invoices,
  payments,
  policies,
  products,
  teams,
  users,
} from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { toNumber } from '../utils/list.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

const monthStart = (offset: number) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - offset);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getDashboard = async (req: Request, res: Response) => {
  const tid = tenantId(req);

  const [policyAgg] = await db
    .select({
      totalPremium: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      activePolicies: sql<number>`coalesce(sum(case when ${policies.status} = 'active' then 1 else 0 end), 0)`,
    })
    .from(policies)
    .where(eq(policies.tenantId, tid));

  const [revenueRow] = await db
    .select({ total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)` })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), gte(policies.startDate, monthStart(0))));

  const [previousRevenueRow] = await db
    .select({ total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)` })
    .from(policies)
    .where(
      and(
        eq(policies.tenantId, tid),
        gte(policies.startDate, monthStart(1)),
        lte(policies.startDate, monthStart(0)),
      ),
    );

  const [claimAgg] = await db
    .select({
      total: sql<number>`coalesce(sum(${claims.amount}), 0)`,
      pending: sql<number>`coalesce(sum(case when ${claims.status} in ('pending','reviewing') then 1 else 0 end), 0)`,
    })
    .from(claims)
    .where(eq(claims.tenantId, tid));

  const revenueThisMonth = toNumber(revenueRow?.total);
  const previousRevenue = toNumber(previousRevenueRow?.total);
  const revenueTrend =
    previousRevenue > 0
      ? Math.round(((revenueThisMonth - previousRevenue) / previousRevenue) * 1000) / 10
      : revenueThisMonth > 0
        ? 100
        : 0;
  const totalPremium = toNumber(policyAgg?.totalPremium);
  const claimsRatio =
    totalPremium > 0 ? Math.round((toNumber(claimAgg?.total) / totalPremium) * 100) : 0;

  const monthlyRows = await db
    .select({
      month: sql<string>`date_format(${policies.startDate}, '%Y-%m')`,
      total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), gte(policies.startDate, monthStart(11))))
    .groupBy(sql`date_format(${policies.startDate}, '%Y-%m')`);

  const monthlyMap = new Map(monthlyRows.map((row) => [row.month, toNumber(row.total)]));
  const monthlySales = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (11 - index));
    const key = date.toISOString().slice(0, 7);
    return {
      label: MONTH_LABELS[date.getMonth()],
      value: monthlyMap.get(key) ?? 0,
    };
  });

  const mixRows = await db
    .select({
      type: products.type,
      total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .leftJoin(products, eq(products.id, policies.productId))
    .where(eq(policies.tenantId, tid))
    .groupBy(products.type);

  const typeLabels: Record<string, string> = {
    Motor: 'ປະກັນໄພລົດຍົນ',
    Health: 'ປະກັນສຸຂະພາບ',
    Fire: 'ປະກັນອັກຄີໄພ',
    Accident: 'ປະກັນອຸບັດຕິເຫດ',
  };
  const mixTotal = mixRows.reduce((sum, row) => sum + toNumber(row.total), 0);
  const productMix = mixRows
    .filter((row) => row.type)
    .map((row) => ({
      key: row.type,
      label: (row.type && (typeLabels[row.type] || row.type)) || 'ອື່ນໆ',
      value: mixTotal > 0 ? Math.round((toNumber(row.total) / mixTotal) * 100) : 0,
      tone: row.type === 'Motor' ? 'primary' : row.type === 'Health' ? 'danger' : 'warning',
    }));

  const expiringRows = await db
    .select({
      id: policies.id,
      policyNumber: policies.policyNumber,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      productName: products.name,
      endDate: policies.endDate,
      phone: customers.phone,
    })
    .from(policies)
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .leftJoin(products, eq(products.id, policies.productId))
    .where(
      and(
        eq(policies.tenantId, tid),
        eq(policies.status, 'active'),
        gte(policies.endDate, addDays(0)),
        lte(policies.endDate, addDays(30)),
      ),
    )
    .orderBy(policies.endDate)
    .limit(4);

  const recentClaimRows = await db
    .select({
      id: claims.id,
      claimNumber: claims.claimNumber,
      claimant: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      type: claims.type,
      amount: claims.amount,
      status: claims.status,
      incidentDate: claims.incidentDate,
    })
    .from(claims)
    .leftJoin(customers, eq(customers.id, claims.customerId))
    .where(eq(claims.tenantId, tid))
    .orderBy(desc(claims.createdAt))
    .limit(4);

  const topAgentRows = await db
    .select({
      id: agents.id,
      name: users.username,
      teamName: teams.name,
      sales: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .leftJoin(policies, eq(policies.agentId, agents.id))
    .where(eq(agents.tenantId, tid))
    .groupBy(agents.id, users.username, teams.name)
    .orderBy(desc(sql`coalesce(sum(${policies.totalPremium}), 0)`))
    .limit(3);

  const transactionRows = await db
    .select({
      id: payments.receiptNumber,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      date: payments.paidAt,
      amount: payments.amount,
      status: payments.status,
      method: payments.method,
    })
    .from(payments)
    .leftJoin(invoices, eq(invoices.id, payments.invoiceId))
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .where(eq(payments.tenantId, tid))
    .orderBy(desc(payments.createdAt))
    .limit(5);

  res.json({
    data: {
      kpis: {
        revenueThisMonth,
        revenueTrend,
        activePolicies: toNumber(policyAgg?.activePolicies),
        activePoliciesTrend: 0,
        claimsRatio,
        pendingApprovals: toNumber(claimAgg?.pending),
      },
      monthlySales,
      productMix,
      expiringPolicies: expiringRows,
      recentClaims: recentClaimRows.map((row) => ({ ...row, amount: toNumber(row.amount) })),
      topAgents: topAgentRows.map((row) => ({
        ...row,
        name: row.name || '—',
        sales: toNumber(row.sales),
        avatar: '',
      })),
      recentTransactions: transactionRows.map((row) => ({
        ...row,
        type: 'Payment',
        amount: toNumber(row.amount),
      })),
    },
  });
};
