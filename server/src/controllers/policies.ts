import type { Request, Response } from 'express';
import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  commissions,
  customers,
  insuranceCompanies,
  policies,
  products,
  quotations,
  users,
  vehicles,
} from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';
import { likeValue, parseListQuery, sequenceNumber, toNumber } from '../utils/list.js';
import {
  resolveAgent,
  resolveCompany,
  resolveCustomer,
  resolveProduct,
  resolveVehicle,
} from '../services/tenantLookup.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

const policyFields = {
  id: policies.id,
  policyNumber: policies.policyNumber,
  customerId: policies.customerId,
  customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
  customerPhone: customers.phone,
  agentId: policies.agentId,
  agentName: users.username,
  companyCode: insuranceCompanies.code,
  companyName: insuranceCompanies.name,
  productType: products.type,
  productName: products.name,
  vehiclePlate: vehicles.plateNumber,
  startDate: policies.startDate,
  endDate: policies.endDate,
  netPremium: policies.netPremium,
  vatAmount: policies.vatAmount,
  registrationFee: policies.registrationFee,
  totalPremium: policies.totalPremium,
  status: policies.status,
  createdAt: policies.createdAt,
};

const policyQuery = () =>
  db
    .select(policyFields)
    .from(policies)
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .leftJoin(agents, eq(agents.id, policies.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(insuranceCompanies, eq(insuranceCompanies.id, policies.insuranceCompanyId))
    .leftJoin(products, eq(products.id, policies.productId))
    .leftJoin(vehicles, eq(vehicles.id, policies.vehicleId));

const mapPolicy = (row: {
  netPremium: unknown;
  vatAmount: unknown;
  registrationFee: unknown;
  totalPremium: unknown;
  [key: string]: unknown;
}) => ({
  ...row,
  netPremium: toNumber(row.netPremium),
  vatAmount: toNumber(row.vatAmount),
  registrationFee: toNumber(row.registrationFee),
  totalPremium: toNumber(row.totalPremium),
});

export const listPolicies = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const productType = typeof req.query.productType === 'string' ? req.query.productType : '';

  const conditions = [eq(policies.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(policies.policyNumber, term),
        like(customers.firstName, term),
        like(customers.lastName, term),
        like(customers.phone, term),
        like(vehicles.plateNumber, term),
        like(users.username, term),
      )!,
    );
  }
  if (status) conditions.push(eq(policies.status, status));
  if (productType) conditions.push(eq(products.type, productType));

  const where = and(...conditions);
  const sortColumns = {
    policyNumber: policies.policyNumber,
    endDate: policies.endDate,
    totalPremium: policies.totalPremium,
    createdAt: policies.createdAt,
  } as const;
  const column =
    sortColumns[(query.sortField as keyof typeof sortColumns) || 'createdAt'] ||
    policies.createdAt;

  const rows = await policyQuery()
    .where(where)
    .orderBy(query.sortOrder === 'asc' ? asc(column) : desc(column))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${policies.id})` })
    .from(policies)
    .leftJoin(customers, eq(customers.id, policies.customerId))
    .leftJoin(agents, eq(agents.id, policies.agentId))
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(insuranceCompanies, eq(insuranceCompanies.id, policies.insuranceCompanyId))
    .leftJoin(products, eq(products.id, policies.productId))
    .leftJoin(vehicles, eq(vehicles.id, policies.vehicleId))
    .where(where);

  res.json({
    data: rows.map(mapPolicy),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const getPolicy = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid policy id');

  const [row] = await policyQuery()
    .where(and(eq(policies.tenantId, tid), eq(policies.id, id)))
    .limit(1);

  if (!row) throw ApiError.notFound('Policy not found');
  res.json({ data: mapPolicy(row) });
};

export const createPolicy = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const vehicle = asObject(body.vehicle);

  const customerId = await resolveCustomer(tid, body);
  const companyId = await resolveCompany(tid, body);
  const productId = await resolveProduct(tid, {
    productId: body.productId,
    productName: body.productName,
    productType: body.productType,
    companyId,
  });
  const agentId = await resolveAgent(tid, body.agentId);
  const vehicleId = await resolveVehicle(tid, customerId, {
    vehicleId: body.vehicleId,
    vehiclePlate: body.vehiclePlate ?? vehicle.plateNumber,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    engineNumber: vehicle.engineNumber,
    chassisNumber: vehicle.chassisNumber,
    engineCapacity: vehicle.engineCapacity,
    color: vehicle.color,
    usageType: vehicle.usageType,
  });

  const startDate = requireString(body.startDate, 'startDate', { max: 10 });
  const endDate = requireString(body.endDate, 'endDate', { max: 10 });
  const netPremium = Number(body.netPremium ?? 0);
  const vatAmount = Number(body.vatAmount ?? 0);
  const registrationFee = Number(body.registrationFee ?? 0);
  const totalPremium = Number(body.totalPremium ?? 0);
  const status = optionalString(body.status, 'status', { max: 20 }) || 'pending';

  if (!['pending', 'active', 'expired', 'cancelled'].includes(status)) {
    throw ApiError.badRequest('Invalid policy status');
  }

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(policies)
    .where(eq(policies.tenantId, tid));
  const year = new Date().getFullYear();
  const policyNumber =
    optionalString(body.policyNumber, 'policyNumber', { max: 100 }) ||
    `P-${year}-${String(toNumber(countRow?.total) + 1).padStart(6, '0')}`;

  const [result] = await db.insert(policies).values({
    tenantId: tid,
    policyNumber,
    customerId,
    agentId,
    vehicleId,
    insuranceCompanyId: companyId,
    productId,
    startDate,
    endDate,
    netPremium: String(netPremium),
    vatAmount: String(vatAmount),
    registrationFee: String(registrationFee),
    totalPremium: String(totalPremium),
    status,
  });

  if (agentId) {
    const [agent] = await db
      .select({ commissionRate: agents.commissionRate })
      .from(agents)
      .where(and(eq(agents.tenantId, tid), eq(agents.id, agentId)))
      .limit(1);
    const rate = toNumber(agent?.commissionRate);
    await db.insert(commissions).values({
      tenantId: tid,
      agentId,
      policyId: result.insertId,
      rate: String(rate),
      amount: String(Math.round((netPremium * rate) / 100)),
      status: 'pending',
    });
  }

  const [row] = await policyQuery()
    .where(and(eq(policies.tenantId, tid), eq(policies.id, result.insertId)))
    .limit(1);

  res.status(201).json({ data: row ? mapPolicy(row) : { id: result.insertId, policyNumber } });
};

export const updatePolicyStatus = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid policy id');
  const body = asObject(req.body);
  const status = requireString(body.status, 'status', { max: 20 });
  if (!['pending', 'active', 'expired', 'cancelled'].includes(status)) {
    throw ApiError.badRequest('Invalid policy status');
  }

  await db
    .update(policies)
    .set({ status })
    .where(and(eq(policies.tenantId, tid), eq(policies.id, id)));

  const [row] = await policyQuery()
    .where(and(eq(policies.tenantId, tid), eq(policies.id, id)))
    .limit(1);
  if (!row) throw ApiError.notFound('Policy not found');
  res.json({ data: mapPolicy(row) });
};

const quotationFields = {
  id: quotations.id,
  reference: quotations.reference,
  customerId: quotations.customerId,
  customerName: sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`,
  customerPhone: customers.phone,
  productId: quotations.productId,
  productType: products.type,
  productName: products.name,
  premium: quotations.premium,
  validUntil: quotations.validUntil,
  status: quotations.status,
  notes: quotations.notes,
  createdAt: quotations.createdAt,
};

