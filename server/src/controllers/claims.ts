import type { Request, Response } from 'express';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { claims, customers, policies } from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';
import { likeValue, parseListQuery, sequenceNumber, toNumber } from '../utils/list.js';
import { resolveCustomer } from '../services/tenantLookup.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

const claimFields = {
  id: claims.id,
  claimNumber: claims.claimNumber,
  policyId: claims.policyId,
  policyNumber: policies.policyNumber,
  customerId: claims.customerId,
  claimant: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
  type: claims.type,
  incidentDate: claims.incidentDate,
  amount: claims.amount,
  coverageLimit: claims.coverageLimit,
  status: claims.status,
  attachments: claims.attachments,
  createdAt: claims.createdAt,
};

const claimQuery = () =>
  db
    .select(claimFields)
    .from(claims)
    .leftJoin(policies, eq(policies.id, claims.policyId))
    .leftJoin(customers, eq(customers.id, claims.customerId));

const mapClaim = (row: { amount: unknown; coverageLimit: unknown; [key: string]: unknown }) => ({
  ...row,
  amount: toNumber(row.amount),
  coverageLimit: toNumber(row.coverageLimit),
  attachments: row.attachments || [],
});

export const listClaims = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const type = typeof req.query.type === 'string' ? req.query.type : '';

  const conditions = [eq(claims.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(claims.claimNumber, term),
        like(policies.policyNumber, term),
        like(customers.firstName, term),
        like(customers.lastName, term),
        like(claims.type, term),
      )!,
    );
  }
  if (status) conditions.push(eq(claims.status, status));
  if (type) conditions.push(eq(claims.type, type));

  const where = and(...conditions);
  const rows = await claimQuery()
    .where(where)
    .orderBy(desc(claims.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${claims.id})` })
    .from(claims)
    .leftJoin(policies, eq(policies.id, claims.policyId))
    .leftJoin(customers, eq(customers.id, claims.customerId))
    .where(where);

  res.json({
    data: rows.map(mapClaim),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const getClaim = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid claim id');
  const [row] = await claimQuery()
    .where(and(eq(claims.tenantId, tid), eq(claims.id, id)))
    .limit(1);
  if (!row) throw ApiError.notFound('Claim not found');
  res.json({ data: mapClaim(row) });
};

export const createClaim = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);

  let policyId: number | null = null;
  let policyCustomerId: number | null = null;
  const rawPolicyId = Number(body.policyId || 0);
  const policyNumber =
    typeof body.policyNumber === 'string' ? body.policyNumber.trim() : '';

  if (rawPolicyId || policyNumber) {
    const conditions = [eq(policies.tenantId, tid)];
    if (rawPolicyId) conditions.push(eq(policies.id, rawPolicyId));
    if (policyNumber) conditions.push(eq(policies.policyNumber, policyNumber));
    const [policy] = await db
      .select({ id: policies.id, customerId: policies.customerId })
      .from(policies)
      .where(and(...conditions))
      .limit(1);
    if (!policy) throw ApiError.badRequest('Unknown policy');
    policyId = policy.id;
    policyCustomerId = policy.customerId;
  }

  const customerId = policyCustomerId ?? (await resolveCustomer(tid, {
    customerId: body.customerId,
    customerName: body.claimant,
    customerPhone: body.customerPhone,
  }));

  const type = requireString(body.type, 'type', { max: 50 });
  const incidentDate = requireString(body.incidentDate, 'incidentDate', { max: 10 });

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(claims)
    .where(eq(claims.tenantId, tid));
  const year = String(new Date().getFullYear()).slice(-2);
  const claimNumber =
    optionalString(body.claimNumber, 'claimNumber', { max: 50 }) ||
    sequenceNumber(`CLM-${year}-`, toNumber(countRow?.total), 3);

  const attachments = Array.isArray(body.attachments)
    ? body.attachments.filter((item): item is string => typeof item === 'string')
    : [];

  const [result] = await db.insert(claims).values({
    tenantId: tid,
    claimNumber,
    policyId,
    customerId,
    type,
    incidentDate,
    amount: String(Number(body.amount) || 0),
    coverageLimit: String(Number(body.coverageLimit) || 0),
    status: optionalString(body.status, 'status', { max: 20 }) || 'pending',
    attachments,
  });

  const [row] = await claimQuery()
    .where(and(eq(claims.tenantId, tid), eq(claims.id, result.insertId)))
    .limit(1);

  res.status(201).json({ data: row ? mapClaim(row) : { id: result.insertId, claimNumber } });
};

export const updateClaimStatus = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid claim id');
  const body = asObject(req.body);
  const status = requireString(body.status, 'status', { max: 20 });
  if (!['pending', 'reviewing', 'approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Invalid claim status');
  }

  await db
    .update(claims)
    .set({ status })
    .where(and(eq(claims.tenantId, tid), eq(claims.id, id)));

  const [row] = await claimQuery()
    .where(and(eq(claims.tenantId, tid), eq(claims.id, id)))
    .limit(1);
  if (!row) throw ApiError.notFound('Claim not found');
  res.json({ data: mapClaim(row) });
};

export const claimStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`coalesce(sum(case when ${claims.status} = 'pending' then 1 else 0 end), 0)`,
      approved: sql<number>`coalesce(sum(case when ${claims.status} = 'approved' then 1 else 0 end), 0)`,
      rejected: sql<number>`coalesce(sum(case when ${claims.status} = 'rejected' then 1 else 0 end), 0)`,
    })
    .from(claims)
    .where(eq(claims.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      pending: toNumber(row?.pending),
      approved: toNumber(row?.approved),
      rejected: toNumber(row?.rejected),
    },
  });
};
