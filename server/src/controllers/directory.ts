import type { Request, Response } from 'express';
import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { agents, customers, insuranceCompanies, policies, products, teams, users } from '../db/schema.js';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireEmail, requirePassword, requireString } from '../utils/validate.js';
import { likeValue, parseListQuery, sequenceNumber, toNumber } from '../utils/list.js';
import { hashPassword } from '../utils/auth.js';
import { createUser, findUserByEmail } from '../repositories/users.js';

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

const customerRow = (row: typeof customers.$inferSelect, policiesCount: number) => ({
  id: row.id,
  code: row.code,
  firstName: row.firstName,
  lastName: row.lastName,
  fullName: `${row.firstName} ${row.lastName}`.trim(),
  gender: row.gender,
  dob: row.dob,
  phone: row.phone,
  email: row.email,
  address: row.address,
  idCardNumber: row.idCardNumber,
  idCardImage: row.idCardImage,
  passportNumber: row.passportNumber,
  occupation: row.occupation,
  status: row.status,
  policiesCount,
  createdAt: row.createdAt,
});

const policyCountSql = sql<number>`(
  select count(*) from ${policies}
  where ${policies.customerId} = ${customers.id}
    and ${policies.tenantId} = ${customers.tenantId}
)`;

export const listCustomers = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const conditions = [eq(customers.tenantId, tid)];

  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(customers.firstName, term),
        like(customers.lastName, term),
        like(customers.code, term),
        like(customers.phone, term),
        like(customers.email, term),
      )!,
    );
  }
  if (status) conditions.push(eq(customers.status, status));

  const where = and(...conditions);
  const order =
    query.sortField === 'fullName'
      ? query.sortOrder === 'asc'
        ? asc(customers.firstName)
        : desc(customers.firstName)
      : query.sortOrder === 'asc'
        ? asc(customers.createdAt)
        : desc(customers.createdAt);

  const rows = await db
    .select({ customer: customers, policiesCount: policyCountSql })
    .from(customers)
    .where(where)
    .orderBy(order)
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(where);

  res.json({
    data: rows.map((row) => customerRow(row.customer, toNumber(row.policiesCount))),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const getCustomer = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid customer id');

  const [row] = await db
    .select({ customer: customers, policiesCount: policyCountSql })
    .from(customers)
    .where(and(eq(customers.tenantId, tid), eq(customers.id, id)))
    .limit(1);

  if (!row) throw ApiError.notFound('Customer not found');
  res.json({ data: customerRow(row.customer, toNumber(row.policiesCount)) });
};

export const createCustomer = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const firstName = requireString(body.firstName, 'firstName', { max: 255 });
  const lastName = requireString(body.lastName, 'lastName', { max: 255 });

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, tid));

  const code =
    optionalString(body.code, 'code', { max: 30 }) ||
    sequenceNumber('CUS-', toNumber(countRow?.total), 5);

  const [result] = await db.insert(customers).values({
    tenantId: tid,
    code,
    firstName,
    lastName,
    gender: optionalString(body.gender, 'gender', { max: 10 }),
    dob: optionalString(body.dob, 'dob', { max: 10 }),
    phone: optionalString(body.phone, 'phone', { max: 20 }),
    email: optionalString(body.email, 'email', { max: 255 }),
    address: optionalString(body.address, 'address', { max: 2000 }),
    idCardNumber: optionalString(body.idCardNumber, 'idCardNumber', { max: 50 }),
    passportNumber: optionalString(body.passportNumber, 'passportNumber', { max: 50 }),
    occupation: optionalString(body.occupation, 'occupation', { max: 255 }),
    status: optionalString(body.status, 'status', { max: 20 }) || 'active',
  });

  const [row] = await db
    .select({ customer: customers, policiesCount: policyCountSql })
    .from(customers)
    .where(and(eq(customers.tenantId, tid), eq(customers.id, result.insertId)))
    .limit(1);

  res.status(201).json({ data: row ? customerRow(row.customer, toNumber(row.policiesCount)) : { id: result.insertId } });
};

