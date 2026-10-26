import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  agents,
  commissionRates,
  customers,
  insuranceCompanies,
  plans,
  platformUsers,
  policies,
  products,
  subscriptions,
  tenantDomains,
  tenants,
  users,
  vehicles,
  type PlanLimits,
  type TenantSettings,
} from '../db/schema.js';
import { env } from '../config/env.js';
import { invalidateTenantCache } from '../services/tenantCache.js';
import { comparePassword, hashPassword } from '../utils/auth.js';

type PlanSeed = {
  code: string;
  name: string;
  description: string;
  price: string;
  limits: PlanLimits;
  features: string[];
};

export const PLAN_SEEDS: PlanSeed[] = [
  {
    code: 'starter',
    name: 'Starter',
    description: 'ສຳລັບທີມນ້ອຍ ເລີ່ມຕົ້ນຂາຍປະກັນໄພ',
    price: '0.00',
    limits: { maxUsers: 5, maxPolicies: 500, storageMb: 1024 },
    features: ['policies', 'customers', 'reports'],
  },
  {
    code: 'pro',
    name: 'Professional',
    description: 'ສຳລັບຕົວແທນ/ບໍລິສັດຂະໜາດກາງ',
    price: '0.00',
    limits: { maxUsers: 25, maxPolicies: 10000, storageMb: 10240 },
    features: ['policies', 'quotations', 'claims', 'commissions', 'finance', 'reports', 'teams'],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    description: 'ບໍລິສັດໃຫຍ່ ຕ້ອງການກຳນົດເອງ',
    price: '0.00',
    limits: { maxUsers: 0, maxPolicies: 0, storageMb: 0 },
    features: ['*'],
  },
];

export const ensurePlans = async () => {
  const planIds = new Map<string, number>();

  for (const plan of PLAN_SEEDS) {
    const [existing] = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.code, plan.code))
      .limit(1);

    if (existing) {
      planIds.set(plan.code, existing.id);
      continue;
    }

    const [result] = await db
      .insert(plans)
      .values({ ...plan, currency: 'LAK', active: true });
    planIds.set(plan.code, result.insertId);
    console.log(`[seed] created plan ${plan.code}`);
  }

  return planIds;
};

export const seedPlatformAdmin = async () => {
  const email = env.platformAdminEmail;
  const password = env.platformAdminPassword;

  if (!password) {
    throw new Error(
      'PLATFORM_ADMIN_PASSWORD is required to seed the platform admin (min 8 characters)',
    );
  }
  if (password.length < 8) {
    throw new Error('PLATFORM_ADMIN_PASSWORD must be at least 8 characters');
  }

  const username = env.platformAdminUsername.trim().toLowerCase();
  const [existing] = await db
    .select({
      id: platformUsers.id,
      username: platformUsers.username,
      role: platformUsers.role,
      status: platformUsers.status,
    })
    .from(platformUsers)
    .where(eq(platformUsers.email, email))
    .limit(1);

  if (existing) {
    if (
      existing.username !== username ||
      existing.role !== 'superadmin' ||
      existing.status !== 'active'
    ) {
      await db
        .update(platformUsers)
        .set({ username, role: 'superadmin', status: 'active' })
        .where(eq(platformUsers.id, existing.id));
    }
    console.log(`[seed] platform admin already exists: ${email} (username=${username})`);
    return;
  }

  await db.insert(platformUsers).values({
    name: 'Platform Admin',
    username,
    email,
    password: await hashPassword(password),
    role: 'superadmin',
    status: 'active',
  });
  console.log(`[seed] created platform admin: ${email}`);
};

