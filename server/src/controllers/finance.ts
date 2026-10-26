import type { Request, Response } from 'express';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  commissions,
  customers,
  invoices,
  payments,
  policies,
  users,
} from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';
import { likeValue, parseListQuery, sequenceNumber, toNumber, today } from '../utils/list.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

export const listCommissions = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';

  const conditions = [eq(commissions.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(like(users.username, term), like(policies.policyNumber, term))!,
    );
  }
  if (status) conditions.push(eq(commissions.status, status));

  const where = and(...conditions);
  const rows = await db
    .select({
      id: commissions.id,
      agentId: commissions.agentId,
      agentName: users.username,
      policyId: commissions.policyId,
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
    .where(where)
    .orderBy(desc(commissions.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${commissions.id})` })
    .from(commissions)
    .leftJoin(agents, eq(agents.id, commissions.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(policies, eq(policies.id, commissions.policyId))
    .where(where);

  res.json({
    data: rows.map((row) => ({ ...row, rate: toNumber(row.rate), amount: toNumber(row.amount) })),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const payCommission = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid commission id');

  await db
    .update(commissions)
    .set({ status: 'paid', paidAt: today() })
    .where(and(eq(commissions.tenantId, tid), eq(commissions.id, id)));

  const [row] = await db
    .select({
      id: commissions.id,
      agentId: commissions.agentId,
      agentName: users.username,
      policyId: commissions.policyId,
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
    .where(and(eq(commissions.tenantId, tid), eq(commissions.id, id)))
    .limit(1);

  if (!row) throw ApiError.notFound('Commission not found');
  res.json({ data: { ...row, rate: toNumber(row.rate), amount: toNumber(row.amount) } });
};

const invoiceFields = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  policyId: invoices.policyId,
  policyNumber: policies.policyNumber,
  customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
  amount: invoices.amount,
  issuedDate: invoices.issuedDate,
  dueDate: invoices.dueDate,
  status: invoices.status,
  notes: invoices.notes,
};

const invoiceQuery = () =>
  db
    .select(invoiceFields)
    .from(invoices)
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId));

export const listInvoices = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';

  const conditions = [eq(invoices.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(invoices.invoiceNumber, term),
        like(policies.policyNumber, term),
        like(customers.firstName, term),
        like(customers.lastName, term),
      )!,
    );
  }
  if (status) conditions.push(eq(invoices.status, status));

  const where = and(...conditions);
  const rows = await invoiceQuery()
    .where(where)
    .orderBy(desc(invoices.issuedDate))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${invoices.id})` })
    .from(invoices)
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .where(where);

  res.json({
    data: rows.map((row) => ({ ...row, amount: toNumber(row.amount) })),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const createInvoice = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const policyId = Number(body.policyId || 0);
  if (!policyId) throw ApiError.badRequest('policyId is required');

  const [policy] = await db
    .select({ id: policies.id, totalPremium: policies.totalPremium })
    .from(policies)
    .where(and(eq(policies.tenantId, tid), eq(policies.id, policyId)))
    .limit(1);
  if (!policy) throw ApiError.badRequest('Unknown policyId');

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(invoices)
    .where(eq(invoices.tenantId, tid));
  const year = String(new Date().getFullYear()).slice(-2);
  const invoiceNumber =
    optionalString(body.invoiceNumber, 'invoiceNumber', { max: 50 }) ||
    sequenceNumber(`INV-${year}-`, toNumber(countRow?.total), 4);

  const [result] = await db.insert(invoices).values({
    tenantId: tid,
    invoiceNumber,
    policyId,
    amount: String(Number(body.amount ?? policy.totalPremium) || 0),
    issuedDate: optionalString(body.issuedDate, 'issuedDate', { max: 10 }) || today(),
    dueDate: optionalString(body.dueDate, 'dueDate', { max: 10 }),
    status: optionalString(body.status, 'status', { max: 20 }) || 'unpaid',
    notes: optionalString(body.notes ?? body.note, 'notes', { max: 2000 }),
  });

  const [row] = await invoiceQuery()
    .where(and(eq(invoices.tenantId, tid), eq(invoices.id, result.insertId)))
    .limit(1);
  res.status(201).json({ data: row ? { ...row, amount: toNumber(row.amount) } : { id: result.insertId, invoiceNumber } });
};

const paymentFields = {
  id: payments.id,
  receiptNumber: payments.receiptNumber,
  invoiceId: payments.invoiceId,
  invoiceNumber: invoices.invoiceNumber,
  customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
  amount: payments.amount,
  method: payments.method,
  paidAt: payments.paidAt,
  status: payments.status,
  slipUrl: payments.slipUrl,
};

const paymentQuery = () =>
  db
    .select(paymentFields)
    .from(payments)
    .leftJoin(invoices, eq(invoices.id, payments.invoiceId))
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId));