export const updateCustomer = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid customer id');
  const body = asObject(req.body);

  const patch: Record<string, unknown> = {};
  const textFields = [
    'firstName',
    'lastName',
    'gender',
    'dob',
    'phone',
    'email',
    'address',
    'idCardNumber',
    'passportNumber',
    'occupation',
    'status',
  ] as const;

  for (const field of textFields) {
    if (body[field] !== undefined) {
      patch[field] = optionalString(body[field], field, { max: field === 'address' ? 2000 : 255 });
    }
  }
  if (body.firstName !== undefined) patch.firstName = requireString(body.firstName, 'firstName', { max: 255 });
  if (body.lastName !== undefined) patch.lastName = requireString(body.lastName, 'lastName', { max: 255 });

  if (!Object.keys(patch).length) throw ApiError.badRequest('No supported fields to update');

  await db.update(customers).set(patch).where(and(eq(customers.tenantId, tid), eq(customers.id, id)));

  const [row] = await db
    .select({ customer: customers, policiesCount: policyCountSql })
    .from(customers)
    .where(and(eq(customers.tenantId, tid), eq(customers.id, id)))
    .limit(1);

  if (!row) throw ApiError.notFound('Customer not found');
  res.json({ data: customerRow(row.customer, toNumber(row.policiesCount)) });
};

const salesYtdSql = sql<number>`coalesce((
  select sum(${policies.totalPremium}) from ${policies}
  where ${policies.agentId} = ${agents.id}
    and ${policies.tenantId} = ${agents.tenantId}
), 0)`;