export const seedPlatformSuperadmin = async () => {
  const username = 'superadmin';
  const email = 'superadmin@saiyfon.com';
  const password = 'sa123456';

  const [existing] = await db
    .select({
      id: platformUsers.id,
      username: platformUsers.username,
      email: platformUsers.email,
      password: platformUsers.password,
      role: platformUsers.role,
      status: platformUsers.status,
    })
    .from(platformUsers)
    .where(or(eq(platformUsers.username, username), eq(platformUsers.email, email)))
    .limit(1);

  if (existing) {
    const passwordMatches = await comparePassword(password, existing.password);
    if (
      existing.username !== username ||
      existing.email !== email ||
      existing.role !== 'superadmin' ||
      existing.status !== 'active' ||
      !passwordMatches
    ) {
      await db
        .update(platformUsers)
        .set({
          username,
          email,
          role: 'superadmin',
          status: 'active',
          ...(passwordMatches ? {} : { password: await hashPassword(password) }),
        })
        .where(eq(platformUsers.id, existing.id));
    }
    console.log(`[seed] platform superadmin already exists: ${username}`);
    return;
  }

  await db.insert(platformUsers).values({
    name: 'Super Admin',
    username,
    email,
    password: await hashPassword(password),
    role: 'superadmin',
    status: 'active',
  });
  console.log(`[seed] created platform superadmin: ${username}`);
};

const DEFAULT_PLAN_CODE = process.env.DEFAULT_TENANT_PLAN || 'pro';

const buildSettings = (): TenantSettings => ({
  brand: { name: env.defaultTenantName, primaryColor: '#10b981' },
  locale: 'lo',
  currency: 'LAK',
  timezone: 'Asia/Vientiane',
  features: ['policies', 'quotations', 'claims', 'commissions', 'finance', 'reports'],
});

const ensurePrimaryDomain = async (tenantId: number, slug: string) => {
  const hostname = `${slug}.${env.rootDomain}`;
  const [domain] = await db
    .select()
    .from(tenantDomains)
    .where(eq(tenantDomains.hostname, hostname))
    .limit(1);

  if (!domain) {
    await db.insert(tenantDomains).values({
      tenantId,
      hostname,
      type: 'primary',
      isPrimary: true,
      verifiedAt: new Date(),
      sslStatus: 'active',
    });
    console.log(`[seed] created primary domain ${hostname}`);
    return;
  }

  if (domain.tenantId !== tenantId) {
    throw new Error(`Primary domain "${hostname}" belongs to another tenant`);
  }

  await db
    .update(tenantDomains)
    .set({
      type: 'primary',
      isPrimary: true,
      verifiedAt: domain.verifiedAt ?? new Date(),
      sslStatus: 'active',
    })
    .where(eq(tenantDomains.id, domain.id));
};

const ensureSubscription = async (tenantId: number, planId: number | null) => {
  if (!planId) return;

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({ planId, status: 'active' })
      .where(eq(subscriptions.id, existing.id));
    return;
  }

  await db.insert(subscriptions).values({ tenantId, planId, status: 'active' });
};

const ensureDefaultTenant = async () => {
  const slug = env.defaultTenantSlug;
  const planIds = await ensurePlans();
  const planId =
    planIds.get(DEFAULT_PLAN_CODE) ??
    planIds.get('pro') ??
    planIds.values().next().value ??
    null;

  const settings = buildSettings();
  const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);

  let tenantId: number;
  if (existing) {
    tenantId = existing.id;
    await db
      .update(tenants)
      .set({
        name: env.defaultTenantName,
        status: 'active',
        planId: planId ?? existing.planId,
        deletedAt: null,
        settings: {
          ...(existing.settings ?? {}),
          ...settings,
          brand: { ...(existing.settings?.brand ?? {}), ...settings.brand },
        },
      })
      .where(eq(tenants.id, tenantId));
    console.log(`[seed] tenant already exists: ${slug} (id=${tenantId})`);
  } else {
    const [result] = await db.insert(tenants).values({
      slug,
      name: env.defaultTenantName,
      status: 'active',
      planId,
      settings,
    });
    tenantId = result.insertId;
    console.log(`[seed] created default tenant ${slug} (id=${tenantId})`);
  }

  await ensurePrimaryDomain(tenantId, slug);
  await ensureSubscription(tenantId, planId);

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  return tenant;
};