const quotationQuery = () =>
  db
    .select(quotationFields)
    .from(quotations)
    .leftJoin(customers, eq(customers.id, quotations.customerId))
    .leftJoin(products, eq(products.id, quotations.productId));

const mapQuotation = (row: { premium: unknown; notes: unknown; [key: string]: unknown }) => {
  let options = null;
  let vehicle = null;
  let rawNotes = typeof row.notes === 'string' ? row.notes : '';
  if (rawNotes.startsWith('{') && rawNotes.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawNotes);
      if (parsed.__brokerQuote) {
        options = parsed.options || null;
        vehicle = parsed.vehicle || null;
        rawNotes = parsed.note || '';
      }
    } catch {
      // ignore
    }
  }

  return {
    ...row,
    premium: toNumber(row.premium),
    notes: rawNotes,
    options,
    vehicle,
  };
};

export const listQuotations = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const productType = typeof req.query.productType === 'string' ? req.query.productType : '';

  const conditions = [eq(quotations.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(quotations.reference, term),
        like(customers.firstName, term),
        like(customers.lastName, term),
        like(products.name, term),
      )!,
    );
  }
  if (status) conditions.push(eq(quotations.status, status));
  if (productType) conditions.push(eq(products.type, productType));

  const where = and(...conditions);
  const rows = await quotationQuery()
    .where(where)
    .orderBy(desc(quotations.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(distinct ${quotations.id})` })
    .from(quotations)
    .leftJoin(customers, eq(customers.id, quotations.customerId))
    .leftJoin(products, eq(products.id, quotations.productId))
    .where(where);

  res.json({
    data: rows.map(mapQuotation),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const getQuotation = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid quotation id');
  const [row] = await quotationQuery()
    .where(and(eq(quotations.tenantId, tid), eq(quotations.id, id)))
    .limit(1);
  if (!row) throw ApiError.notFound('Quotation not found');
  res.json({ data: mapQuotation(row) });
};

export const createQuotation = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const customerId = await resolveCustomer(tid, body);
  const productId = await resolveProduct(tid, {
    productId: body.productId,
    productName: body.productName || body.productType,
    productType: body.productType,
    companyId: null,
  });

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(quotations)
    .where(eq(quotations.tenantId, tid));
  const year = String(new Date().getFullYear()).slice(-2);
  const reference =
    optionalString(body.reference, 'reference', { max: 50 }) ||
    sequenceNumber(`QT-${year}`, toNumber(countRow?.total), 3);

  let notes = optionalString(body.notes ?? body.note, 'notes', { max: 2000 }) || '';
  if (Array.isArray(body.options) || body.vehicle) {
    notes = JSON.stringify({
      __brokerQuote: true,
      note: notes,
      options: body.options || [],
      vehicle: body.vehicle || null,
    });
  }

  const [result] = await db.insert(quotations).values({
    tenantId: tid,
    reference,
    customerId,
    productId,
    premium: String(Number(body.premium) || 0),
    validUntil: optionalString(body.validUntil, 'validUntil', { max: 10 }),
    status: optionalString(body.status, 'status', { max: 20 }) || 'draft',
    notes,
  });

  const [row] = await quotationQuery()
    .where(and(eq(quotations.tenantId, tid), eq(quotations.id, result.insertId)))
    .limit(1);

  res.status(201).json({ data: row ? mapQuotation(row) : { id: result.insertId, reference } });
};

export const updateQuotationStatus = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid quotation id');
  const body = asObject(req.body);
  const status = requireString(body.status, 'status', { max: 20 });
  if (!['draft', 'sent', 'accepted', 'expired'].includes(status)) {
    throw ApiError.badRequest('Invalid quotation status');
  }
  await db
    .update(quotations)
    .set({ status })
    .where(and(eq(quotations.tenantId, tid), eq(quotations.id, id)));

  const [row] = await quotationQuery()
    .where(and(eq(quotations.tenantId, tid), eq(quotations.id, id)))
    .limit(1);
  if (!row) throw ApiError.notFound('Quotation not found');
  res.json({ data: mapQuotation(row) });
};

export const policyStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`coalesce(sum(case when ${policies.status} = 'active' then 1 else 0 end), 0)`,
      expiring: sql<number>`coalesce(sum(case when ${policies.status} = 'active' and ${policies.endDate} between curdate() and date_add(curdate(), interval 30 day) then 1 else 0 end), 0)`,
      premium: sql<number>`coalesce(sum(${policies.totalPremium}), 0)`,
    })
    .from(policies)
    .where(eq(policies.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      active: toNumber(row?.active),
      expiring: toNumber(row?.expiring),
      premium: toNumber(row?.premium),
    },
  });
};

export const quotationStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      sent: sql<number>`coalesce(sum(case when ${quotations.status} = 'sent' then 1 else 0 end), 0)`,
      accepted: sql<number>`coalesce(sum(case when ${quotations.status} = 'accepted' then 1 else 0 end), 0)`,
    })
    .from(quotations)
    .where(eq(quotations.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      sent: toNumber(row?.sent),
      accepted: toNumber(row?.accepted),
    },
  });
};
