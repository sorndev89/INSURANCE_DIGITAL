import type { Request, Response } from 'express';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  claims,
  commissions,
  customers,
  insuranceCompanies,
  invoices,
  payments,
  policies,
  products,
  quotations,
  teams,
  users,
} from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { toNumber } from '../utils/list.js';
import { buildCsv, buildPdf, buildXlsx, type ReportFormat } from '../services/reportExport.js';
import {
  addDays,
  monthKeys,
  monthLabel,
  previousRange,
  resolveReportRange,
  todayInTimezone,
  trailingMonths,
  type ReportRange,
} from '../utils/reportRange.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

const REPORT_TYPES = [
  'summary',
  'sales',
  'policies',
  'quotations',
  'claims',
  'customers',
  'agents',
  'teams',
  'commissions',
  'finance',
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

const REPORT_TITLES: Record<ReportType, string> = {
  summary: 'ສະຫຼຸບຜົນປະກອບການ',
  sales: 'ລາຍງານຍອດຂາຍ',
  policies: 'ລາຍງານປະກັນໄພ',
  quotations: 'ລາຍງານສະເໜີລາຄາ',
  claims: 'ລາຍງານເຄມ',
  customers: 'ລາຍງານລູກຄ້າ',
  agents: 'ລາຍງານຕົວແທນ',
  teams: 'ລາຍງານທີມ',
  commissions: 'ລາຍງານຄອມມິດຊັ່ນ',
  finance: 'ລາຍງານການເງິນ',
};

const PRODUCT_LABELS: Record<string, string> = {
  Motor: 'ປະກັນໄພລົດຍົນ',
  Health: 'ປະກັນສຸຂະພາບ',
  Fire: 'ປະກັນອັກຄີໄພ',
  Accident: 'ປະກັນອຸບັດຕິເຫດ',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'ລໍຖ້າ',
  reviewing: 'ກຳລັງກວດສອບ',
  active: 'ມີຜົນ',
  expired: 'ໝົດອາຍຸ',
  cancelled: 'ຍົກເລີກ',
  draft: 'ຮ່າງ',
  sent: 'ສົ່ງແລ້ວ',
  accepted: 'ຍອມຮັບ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  unpaid: 'ຍັງບໍ່ຈ່າຍ',
  overdue: 'ເກີນກຳນົດ',
  paid: 'ຈ່າຍແລ້ວ',
  completed: 'ສຳເລັດ',
  failed: 'ລົ້ມເຫຼວ',
};

const labelOf = (value: string | null | undefined) =>
  value ? STATUS_LABELS[value] || value : 'ອື່ນໆ';

const productLabel = (value: string | null | undefined) =>
  value ? PRODUCT_LABELS[value] || value : 'ອື່ນໆ';

const productTone = (value: string | null | undefined) => {
  if (value === 'Motor') return 'primary';
  if (value === 'Health') return 'danger';
  if (value === 'Fire') return 'warning';
  return 'neutral';
};

const trendOf = (current: number, previous: number) => {
  if (previous > 0) return Math.round(((current - previous) / previous) * 1000) / 10;
  return current > 0 ? 100 : 0;
};

const percentOf = (value: number, total: number, digits = 1) => {
  if (total <= 0) return 0;
  const factor = 10 ** digits;
  return Math.round((value / total) * 100 * factor) / factor;
};

const policyRange = (range: ReportRange) =>
  and(gte(policies.startDate, range.from), lte(policies.startDate, range.to))!;

const fillSeries = (rows: Array<{ month: string; value: number }>, range: ReportRange) => {
  const values = new Map(rows.map((row) => [row.month, toNumber(row.value)]));
  return monthKeys(range).map((month) => ({
    month,
    label: monthLabel(month),
    value: values.get(month) ?? 0,
  }));
};

const buildSummary = async (tid: number, range: ReportRange) => {
  const previous = previousRange(range);
  const chartRange = trailingMonths(range.to, 12);
  const today = todayInTimezone();
  const expiringTo = addDays(today, 30);

  const [current] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      policyCount: sql<number>`count(*)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)));

  const [prior] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(previous)));

  const [activeNow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), eq(policies.status, 'active')));

  const activeAt = async (date: string) => {
    const [row] = await db
      .select({ total: sql<number>`count(*)` })
      .from(policies)
      .where(
        and(
          eq(policies.tenantId, tid),
          lte(policies.startDate, date),
          gte(policies.endDate, date),
          sql`${policies.status} <> 'cancelled'`,
        ),
      );
    return toNumber(row?.total);
  };

  const [activeTo, activePrev] = await Promise.all([activeAt(range.to), activeAt(previous.to)]);

  const [claimAgg] = await db
    .select({
      amount: sql<number>`coalesce(sum(${claims.amount}), 0)`,
      pending: sql<number>`coalesce(sum(case when ${claims.status} in ('pending','reviewing') then 1 else 0 end), 0)`,
      total: sql<number>`count(*)`,
    })
    .from(claims)
    .where(
      and(
        eq(claims.tenantId, tid),
        gte(claims.incidentDate, range.from),
        lte(claims.incidentDate, range.to),
      ),
    );

  const [paymentAgg] = await db
    .select({ collected: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, tid),
        eq(payments.status, 'completed'),
        gte(payments.paidAt, range.from),
        lte(payments.paidAt, range.to),
      ),
    );

  const [invoiceAgg] = await db
    .select({ outstanding: sql<number>`coalesce(sum(${invoices.amount}), 0)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tid),
        sql`${invoices.status} in ('unpaid','overdue')`,
        lte(invoices.issuedDate, range.to),
      ),
    );

  const [customerAgg] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tid),
        gte(sql`date(${customers.createdAt})`, range.from),
        lte(sql`date(${customers.createdAt})`, range.to),
      ),
    );

  const [expiringAgg] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(
      and(
        eq(policies.tenantId, tid),
        eq(policies.status, 'active'),
        gte(policies.endDate, today),
        lte(policies.endDate, expiringTo),
      ),
    );

  const monthlyRows = await db
    .select({
      month: sql<string>`date_format(${policies.startDate}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(
      and(
        eq(policies.tenantId, tid),
        gte(policies.startDate, chartRange.from),
        lte(policies.startDate, chartRange.to),
      ),
    )
    .groupBy(sql`date_format(${policies.startDate}, '%Y-%m')`);

  const mixRows = await db
    .select({
      type: products.type,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(policies)
    .leftJoin(products, eq(products.id, policies.productId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(products.type);

  const mixTotal = mixRows.reduce((sum, row) => sum + toNumber(row.value), 0);

  const revenue = toNumber(current?.revenue);
  const priorRevenue = toNumber(prior?.revenue);

  return {
    range,
    previous,
    kpis: {
      revenue,
      revenueTrend: trendOf(revenue, priorRevenue),
      collected: toNumber(paymentAgg?.collected),
      outstanding: toNumber(invoiceAgg?.outstanding),
      activePolicies: toNumber(activeNow?.total),
      activePoliciesTrend: trendOf(activeTo, activePrev),
      claimsRatio: percentOf(toNumber(claimAgg?.amount), revenue, 0),
      pendingApprovals: toNumber(claimAgg?.pending),
      policyCount: toNumber(current?.policyCount),
      claimCount: toNumber(claimAgg?.total),
      newCustomers: toNumber(customerAgg?.total),
      expiring30: toNumber(expiringAgg?.total),
    },
    monthlySales: fillSeries(monthlyRows, chartRange),
    productMix: mixRows.map((row) => ({
      key: row.type || 'Other',
      label: productLabel(row.type),
      value: percentOf(toNumber(row.value), mixTotal, 0),
      amount: toNumber(row.value),
      count: toNumber(row.count),
      tone: productTone(row.type),
    })),
  };
};

const buildSales = async (tid: number, range: ReportRange) => {
  const [totals] = await db
    .select({
      totalPremium: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      netPremium: sql<number>`coalesce(sum(${policies.netPremium}), 0)`,
      vatAmount: sql<number>`coalesce(sum(${policies.vatAmount}), 0)`,
      registrationFee: sql<number>`coalesce(sum(${policies.registrationFee}), 0)`,
      policyCount: sql<number>`count(*)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)));

  const monthlyRows = await db
    .select({
      month: sql<string>`date_format(${policies.startDate}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(sql`date_format(${policies.startDate}, '%Y-%m')`);

  const byProduct = await db
    .select({
      key: products.type,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(policies)
    .leftJoin(products, eq(products.id, policies.productId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(products.type);

  const byCompany = await db
    .select({
      key: insuranceCompanies.name,
      code: insuranceCompanies.code,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(policies)
    .leftJoin(insuranceCompanies, eq(insuranceCompanies.id, policies.insuranceCompanyId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(insuranceCompanies.name, insuranceCompanies.code);

  const byAgent = await db
    .select({
      id: agents.id,
      name: users.username,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(policies)
    .leftJoin(agents, eq(agents.id, policies.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(agents.id, users.username);

  const totalPremium = toNumber(totals?.totalPremium);

  return {
    range,
    totals: {
      totalPremium,
      netPremium: toNumber(totals?.netPremium),
      vatAmount: toNumber(totals?.vatAmount),
      registrationFee: toNumber(totals?.registrationFee),
      policyCount: toNumber(totals?.policyCount),
    },
    monthly: fillSeries(monthlyRows, range),
    byProduct: byProduct.map((row) => ({
      key: row.key || 'Other',
      label: productLabel(row.key),
      value: toNumber(row.value),
      count: toNumber(row.count),
      percentage: percentOf(toNumber(row.value), totalPremium, 1),
      tone: productTone(row.key),
    })),
    byCompany: byCompany.map((row) => ({
      key: row.code || row.key || 'Other',
      label: row.key || 'ອື່ນໆ',
      value: toNumber(row.value),
      count: toNumber(row.count),
      percentage: percentOf(toNumber(row.value), totalPremium, 1),
    })),
    byAgent: byAgent.map((row) => ({
      id: row.id,
      label: row.name || 'ບໍ່ກຳນົດ',
      value: toNumber(row.value),
      count: toNumber(row.count),
      percentage: percentOf(toNumber(row.value), totalPremium, 1),
    })),
  };
};

const buildPolicies = async (tid: number, range: ReportRange) => {
  const today = todayInTimezone();
  const expiringTo = addDays(today, 30);

  const portfolioRows = await db
    .select({
      status: policies.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(eq(policies.tenantId, tid))
    .groupBy(policies.status);

  const issuedRows = await db
    .select({
      status: policies.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(policies.status);

  const [issued] = await db
    .select({
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)));

  const [expiring] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(
      and(
        eq(policies.tenantId, tid),
        eq(policies.status, 'active'),
        gte(policies.endDate, today),
        lte(policies.endDate, expiringTo),
      ),
    );

  const expiringList = await db
    .select({
      id: policies.id,
      policyNumber: policies.policyNumber,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      customerPhone: customers.phone,
      productName: products.name,
      endDate: policies.endDate,
      totalPremium: policies.totalPremium,
    })
    .from(policies)
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .leftJoin(products, eq(products.id, policies.productId))
    .where(
      and(
        eq(policies.tenantId, tid),
        eq(policies.status, 'active'),
        gte(policies.endDate, today),
        lte(policies.endDate, expiringTo),
      ),
    )
    .orderBy(policies.endDate)
    .limit(50);

  const portfolio = new Map(portfolioRows.map((row) => [row.status, row]));
  const at = (status: string) => toNumber(portfolio.get(status)?.count);
  const valueAt = (status: string) => toNumber(portfolio.get(status)?.value);

  return {
    range,
    total: portfolioRows.reduce((sum, row) => sum + toNumber(row.count), 0),
    active: at('active'),
    expiring30: toNumber(expiring?.total),
    expired: at('expired'),
    cancelled: at('cancelled'),
    pending: at('pending'),
    premium: portfolioRows.reduce((sum, row) => sum + toNumber(row.value), 0),
    issuedInPeriod: {
      count: toNumber(issued?.count),
      value: toNumber(issued?.value),
      byStatus: issuedRows.map((row) => ({
        key: row.status,
        label: labelOf(row.status),
        count: toNumber(row.count),
        value: toNumber(row.value),
      })),
    },
    portfolioByStatus: portfolioRows.map((row) => ({
      key: row.status,
      label: labelOf(row.status),
      count: toNumber(row.count),
      value: toNumber(row.value),
    })),
    expiringList: expiringList.map((row) => ({
      ...row,
      totalPremium: toNumber(row.totalPremium),
    })),
    activePremium: valueAt('active'),
  };
};

const buildQuotations = async (tid: number, range: ReportRange) => {
  const rows = await db
    .select({
      status: quotations.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${quotations.premium}), 0)`,
    })
    .from(quotations)
    .where(
      and(
        eq(quotations.tenantId, tid),
        gte(sql`date(${quotations.createdAt})`, range.from),
        lte(sql`date(${quotations.createdAt})`, range.to),
      ),
    )
    .groupBy(quotations.status);

  const byMonthRows = await db
    .select({
      month: sql<string>`date_format(${quotations.createdAt}, '%Y-%m')`,
      value: sql<number>`count(*)`,
    })
    .from(quotations)
    .where(
      and(
        eq(quotations.tenantId, tid),
        gte(sql`date(${quotations.createdAt})`, range.from),
        lte(sql`date(${quotations.createdAt})`, range.to),
      ),
    )
    .groupBy(sql`date_format(${quotations.createdAt}, '%Y-%m')`);

  const recent = await db
    .select({
      id: quotations.id,
      reference: quotations.reference,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      premium: quotations.premium,
      validUntil: quotations.validUntil,
      status: quotations.status,
      createdAt: quotations.createdAt,
    })
    .from(quotations)
    .leftJoin(customers, eq(customers.id, quotations.customerId))
    .where(eq(quotations.tenantId, tid))
    .orderBy(desc(quotations.createdAt))
    .limit(20);

  const counts = new Map(rows.map((row) => [row.status, row]));
  const countOf = (status: string) => toNumber(counts.get(status)?.count);
  const valueOf = (status: string) => toNumber(counts.get(status)?.value);
  const total = rows.reduce((sum, row) => sum + toNumber(row.count), 0);
  const accepted = countOf('accepted');
  const pipelineValue = ['draft', 'sent'].reduce((sum, status) => sum + valueOf(status), 0);

  return {
    range,
    total,
    totalValue: rows.reduce((sum, row) => sum + toNumber(row.value), 0),
    draft: countOf('draft'),
    sent: countOf('sent'),
    accepted,
    expired: countOf('expired'),
    conversionRate: percentOf(accepted, total, 1),
    pipelineValue,
    byStatus: rows.map((row) => ({
      key: row.status,
      label: labelOf(row.status),
      count: toNumber(row.count),
      value: toNumber(row.value),
    })),
    monthly: fillSeries(byMonthRows, range),
    recent: recent.map((row) => ({ ...row, premium: toNumber(row.premium) })),
  };
};