const seedTenantAdmin = async (tenantId: number) => {
  const email = env.defaultTenantAdminEmail;
  const password = env.defaultTenantAdminPassword;
  if (!password) {
    console.log('[seed] skipped tenant admin (DEFAULT_TENANT_ADMIN_PASSWORD not set)');
    return;
  }

  const [existing] = await db
    .select({ id: users.id, role: users.role, status: users.status })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.email, email)))
    .limit(1);

  if (existing) {
    if (existing.role !== 'admin' || existing.status !== 'active') {
      await db
        .update(users)
        .set({ role: 'admin', status: 'active' })
        .where(eq(users.id, existing.id));
    }
    console.log(`[seed] tenant admin already exists: ${email}`);
    return;
  }

  await db.insert(users).values({
    tenantId,
    username: 'admin',
    email,
    password: await hashPassword(password),
    role: 'admin',
    status: 'active',
  });
  console.log(`[seed] created tenant admin: ${email}`);
};

const seedDemoUsers = async (tenantId: number) => {
  if (env.isProduction) {
    console.log('[seed] skipped demo users in production');
    return;
  }

  const password = env.defaultTenantAdminPassword || 'Demo@1234';
  const demo = [
    { username: 'staff', email: 'staff@saiyfon.com', role: 'staff', phone: '020 7777 8888' },
    { username: 'agent', email: 'agent@saiyfon.com', role: 'agent', phone: '020 2222 3333' },
    {
      username: 'customer',
      email: 'customer@saiyfon.com',
      role: 'customer',
      phone: '020 9999 0000',
    },
  ];

  for (const user of demo) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.email, user.email)))
      .limit(1);
    if (existing) continue;

    await db.insert(users).values({
      tenantId,
      username: user.username,
      email: user.email,
      password: await hashPassword(password),
      role: user.role,
      phone: user.phone,
      status: 'active',
    });
    console.log(`[seed] created demo user: ${user.email}`);
  }
};

const backfill = async (name: string, run: () => Promise<unknown>) => {
  const result = await run();
  const affected = Array.isArray(result)
    ? ((result[0] as { affectedRows?: number })?.affectedRows ?? 0)
    : 0;
  if (affected) console.log(`[backfill] ${name}: ${affected} rows`);
};

const backfillTenantIds = async (tenantId: number) => {
  await backfill('users', () => db.update(users).set({ tenantId }).where(isNull(users.tenantId)));
  await backfill('customers', () =>
    db.update(customers).set({ tenantId }).where(isNull(customers.tenantId)),
  );
  await backfill('agents', () => db.update(agents).set({ tenantId }).where(isNull(agents.tenantId)));
  await backfill('insurance_companies', () =>
    db
      .update(insuranceCompanies)
      .set({ tenantId })
      .where(isNull(insuranceCompanies.tenantId)),
  );
  await backfill('products', () =>
    db.update(products).set({ tenantId }).where(isNull(products.tenantId)),
  );
  await backfill('vehicles', () =>
    db.update(vehicles).set({ tenantId }).where(isNull(vehicles.tenantId)),
  );
  await backfill('policies', () =>
    db.update(policies).set({ tenantId }).where(isNull(policies.tenantId)),
  );
  await backfill('commission_rates', () =>
    db.update(commissionRates).set({ tenantId }).where(isNull(commissionRates.tenantId)),
  );

  const [remaining] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(isNull(users.tenantId));

  console.log(`[backfill] users without tenant: ${Number(remaining?.total ?? 0)}`);
};

export const seedDefaultTenant = async () => {
  const tenant = await ensureDefaultTenant();
  if (!tenant) throw new Error('Unable to create or load the default tenant');

  await seedTenantAdmin(tenant.id);
  await seedDemoUsers(tenant.id);
  await backfillTenantIds(tenant.id);
  await invalidateTenantCache();

  console.log(`[seed] tenant ready: ${tenant.slug}`);
  return tenant;
};
