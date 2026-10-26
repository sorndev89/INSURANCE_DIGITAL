import { and, eq, like, or, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { agents, customers, users } from '../db/schema.js';

export type NewTenantUser = {
  username: string;
  email: string;
  password: string;
  role?: string;
  phone?: string | null;
  status?: string;
};

export const findUserByEmail = (tenantId: number, email: string) =>
  db.query.users.findFirst({
    where: and(eq(users.tenantId, tenantId), eq(users.email, email)),
  });

export const findUserById = (tenantId: number, id: number) =>
  db.query.users.findFirst({
    where: and(eq(users.tenantId, tenantId), eq(users.id, id)),
  });

export const listUsers = async (
  tenantId: number,
  options: { search?: string; page: number; pageSize: number; role?: string; status?: string },
) => {
  const search = options.search?.trim();
  const conditions = [eq(users.tenantId, tenantId)];
  if (search) {
    conditions.push(
      or(like(users.username, `%${search}%`), like(users.email, `%${search}%`))!,
    );
  }
  if (options.role) conditions.push(eq(users.role, options.role));
  if (options.status) conditions.push(eq(users.status, options.status));
  const where = and(...conditions);

  const items = await db
    .select({
      id: users.id,
      name: users.username,
      username: users.username,
      email: users.email,
      role: users.role,
      phone: users.phone,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(options.pageSize)
    .offset((options.page - 1) * options.pageSize);

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(where);

  return { items, total: Number(totalRow?.total ?? 0) };
};

export const createUser = async (tenantId: number, data: NewTenantUser) => {
  const [result] = await db.insert(users).values({
    tenantId,
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role ?? 'customer',
    phone: data.phone ?? null,
    status: data.status ?? 'active',
  });
  return result.insertId;
};

export const updateUser = async (
  tenantId: number,
  id: number,
  data: { username?: string; role?: string; status?: string; phone?: string | null },
) => {
  await db
    .update(users)
    .set(data)
    .where(and(eq(users.tenantId, tenantId), eq(users.id, id)));
};

export const removeUser = async (tenantId: number, id: number) => {
  await db.transaction(async (tx) => {
    await tx
      .update(customers)
      .set({ userId: null })
      .where(and(eq(customers.tenantId, tenantId), eq(customers.userId, id)));
    await tx
      .update(agents)
      .set({ userId: null })
      .where(and(eq(agents.tenantId, tenantId), eq(agents.userId, id)));
    await tx.delete(users).where(and(eq(users.tenantId, tenantId), eq(users.id, id)));
  });
};

export const userStats = async (tenantId: number) => {
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      admins: sql<number>`coalesce(sum(case when ${users.role} = 'admin' then 1 else 0 end), 0)`,
      agents: sql<number>`coalesce(sum(case when ${users.role} = 'agent' then 1 else 0 end), 0)`,
      customers: sql<number>`coalesce(sum(case when ${users.role} = 'customer' then 1 else 0 end), 0)`,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId));
  return {
    total: Number(row?.total ?? 0),
    admins: Number(row?.admins ?? 0),
    agents: Number(row?.agents ?? 0),
    customers: Number(row?.customers ?? 0),
  };
};

export const countUsers = async (tenantId: number) => {
  const [row] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.tenantId, tenantId));
  return Number(row?.total ?? 0);
};
