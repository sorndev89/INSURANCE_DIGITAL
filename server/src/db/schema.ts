import {
  boolean,
  date,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export type TenantBrand = {
  name?: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
};

export type CurrencyDisplay = {
  symbol: 'kip' | 'lak';
  position: 'prefix' | 'suffix';
};

export type TenantSettings = {
  brand?: TenantBrand;
  locale?: string;
  currency?: string;
  currencyDisplay?: CurrencyDisplay | null;
  timezone?: string;
  features?: string[];
  rolePermissions?: Record<string, string[]> | null;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
};

export type PlanLimits = {
  maxUsers?: number;
  maxPolicies?: number;
  storageMb?: number;
};

/* ------------------------------------------------------------------ */
/* Control plane                                                       */
/* ------------------------------------------------------------------ */

export const plans = mysqlTable('plans', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 15, scale: 2 }).notNull().default('0.00'),
  currency: varchar('currency', { length: 10 }).notNull().default('LAK'),
  limits: json('limits').$type<PlanLimits>(),
  features: json('features').$type<string[]>(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tenants = mysqlTable(
  'tenants',
  {
    id: int('id').autoincrement().primaryKey(),
    slug: varchar('slug', { length: 63 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['active', 'trial', 'suspended']).notNull().default('trial'),
    planId: int('plan_id').references(() => plans.id),
    settings: json('settings').$type<TenantSettings>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [index('tenants_status_idx').on(table.status)],
);

export const tenantDomains = mysqlTable(
  'tenant_domains',
  {
    id: int('id').autoincrement().primaryKey(),
    tenantId: int('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    hostname: varchar('hostname', { length: 255 }).notNull().unique(),
    type: mysqlEnum('type', ['primary', 'custom']).notNull().default('custom'),
    verificationToken: varchar('verification_token', { length: 64 }),
    verifiedAt: timestamp('verified_at'),
    sslStatus: varchar('ssl_status', { length: 20 }).notNull().default('pending'),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('tenant_domains_tenant_idx').on(table.tenantId),
    index('tenant_domains_hostname_idx').on(table.hostname),
  ],
);

export const subscriptions = mysqlTable(
  'subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    tenantId: int('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    planId: int('plan_id')
      .notNull()
      .references(() => plans.id),
    status: mysqlEnum('status', ['trialing', 'active', 'past_due', 'cancelled'])
      .notNull()
      .default('trialing'),
    startedAt: timestamp('started_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('subscriptions_tenant_idx').on(table.tenantId)],
);

export const platformUsers = mysqlTable('platform_users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 100 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['superadmin', 'support']).notNull().default('support'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformAuditLogs = mysqlTable(
  'platform_audit_logs',
  {
    id: int('id').autoincrement().primaryKey(),
    actorId: int('actor_id').references(() => platformUsers.id),
    tenantId: int('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    target: varchar('target', { length: 255 }),
    ip: varchar('ip', { length: 64 }),
    meta: json('meta'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('platform_audit_created_idx').on(table.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Tenant data plane                                                   */
/* ------------------------------------------------------------------ */

export const teams = mysqlTable(
  'teams',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }),
    headName: varchar('head_name', { length: 255 }),
    members: int('members').notNull().default(0),
    monthlySales: decimal('monthly_sales', { precision: 15, scale: 2 }).notNull().default('0.00'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('teams_tenant_idx').on(table.tenantId)],
);

export const users = mysqlTable(  'users',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    name: varchar('name', { length: 255 }),
    username: varchar('username', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('customer'), // admin, staff, agent, customer
    phone: varchar('phone', { length: 20 }),
    profilePhotoPath: text('profile_photo_path'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex('users_tenant_email_unique').on(table.tenantId, table.email),
    uniqueIndex('users_tenant_username_unique').on(table.tenantId, table.username),
    index('users_tenant_idx').on(table.tenantId),
  ],
);

export const roles = mysqlTable(
  'roles',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    roleKey: varchar('role_key', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }),
    permissions: json('permissions').$type<string[]>().notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    isAdmin: boolean('is_admin').notNull().default(false),
    landingPath: varchar('landing_path', { length: 100 }).notNull().default('/dashboard'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex('roles_tenant_key_unique').on(table.tenantId, table.roleKey),
    index('roles_tenant_idx').on(table.tenantId),
  ],
);

export const customers = mysqlTable(
  'customers',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    userId: int('user_id').references(() => users.id),
    code: varchar('code', { length: 30 }),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    dob: date('dob', { mode: 'string' }),
    address: text('address'),
    idCardNumber: varchar('id_card_number', { length: 50 }),
    passportNumber: varchar('passport_number', { length: 50 }),
    gender: varchar('gender', { length: 10 }),
    occupation: varchar('occupation', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    idCardImage: text('id_card_image'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('customers_tenant_idx').on(table.tenantId),
    uniqueIndex('customers_tenant_code_unique').on(table.tenantId, table.code),
  ],
);

export const agents = mysqlTable(
  'agents',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    userId: int('user_id').references(() => users.id),
    teamId: int('team_id').references(() => teams.id),
    agentCode: varchar('agent_code', { length: 50 }).notNull(),
    level: varchar('level', { length: 30 }).notNull().default('Senior'),
    creditLimit: decimal('credit_limit', { precision: 15, scale: 2 }).default('0.00'),
    salesTarget: decimal('sales_target', { precision: 15, scale: 2 }).default('0.00'),
    commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('5.00'),
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('agents_tenant_code_unique').on(table.tenantId, table.agentCode),
    index('agents_tenant_idx').on(table.tenantId),
    index('agents_team_idx').on(table.teamId),
  ],
);

export const insuranceCompanies = mysqlTable(
  'insurance_companies',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    contactPerson: varchar('contact_person', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 20 }),
    logoPath: text('logo_path'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('insurance_companies_tenant_code_unique').on(table.tenantId, table.code),
    index('insurance_companies_tenant_idx').on(table.tenantId),
  ],
);

export const products = mysqlTable(
  'products',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    insuranceCompanyId: int('insurance_company_id').references(() => insuranceCompanies.id),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // Motor, Health, Fire
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('products_tenant_idx').on(table.tenantId)],
);

export const vehicles = mysqlTable(
  'vehicles',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    customerId: int('customer_id').references(() => customers.id),
    make: varchar('make', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    year: int('year'),
    plateNumber: varchar('plate_number', { length: 50 }),
    engineNumber: varchar('engine_number', { length: 100 }),
    chassisNumber: varchar('chassis_number', { length: 100 }),
    engineCapacity: varchar('engine_capacity', { length: 20 }),
    color: varchar('color', { length: 50 }),
    usageType: varchar('usage_type', { length: 50 }), // private, commercial
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('vehicles_tenant_idx').on(table.tenantId)],
);

export const policies = mysqlTable(
  'policies',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    policyNumber: varchar('policy_number', { length: 100 }).notNull(),
    customerId: int('customer_id').references(() => customers.id),
    agentId: int('agent_id').references(() => agents.id),
    vehicleId: int('vehicle_id').references(() => vehicles.id),
    insuranceCompanyId: int('insurance_company_id').references(() => insuranceCompanies.id),
    productId: int('product_id').references(() => products.id),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
    netPremium: decimal('net_premium', { precision: 15, scale: 2 }).notNull(),
    vatAmount: decimal('vat_amount', { precision: 15, scale: 2 }).notNull(),
    registrationFee: decimal('registration_fee', { precision: 15, scale: 2 }).notNull(),
    totalPremium: decimal('total_premium', { precision: 15, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, active, expired
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('policies_tenant_number_unique').on(table.tenantId, table.policyNumber),
    index('policies_tenant_idx').on(table.tenantId),
  ],
);

export const commissionRates = mysqlTable(
  'commission_rates',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    agentId: int('agent_id').references(() => agents.id),
    productId: int('product_id').references(() => products.id),
    ratePercentage: decimal('rate_percentage', { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('commission_rates_tenant_idx').on(table.tenantId)],
);

export const quotations = mysqlTable(
  'quotations',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    reference: varchar('reference', { length: 50 }).notNull(),
    customerId: int('customer_id').references(() => customers.id),
    productId: int('product_id').references(() => products.id),
    premium: decimal('premium', { precision: 15, scale: 2 }).notNull().default('0.00'),
    validUntil: date('valid_until', { mode: 'string' }),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('quotations_tenant_ref_unique').on(table.tenantId, table.reference),
    index('quotations_tenant_idx').on(table.tenantId),
  ],
);

export const claims = mysqlTable(
  'claims',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    claimNumber: varchar('claim_number', { length: 50 }).notNull(),
    policyId: int('policy_id').references(() => policies.id),
    customerId: int('customer_id').references(() => customers.id),
    type: varchar('type', { length: 50 }).notNull(),
    incidentDate: date('incident_date', { mode: 'string' }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
    coverageLimit: decimal('coverage_limit', { precision: 15, scale: 2 }).notNull().default('0.00'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    attachments: json('attachments').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('claims_tenant_number_unique').on(table.tenantId, table.claimNumber),
    index('claims_tenant_idx').on(table.tenantId),
  ],
);

export const invoices = mysqlTable(
  'invoices',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
    policyId: int('policy_id').references(() => policies.id),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
    issuedDate: date('issued_date', { mode: 'string' }).notNull(),
    dueDate: date('due_date', { mode: 'string' }),
    status: varchar('status', { length: 20 }).notNull().default('unpaid'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('invoices_tenant_number_unique').on(table.tenantId, table.invoiceNumber),
    index('invoices_tenant_idx').on(table.tenantId),
  ],
);

export const payments = mysqlTable(
  'payments',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    receiptNumber: varchar('receipt_number', { length: 50 }).notNull(),
    invoiceId: int('invoice_id').references(() => invoices.id),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
    method: varchar('method', { length: 20 }).notNull().default('cash'),
    paidAt: date('paid_at', { mode: 'string' }),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    slipUrl: text('slip_url'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('payments_tenant_receipt_unique').on(table.tenantId, table.receiptNumber),
    index('payments_tenant_idx').on(table.tenantId),
  ],
);

export const commissions = mysqlTable(
  'commissions',
  {
    id: serialId(),
    tenantId: tenantIdColumn(),
    agentId: int('agent_id').references(() => agents.id),
    policyId: int('policy_id').references(() => policies.id),
    rate: decimal('rate', { precision: 5, scale: 2 }).notNull().default('0.00'),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull().default('0.00'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    paidAt: date('paid_at', { mode: 'string' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('commissions_tenant_idx').on(table.tenantId)],
);

export const dbDoctorRuns = mysqlTable(
  'db_doctor_runs',
  {
    id: serialId(),
    mode: varchar('mode', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    triggeredBy: varchar('triggered_by', { length: 20 }).notNull().default('deploy'),
    appVersion: varchar('app_version', { length: 100 }),
    migrationFrom: varchar('migration_from', { length: 100 }),
    migrationTo: varchar('migration_to', { length: 100 }),
    issuesCount: int('issues_count').notNull().default(0),
    repairsCount: int('repairs_count').notNull().default(0),
    durationMs: int('duration_ms').notNull().default(0),
    report: json('report').$type<unknown>(),
    startedAt: timestamp('started_at').defaultNow(),
    finishedAt: timestamp('finished_at'),
  },
  (table) => [index('db_doctor_runs_started_idx').on(table.startedAt)],
);

function serialId() {
  return int('id').autoincrement().primaryKey();
}

function tenantIdColumn() {
  return int('tenant_id').references(() => tenants.id, { onDelete: 'cascade' });
}