const buildClaims = async (tid: number, range: ReportRange) => {
  const rows = await db
    .select({
      status: claims.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${claims.amount}), 0)`,
    })
    .from(claims)
    .where(
      and(
        eq(claims.tenantId, tid),
        gte(claims.incidentDate, range.from),
        lte(claims.incidentDate, range.to),
      ),
    )
    .groupBy(claims.status);

  const byType = await db
    .select({
      key: claims.type,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${claims.amount}), 0)`,
    })
    .from(claims)
    .where(
      and(
        eq(claims.tenantId, tid),
        gte(claims.incidentDate, range.from),
        lte(claims.incidentDate, range.to),
      ),
    )
    .groupBy(claims.type);

  const byMonthRows = await db
    .select({
      month: sql<string>`date_format(${claims.incidentDate}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(${claims.amount}), 0)`,
    })
    .from(claims)
    .where(
      and(
        eq(claims.tenantId, tid),
        gte(claims.incidentDate, range.from),
        lte(claims.incidentDate, range.to),
      ),
    )
    .groupBy(sql`date_format(${claims.incidentDate}, '%Y-%m')`);

  const recent = await db
    .select({
      id: claims.id,
      claimNumber: claims.claimNumber,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      type: claims.type,
      amount: claims.amount,
      status: claims.status,
      incidentDate: claims.incidentDate,
    })
    .from(claims)
    .leftJoin(customers, eq(customers.id, claims.customerId))
    .where(eq(claims.tenantId, tid))
    .orderBy(desc(claims.incidentDate))
    .limit(20);

  const [premiumRow] = await db
    .select({ total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)` })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)));

  const counts = new Map(rows.map((row) => [row.status, row]));
  const countOf = (status: string) => toNumber(counts.get(status)?.count);
  const valueOf = (status: string) => toNumber(counts.get(status)?.value);
  const amount = rows.reduce((sum, row) => sum + toNumber(row.value), 0);

  return {
    range,
    total: rows.reduce((sum, row) => sum + toNumber(row.count), 0),
    pending: countOf('pending'),
    reviewing: countOf('reviewing'),
    approved: countOf('approved'),
    rejected: countOf('rejected'),
    amount,
    approvedAmount: valueOf('approved'),
    premium: toNumber(premiumRow?.total),
    ratio: percentOf(amount, toNumber(premiumRow?.total), 1),
    byStatus: rows.map((row) => ({
      key: row.status,
      label: labelOf(row.status),
      count: toNumber(row.count),
      value: toNumber(row.value),
    })),
    byType: byType.map((row) => ({
      key: row.key,
      label: row.key,
      count: toNumber(row.count),
      value: toNumber(row.value),
    })),
    monthly: fillSeries(byMonthRows, range),
    recent: recent.map((row) => ({ ...row, amount: toNumber(row.amount) })),
  };
};

const buildCustomers = async (tid: number, range: ReportRange) => {
  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, tid));

  const [activeRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(and(eq(customers.tenantId, tid), eq(customers.status, 'active')));

  const [newRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tid),
        gte(sql`date(${customers.createdAt})`, range.from),
        lte(sql`date(${customers.createdAt})`, range.to),
      ),
    );

  const newByMonth = await db
    .select({
      month: sql<string>`date_format(${customers.createdAt}, '%Y-%m')`,
      value: sql<number>`count(*)`,
    })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tid),
        gte(sql`date(${customers.createdAt})`, range.from),
        lte(sql`date(${customers.createdAt})`, range.to),
      ),
    )
    .groupBy(sql`date_format(${customers.createdAt}, '%Y-%m')`);

  const [withPolicyRow] = await db
    .select({ total: sql<number>`count(distinct ${policies.customerId})` })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), eq(policies.status, 'active')));

  const [policyRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(eq(policies.tenantId, tid));

  const topCustomers = await db
    .select({
      id: customers.id,
      name: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      phone: customers.phone,
      policyCount: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .innerJoin(customers, eq(customers.id, policies.customerId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(customers.id, customers.firstName, customers.lastName, customers.phone)
    .orderBy(desc(sql`coalesce(sum(${policies.totalPremium}), 0)`))
    .limit(20);

  const total = toNumber(totalRow?.total);

  return {
    range,
    total,
    active: toNumber(activeRow?.total),
    newInPeriod: toNumber(newRow?.total),
    withActivePolicy: toNumber(withPolicyRow?.total),
    policyCount: toNumber(policyRow?.total),
    policiesPerCustomer: total > 0 ? Math.round((toNumber(policyRow?.total) / total) * 10) / 10 : 0,
    newByMonth: fillSeries(newByMonth, range),
    topCustomers: topCustomers.map((row) => ({
      ...row,
      policyCount: toNumber(row.policyCount),
      value: toNumber(row.value),
    })),
  };
};

const buildAgents = async (tid: number, range: ReportRange) => {
  const agentRows = await db
    .select({
      id: agents.id,
      code: agents.agentCode,
      name: users.username,
      teamId: agents.teamId,
      teamName: teams.name,
      level: agents.level,
      salesTarget: agents.salesTarget,
      commissionRate: agents.commissionRate,
      status: agents.status,
    })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(eq(agents.tenantId, tid));

  const policyRows = await db
    .select({
      agentId: policies.agentId,
      sales: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      policyCount: sql<number>`count(*)`,
    })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(policies.agentId);

  const commissionRows = await db
    .select({
      agentId: commissions.agentId,
      amount: sql<number>`coalesce(sum(${commissions.amount}), 0)`,
      pending: sql<number>`coalesce(sum(case when ${commissions.status} = 'pending' then ${commissions.amount} else 0 end), 0)`,
      paid: sql<number>`coalesce(sum(case when ${commissions.status} = 'paid' then ${commissions.amount} else 0 end), 0)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.tenantId, tid),
        gte(sql`date(${commissions.createdAt})`, range.from),
        lte(sql`date(${commissions.createdAt})`, range.to),
      ),
    )
    .groupBy(commissions.agentId);

  const salesByAgent = new Map(policyRows.map((row) => [row.agentId, row]));
  const commissionByAgent = new Map(commissionRows.map((row) => [row.agentId, row]));

  const ranking = agentRows
    .map((agent) => {
      const sales = toNumber(salesByAgent.get(agent.id)?.sales);
      const target = toNumber(agent.salesTarget);
      const commission = commissionByAgent.get(agent.id);
      return {
        id: agent.id,
        code: agent.code,
        name: agent.name || '—',
        teamName: agent.teamName || '—',
        level: agent.level,
        status: agent.status,
        sales,
        policyCount: toNumber(salesByAgent.get(agent.id)?.policyCount),
        target,
        achievement: percentOf(sales, target, 1),
        commission: toNumber(commission?.amount),
        pendingCommission: toNumber(commission?.pending),
        paidCommission: toNumber(commission?.paid),
      };
    })
    .sort((left, right) => right.sales - left.sales);

  return {
    range,
    total: agentRows.length,
    active: agentRows.filter((agent) => agent.status === 'active').length,
    sales: ranking.reduce((sum, agent) => sum + agent.sales, 0),
    target: ranking.reduce((sum, agent) => sum + agent.target, 0),
    commission: ranking.reduce((sum, agent) => sum + agent.commission, 0),
    salesTargetAchievement: percentOf(
      ranking.reduce((sum, agent) => sum + agent.sales, 0),
      ranking.reduce((sum, agent) => sum + agent.target, 0),
      1,
    ),
    ranking,
  };
};