export const listAgents = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const teamId = req.query.teamId ? Number(req.query.teamId) : null;

  const conditions = [eq(agents.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(
      or(
        like(agents.agentCode, term),
        like(users.username, term),
        like(users.email, term),
        like(agents.level, term),
        like(teams.name, term),
      )!,
    );
  }
  if (status) conditions.push(eq(agents.status, status));
  if (teamId && Number.isInteger(teamId)) conditions.push(eq(agents.teamId, teamId));

  const where = and(...conditions);
  const rows = await db
    .select({
      id: agents.id,
      userId: agents.userId,
      code: agents.agentCode,
      name: users.username,
      email: users.email,
      phone: users.phone,
      teamId: agents.teamId,
      teamName: teams.name,
      level: agents.level,
      commissionRate: agents.commissionRate,
      salesTarget: agents.salesTarget,
      creditLimit: agents.creditLimit,
      salesYtd: salesYtdSql,
      status: agents.status,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(where)
    .orderBy(desc(agents.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(where);

  res.json({
    data: rows.map((row) => ({
      ...row,
      commissionRate: toNumber(row.commissionRate),
      salesTarget: toNumber(row.salesTarget),
      creditLimit: toNumber(row.creditLimit),
      salesYtd: toNumber(row.salesYtd),
    })),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const createAgent = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const email = requireEmail(body.email);
  const password = requirePassword(body.password);
  const username = requireString(body.username ?? body.name, 'username', { max: 255 });
  const phone = optionalString(body.phone, 'phone', { max: 20 });
  const level = optionalString(body.level, 'level', { max: 30 }) || 'Senior';
  const teamId = body.teamId === undefined || body.teamId === null || body.teamId === ''
    ? null
    : Number(body.teamId);
  const commissionRate = Math.min(100, Math.max(0, Number(body.commissionRate) || 0));

  if (teamId !== null && !Number.isInteger(teamId)) {
    throw ApiError.badRequest('Invalid teamId');
  }

  const existing = await findUserByEmail(tid, email);
  if (existing) throw ApiError.conflict('Email is already registered for this tenant');

  const userId = await createUser(tid, {
    username,
    email,
    password: await hashPassword(password),
    role: 'agent',
    phone,
  });

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(agents)
    .where(eq(agents.tenantId, tid));
  const agentCode = sequenceNumber('AG-', toNumber(countRow?.total), 4);

  const [result] = await db.insert(agents).values({
    tenantId: tid,
    userId,
    teamId,
    agentCode,
    level,
    commissionRate: String(commissionRate),
    status: 'active',
  });

  const [row] = await db
    .select({
      id: agents.id,
      userId: agents.userId,
      code: agents.agentCode,
      name: users.username,
      email: users.email,
      phone: users.phone,
      teamId: agents.teamId,
      teamName: teams.name,
      level: agents.level,
      commissionRate: agents.commissionRate,
      salesTarget: agents.salesTarget,
      creditLimit: agents.creditLimit,
      salesYtd: salesYtdSql,
      status: agents.status,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(and(eq(agents.tenantId, tid), eq(agents.id, result.insertId)))
    .limit(1);

  res.status(201).json({
    data: row
      ? {
          ...row,
          commissionRate: toNumber(row.commissionRate),
          salesTarget: toNumber(row.salesTarget),
          creditLimit: toNumber(row.creditLimit),
          salesYtd: toNumber(row.salesYtd),
        }
      : { id: result.insertId, code: agentCode },
  });
};

export const getAgent = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid agent id');

  const [row] = await db
    .select({
      id: agents.id,
      userId: agents.userId,
      code: agents.agentCode,
      name: users.username,
      email: users.email,
      phone: users.phone,
      teamId: agents.teamId,
      teamName: teams.name,
      level: agents.level,
      commissionRate: agents.commissionRate,
      salesTarget: agents.salesTarget,
      creditLimit: agents.creditLimit,
      salesYtd: salesYtdSql,
      status: agents.status,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .leftJoin(users, eq(users.id, agents.userId))
    .leftJoin(teams, eq(teams.id, agents.teamId))
    .where(and(eq(agents.tenantId, tid), eq(agents.id, id)))
    .limit(1);

  if (!row) throw ApiError.notFound('Agent not found');
  res.json({
    data: {
      ...row,
      commissionRate: toNumber(row.commissionRate),
      salesTarget: toNumber(row.salesTarget),
      creditLimit: toNumber(row.creditLimit),
      salesYtd: toNumber(row.salesYtd),
    },
  });
};

export const listTeams = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const conditions = [eq(teams.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(or(like(teams.name, term), like(teams.location, term), like(teams.headName, term))!);
  }

  const where = and(...conditions);
  const rows = await db
    .select()
    .from(teams)
    .where(where)
    .orderBy(desc(teams.createdAt))
    .limit(query.pageSize)
    .offset(query.offset);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(teams)
    .where(where);

  res.json({
    data: rows.map((row) => ({
      ...row,
      members: toNumber(row.members),
      monthlySales: toNumber(row.monthlySales),
    })),
    meta: { total: toNumber(totalRow?.total), page: query.page, pageSize: query.pageSize },
  });
};

export const createTeam = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const name = requireString(body.name, 'name', { max: 255 });

  const [result] = await db.insert(teams).values({
    tenantId: tid,
    name,
    location: optionalString(body.location, 'location', { max: 255 }),
    headName: optionalString(body.headName, 'headName', { max: 255 }),
    members: Number(body.members) || 0,
    monthlySales: String(Number(body.monthlySales) || 0),
    status: optionalString(body.status, 'status', { max: 20 }) || 'active',
  });

  const [row] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.tenantId, tid), eq(teams.id, result.insertId)))
    .limit(1);

  res.status(201).json({
    data: row ? { ...row, members: toNumber(row.members), monthlySales: toNumber(row.monthlySales) } : { id: result.insertId },
  });
};

export const listCompanies = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const conditions = [eq(insuranceCompanies.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(or(like(insuranceCompanies.name, term), like(insuranceCompanies.code, term))!);
  }

  const rows = await db
    .select()
    .from(insuranceCompanies)
    .where(and(...conditions))
    .orderBy(asc(insuranceCompanies.name))
    .limit(query.pageSize)
    .offset(query.offset);

  res.json({
    data: rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      address: row.address,
      contactPerson: row.contactPerson,
      contactPhone: row.contactPhone,
      logo: row.logoPath,
    })),
    meta: { total: rows.length, page: query.page, pageSize: query.pageSize },
  });
};

export const listProducts = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const query = parseListQuery(req);
  const conditions = [eq(products.tenantId, tid)];
  if (query.search) {
    const term = likeValue(query.search);
    conditions.push(or(like(products.name, term), like(products.type, term))!);
  }
  const type = typeof req.query.type === 'string' ? req.query.type : '';
  if (type) conditions.push(eq(products.type, type));

  const rows = await db
    .select({
      id: products.id,
      companyId: products.insuranceCompanyId,
      companyName: insuranceCompanies.name,
      companyCode: insuranceCompanies.code,
      name: products.name,
      type: products.type,
      description: products.description,
    })
    .from(products)
    .leftJoin(insuranceCompanies, eq(insuranceCompanies.id, products.insuranceCompanyId))
    .where(and(...conditions))
    .orderBy(asc(products.name));

  res.json({ data: rows, meta: { total: rows.length, page: query.page, pageSize: query.pageSize } });
};

export const customerStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`coalesce(sum(case when ${customers.status} = 'active' then 1 else 0 end), 0)`,
      policies: sql<number>`(select count(*) from ${policies} where ${policies.tenantId} = ${tid})`,
    })
    .from(customers)
    .where(eq(customers.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      active: toNumber(row?.active),
      policies: toNumber(row?.policies),
    },
  });
};

export const agentStats = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      commission: sql<number>`coalesce(avg(${agents.commissionRate}), 0)`,
    })
    .from(agents)
    .where(eq(agents.tenantId, tid));
  const [salesRow] = await db
    .select({ total: sql<number>`coalesce(sum(${policies.totalPremium}), 0)` })
    .from(policies)
    .where(eq(policies.tenantId, tid));

  res.json({
    data: {
      total: toNumber(row?.total),
      sales: toNumber(salesRow?.total),
      commission: Math.round(toNumber(row?.commission) * 10) / 10,
    },
  });
};