export const listPayments = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';

  const conditions = [eq(payments.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(payments.receiptNumber, term),
        like(invoices.invoiceNumber, term),
        like(customers.firstName, term),
        like(customers.lastName, term),
      )!,
    );
  }
  if (status) conditions.push(eq(payments.status, status));

  const where = and(...conditions);
  const rows = await paymentQuery()
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${payments.id})` })
    .from(payments)
    .leftJoin(invoices, eq(invoices.id, payments.invoiceId))
    .leftJoin(policies, eq(policies.id, invoices.policyId))
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .where(where);

  res.json({
    data: rows.map((row) => ({ ...row, amount: toNumber(row.amount) })),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const createPayment = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const invoiceId = Number(body.invoiceId || 0);
  if (!invoiceId) throw ApiError.badRequest('invoiceId is required');

  const [invoice] = await db
    .select({ id: invoices.id, amount: invoices.amount })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tid), eq(invoices.id, invoiceId)))
    .limit(1);
  if (!invoice) throw ApiError.badRequest('Unknown invoiceId');

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(payments)
    .where(eq(payments.tenantId, tid));
  const year = String(new Date().getFullYear()).slice(-2);
  const receiptNumber =
    optionalString(body.receiptNumber, 'receiptNumber', { max: 50 }) ||
    sequenceNumber(`RCP-${year}-`, toNumber(countRow?.total), 4);
  const status = optionalString(body.status, 'status', { max: 20 }) || 'completed';

  const [result] = await db.insert(payments).values({
    tenantId: tid,
    receiptNumber,
    invoiceId,
    amount: String(Number(body.amount ?? invoice.amount) || 0),
    method: optionalString(body.method, 'method', { max: 20 }) || 'cash',
    paidAt: optionalString(body.paidAt, 'paidAt', { max: 10 }) || (status === 'completed' ? today() : null),
    status,
    slipUrl: optionalString(body.slipUrl, 'slipUrl', { max: 2000 }),
  });

  if (status === 'completed') {
    await db
      .update(invoices)
      .set({ status: 'paid' })
      .where(and(eq(invoices.tenantId, tid), eq(invoices.id, invoiceId)));
  }

  const [row] = await paymentQuery()
    .where(and(eq(payments.tenantId, tid), eq(payments.id, result.insertId)))
    .limit(1);
  res.status(201).json({ data: row ? { ...row, amount: toNumber(row.amount) } : { id: result.insertId, receiptNumber } });
};

export const commissionStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`coalesce(sum(case when ${commissions.status} = 'pending' then ${commissions.amount} else 0 end), 0)`,
      paid: sql<number>`coalesce(sum(case when ${commissions.status} = 'paid' then ${commissions.amount} else 0 end), 0)`,
    })
    .from(commissions)
    .where(eq(commissions.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      pending: toNumber(row?.pending),
      paid: toNumber(row?.paid),
    },
  });
};

export const invoiceStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      unpaid: sql<number>`coalesce(sum(case when ${invoices.status} = 'unpaid' then 1 else 0 end), 0)`,
      overdue: sql<number>`coalesce(sum(case when ${invoices.status} = 'overdue' then 1 else 0 end), 0)`,
      amount: sql<number>`coalesce(sum(${invoices.amount}), 0)`,
    })
    .from(invoices)
    .where(eq(invoices.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      unpaid: toNumber(row?.unpaid),
      overdue: toNumber(row?.overdue),
      amount: toNumber(row?.amount),
    },
  });
};

export const paymentStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      today: sql<number>`coalesce(sum(case when ${payments.paidAt} = curdate() and ${payments.status} = 'completed' then ${payments.amount} else 0 end), 0)`,
      month: sql<number>`coalesce(sum(case when date_format(${payments.paidAt}, '%Y-%m') = date_format(curdate(), '%Y-%m') and ${payments.status} = 'completed' then ${payments.amount} else 0 end), 0)`,
      pending: sql<number>`coalesce(sum(case when ${payments.status} = 'pending' then 1 else 0 end), 0)`,
    })
    .from(payments)
    .where(eq(payments.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      today: toNumber(row?.today),
      month: toNumber(row?.month),
      pending: toNumber(row?.pending),
    },
  });
};