const buildTeams = async (tid: number, range: ReportRange) => {
  const teamRows = await db
    .select({
      id: teams.id,
      name: teams.name,
      location: teams.location,
      headName: teams.headName,
      members: teams.members,
      status: teams.status,
    })
    .from(teams)
    .where(eq(teams.tenantId, tid));

  const agentRows = await db
    .select({
      teamId: agents.teamId,
      count: sql<number>`count(*)`,
      target: sql<number>`coalesce(sum(${agents.salesTarget}), 0)`,
    })
    .from(agents)
    .where(eq(agents.tenantId, tid))
    .groupBy(agents.teamId);

  const policyRows = await db
    .select({
      teamId: agents.teamId,
      sales: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
      policyCount: sql<number>`count(*)`,
    })
    .from(policies)
    .innerJoin(agents, eq(agents.id, policies.agentId))
    .where(and(eq(policies.tenantId, tid), policyRange(range)))
    .groupBy(agents.teamId);

  const agentByTeam = new Map(agentRows.map((row) => [row.teamId, row]));
  const salesByTeam = new Map(policyRows.map((row) => [row.teamId, row]));

  const ranking = teamRows
    .map((team) => {
      const sales = toNumber(salesByTeam.get(team.id)?.sales);
      const target = toNumber(agentByTeam.get(team.id)?.target);
      return {
        id: team.id,
        name: team.name,
        location: team.location || '—',
        headName: team.headName || '—',
        status: team.status,
        members: toNumber(team.members) || toNumber(agentByTeam.get(team.id)?.count),
        agentCount: toNumber(agentByTeam.get(team.id)?.count),
        sales,
        policyCount: toNumber(salesByTeam.get(team.id)?.policyCount),
        target,
        achievement: percentOf(sales, target, 1),
      };
    })
    .sort((left, right) => right.sales - left.sales);

  return {
    range,
    total: ranking.length,
    members: ranking.reduce((sum, team) => sum + team.members, 0),
    sales: ranking.reduce((sum, team) => sum + team.sales, 0),
    target: ranking.reduce((sum, team) => sum + team.target, 0),
    salesTargetAchievement: percentOf(
      ranking.reduce((sum, team) => sum + team.sales, 0),
      ranking.reduce((sum, team) => sum + team.target, 0),
      1,
    ),
    ranking,
  };
};

const buildCommissions = async (tid: number, range: ReportRange) => {
  const rows = await db
    .select({
      status: commissions.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${commissions.amount}), 0)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.tenantId, tid),
        gte(sql`date(${commissions.createdAt})`, range.from),
        lte(sql`date(${commissions.createdAt})`, range.to),
      ),
    )
    .groupBy(commissions.status);

  const byAgent = await db
    .select({
      id: agents.id,
      name: users.username,
      teamName: teams.name,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${commissions.amount}), 0)`,
      pending: sql<number>`coalesce(sum(case when ${commissions.status} = 'pending' then ${commissions.amount} else 0 end), 0)`,
      paid: sql<number>`coalesce(sum(case when ${commissions.status} = 'paid' then ${commissions.amount} else 0 end), 0)`,
    })
    .from(commissions)
    .leftJoin(agents, eq(agents.id, commissions.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(
      and(
        eq(commissions.tenantId, tid),
        gte(sql`date(${commissions.createdAt})`, range.from),
        lte(sql`date(${commissions.createdAt})`, range.to),
      ),
    )
    .groupBy(agents.id, users.username, teams.name)
    .orderBy(desc(sql`coalesce(sum(${commissions.amount}), 0)`));

  const byMonthRows = await db
    .select({
      month: sql<string>`date_format(${commissions.createdAt}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(${commissions.amount}), 0)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.tenantId, tid),
        gte(sql`date(${commissions.createdAt})`, range.from),
        lte(sql`date(${commissions.createdAt})`, range.to),
      ),
    )
    .groupBy(sql`date_format(${commissions.createdAt}, '%Y-%m')`);

  const recent = await db
    .select({
      id: commissions.id,
      agentName: users.username,
      policyNumber: policies.policyNumber,
      rate: commissions.rate,
      amount: commissions.amount,
      status: commissions.status,
      paidAt: commissions.paidAt,
    })
    .from(commissions)
    .leftJoin(agents, eq(agents.id, commissions.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(policies, eq(policies.id, commissions.policyId))
    .where(eq(commissions.tenantId, tid))
    .orderBy(desc(commissions.createdAt))
    .limit(20);

  const counts = new Map(rows.map((row) => [row.status, row]));
  const total = rows.reduce((sum, row) => sum + toNumber(row.count), 0);

  return {
    range,
    total,
    pending: toNumber(counts.get('pending')?.count),
    paid: toNumber(counts.get('paid')?.count),
    pendingAmount: toNumber(counts.get('pending')?.value),
    paidAmount: toNumber(counts.get('paid')?.value),
    totalAmount: rows.reduce((sum, row) => sum + toNumber(row.value), 0),
    byStatus: rows.map((row) => ({
      key: row.status,
      label: labelOf(row.status),
      count: toNumber(row.count),
      value: toNumber(row.value),
    })),
    byAgent: byAgent.map((row) => ({
      id: row.id,
      name: row.name || '—',
      teamName: row.teamName || '—',
      count: toNumber(row.count),
      value: toNumber(row.value),
      pending: toNumber(row.pending),
      paid: toNumber(row.paid),
    })),
    monthly: fillSeries(byMonthRows, range),
    recent: recent.map((row) => ({
      ...row,
      rate: toNumber(row.rate),
      amount: toNumber(row.amount),
    })),
  };
};

const buildFinance = async (tid: number, range: ReportRange) => {
  const today = todayInTimezone();

  const invoiceRows = await db
    .select({
      status: invoices.status,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${invoices.amount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tid),
        gte(invoices.issuedDate, range.from),
        lte(invoices.issuedDate, range.to),
      ),
    )
    .groupBy(invoices.status);

  const [paymentAgg] = await db
    .select({
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(case when ${payments.status} = 'completed' then ${payments.amount} else 0 end), 0)`,
      pending: sql<number>`coalesce(sum(case when ${payments.status} = 'pending' then 1 else 0 end), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, tid),
        gte(payments.paidAt, range.from),
        lte(payments.paidAt, range.to),
      ),
    );

  const [todayAgg] = await db
    .select({ value: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and(eq(payments.tenantId, tid), eq(payments.status, 'completed'), eq(payments.paidAt, today)),
    );

  const [monthAgg] = await db
    .select({ value: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, tid),
        eq(payments.status, 'completed'),
        gte(payments.paidAt, `${today.slice(0, 7)}-01`),
        lte(payments.paidAt, today),
      ),
    );

  const byMethod = await db
    .select({
      key: payments.method,
      count: sql<number>`count(*)`,
      value: sql<number>`coalesce(sum(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, tid),
        eq(payments.status, 'completed'),
        gte(payments.paidAt, range.from),
        lte(payments.paidAt, range.to),
      ),
    )
    .groupBy(payments.method);

  const [aging] = await db
    .select({
      current: sql<number>`coalesce(sum(case when ${invoices.dueDate} is null or ${invoices.dueDate} >= ${today} then ${invoices.amount} else 0 end), 0)`,
      days1to30: sql<number>`coalesce(sum(case when datediff(${today}, ${invoices.dueDate}) between 1 and 30 then ${invoices.amount} else 0 end), 0)`,
      days31to60: sql<number>`coalesce(sum(case when datediff(${today}, ${invoices.dueDate}) between 31 and 60 then ${invoices.amount} else 0 end), 0)`,
      days61to90: sql<number>`coalesce(sum(case when datediff(${today}, ${invoices.dueDate}) between 61 and 90 then ${invoices.amount} else 0 end), 0)`,
      days90plus: sql<number>`coalesce(sum(case when datediff(${today}, ${invoices.dueDate}) > 90 then ${invoices.amount} else 0 end), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tid),
        sql`${invoices.status} in ('unpaid','overdue')`,
        lte(invoices.issuedDate, range.to),
      ),
    );

  const invoicedByMonth = await db
    .select({
      month: sql<string>`date_format(${invoices.issuedDate}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(${invoices.amount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tid),
        gte(invoices.issuedDate, range.from),
        lte(invoices.issuedDate, range.to),
      ),
    )
    .groupBy(sql`date_format(${invoices.issuedDate}, '%Y-%m')`);

  const collectedByMonth = await db
    .select({
      month: sql<string>`date_format(${payments.paidAt}, '%Y-%m')`,
      value: sql<number>`coalesce(sum(case when ${payments.status} = 'completed' then ${payments.amount} else 0 end), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, tid),
        gte(payments.paidAt, range.from),
        lte(payments.paidAt, range.to),
      ),
    )
    .groupBy(sql`date_format(${payments.paidAt}, '%Y-%m')`);

  const overdueList = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      status: invoices.status,
    })
    .from(invoices)
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .where(
      and(
        eq(invoices.tenantId, tid),
        sql`${invoices.status} in ('unpaid','overdue')`,
        lte(invoices.issuedDate, range.to),
      ),
    )
    .orderBy(invoices.dueDate)
    .limit(20);

  const counts = new Map(invoiceRows.map((row) => [row.status, row]));
  const invoiced = invoiceRows.reduce((sum, row) => sum + toNumber(row.value), 0);
  const collected = toNumber(paymentAgg?.value);
  const monthlyMap = new Map(invoicedByMonth.map((row) => [row.month, toNumber(row.value)]));
  const collectedMap = new Map(collectedByMonth.map((row) => [row.month, toNumber(row.value)]));

  return {
    range,
    invoices: {
      total: invoiceRows.reduce((sum, row) => sum + toNumber(row.count), 0),
      unpaid: toNumber(counts.get('unpaid')?.count),
      overdue: toNumber(counts.get('overdue')?.count),
      paid: toNumber(counts.get('paid')?.count),
      amount: invoiced,
      unpaidAmount: toNumber(counts.get('unpaid')?.value),
      overdueAmount: toNumber(counts.get('overdue')?.value),
    },
    payments: {
      total: toNumber(paymentAgg?.count),
      collected,
      pending: toNumber(paymentAgg?.pending),
      today: toNumber(todayAgg?.value),
      month: toNumber(monthAgg?.value),
      byMethod: byMethod.map((row) => ({
        key: row.key,
        label: row.key,
        count: toNumber(row.count),
        value: toNumber(row.value),
      })),
    },
    collectionRate: percentOf(collected, invoiced, 1),
    aging: {
      current: toNumber(aging?.current),
      days1to30: toNumber(aging?.days1to30),
      days31to60: toNumber(aging?.days31to60),
      days61to90: toNumber(aging?.days61to90),
      days90plus: toNumber(aging?.days90plus),
      total:
        toNumber(aging?.current) +
        toNumber(aging?.days1to30) +
        toNumber(aging?.days31to60) +
        toNumber(aging?.days61to90) +
        toNumber(aging?.days90plus),
    },
    monthly: monthKeys(range).map((month) => ({
      month,
      label: monthLabel(month),
      invoiced: monthlyMap.get(month) ?? 0,
      collected: collectedMap.get(month) ?? 0,
    })),
    overdueList: overdueList.map((row) => ({
      ...row,
      amount: toNumber(row.amount),
    })),
  };
};

const builders: Record<ReportType, (tid: number, range: ReportRange) => Promise<unknown>> = {
  summary: buildSummary,
  sales: buildSales,
  policies: buildPolicies,
  quotations: buildQuotations,
  claims: buildClaims,
  customers: buildCustomers,
  agents: buildAgents,
  teams: buildTeams,
  commissions: buildCommissions,
  finance: buildFinance,
};

const withReport = (type: ReportType) => async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const range = resolveReportRange(req.query);
  const data = await builders[type](tid, range);
  res.json({ data });
};

export const reportSummary = withReport('summary');
export const reportSales = withReport('sales');
export const reportPolicies = withReport('policies');
export const reportQuotations = withReport('quotations');
export const reportClaims = withReport('claims');
export const reportCustomers = withReport('customers');
export const reportAgents = withReport('agents');
export const reportTeams = withReport('teams');
export const reportCommissions = withReport('commissions');
export const reportFinance = withReport('finance');

const resolveFormat = (value: unknown): ReportFormat => {
  const format = String(value || 'csv').toLowerCase();
  if (format !== 'csv' && format !== 'xlsx' && format !== 'pdf') {
    throw ApiError.badRequest(`Unknown export format: ${format}`);
  }
  return format;
};

export const exportReport = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const type = String(req.query.type || 'summary') as ReportType;
  if (!REPORT_TYPES.includes(type)) {
    throw ApiError.badRequest(`Unknown report type: ${type}`);
  }
  const range = resolveReportRange(req.query);
  const format = resolveFormat(req.query.format);
  const data = await builders[type](tid, range);
  const meta = { type, title: REPORT_TITLES[type], from: range.from, to: range.to };
  const filename = `report-${type}-${range.from}-${range.to}`;

  if (format === 'xlsx') {
    const buffer = await buildXlsx(data, meta);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.send(buffer);
    return;
  }

  if (format === 'pdf') {
    const buffer = await buildPdf(data, meta);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.send(buffer);
    return;
  }

  const csv = buildCsv(data);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(`\uFEFF${csv}`);
};
