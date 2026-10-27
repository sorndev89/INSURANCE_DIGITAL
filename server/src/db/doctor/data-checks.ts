import type { PoolConnection } from 'mysql2/promise';
import type { DoctorIssue, DoctorSeverity } from './types.js';

type DataCheck = {
  code: string;
  message: string;
  sql: string;
  severity?: DoctorSeverity;
  deep?: boolean;
};

const TENANT_TABLES = [
  'roles',
  'users',
  'teams',
  'customers',
  'agents',
  'insurance_companies',
  'products',
  'vehicles',
  'policies',
  'commission_rates',
  'quotations',
  'claims',
  'invoices',
  'payments',
  'commissions',
];

const orphanChecks: DataCheck[] = [
  ['customers', 'user_id', 'users', 'id'],
  ['agents', 'user_id', 'users', 'id'],
  ['agents', 'team_id', 'teams', 'id'],
  ['vehicles', 'customer_id', 'customers', 'id'],
  ['policies', 'customer_id', 'customers', 'id'],
  ['policies', 'agent_id', 'agents', 'id'],
  ['policies', 'vehicle_id', 'vehicles', 'id'],
  ['policies', 'insurance_company_id', 'insurance_companies', 'id'],
  ['policies', 'product_id', 'products', 'id'],
  ['quotations', 'customer_id', 'customers', 'id'],
  ['quotations', 'product_id', 'products', 'id'],
  ['claims', 'policy_id', 'policies', 'id'],
  ['claims', 'customer_id', 'customers', 'id'],
  ['invoices', 'policy_id', 'policies', 'id'],
  ['payments', 'invoice_id', 'invoices', 'id'],
  ['commissions', 'agent_id', 'agents', 'id'],
  ['commissions', 'policy_id', 'policies', 'id'],
  ['commission_rates', 'agent_id', 'agents', 'id'],
  ['commission_rates', 'product_id', 'products', 'id'],
  ['roles', 'tenant_id', 'tenants', 'id'],
  ['tenant_domains', 'tenant_id', 'tenants', 'id'],
  ['subscriptions', 'tenant_id', 'tenants', 'id'],
  ['subscriptions', 'plan_id', 'plans', 'id'],
  ['platform_audit_logs', 'actor_id', 'platform_users', 'id'],
  ['platform_audit_logs', 'tenant_id', 'tenants', 'id'],
].map(([table, column, refTable, refColumn]) => ({
  code: `data_orphan_${table}_${column}`,
  message: `${table}.${column} references a missing ${refTable}.${refColumn} row.`,
  severity: 'warning' as DoctorSeverity,
  sql: `SELECT 1 FROM \`${table}\` t
        WHERE t.\`${column}\` IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM \`${refTable}\` r WHERE r.\`${refColumn}\` = t.\`${column}\`
          )
        LIMIT 1`,
}));

const statusChecks: DataCheck[] = [
  ['policies', ['pending', 'active', 'expired', 'cancelled']],
  ['quotations', ['draft', 'sent', 'accepted', 'expired']],
  ['claims', ['pending', 'reviewing', 'approved', 'rejected']],
  ['invoices', ['unpaid', 'overdue', 'paid']],
  ['payments', ['pending', 'completed', 'failed']],
  ['commissions', ['pending', 'paid']],
  ['tenants', ['active', 'trial', 'suspended']],
].map(([table, statuses]) => ({
  code: `data_invalid_status_${table}`,
  message: `${table} contains a status outside ${(statuses as string[]).join(', ')}.`,
  severity: 'warning' as DoctorSeverity,
  sql: `SELECT 1 FROM \`${table}\`
        WHERE status IS NOT NULL
          AND status NOT IN (${(statuses as string[]).map((status) => `'${status}'`).join(', ')})
        LIMIT 1`,
}));

const coreChecks: DataCheck[] = [
  ...TENANT_TABLES.map((table) => ({
    code: `data_missing_tenant_${table}`,
    message: `${table} has rows with a NULL tenant_id.`,
    severity: 'warning' as DoctorSeverity,
    sql: `SELECT 1 FROM \`${table}\` WHERE tenant_id IS NULL LIMIT 1`,
  })),
  ...orphanChecks,
  ...statusChecks,
  {
    code: 'data_negative_invoice_amount',
    message: 'invoices.amount contains a negative value.',
    severity: 'warning',
    sql: 'SELECT 1 FROM invoices WHERE amount < 0 LIMIT 1',
  },
  {
    code: 'data_negative_payment_amount',
    message: 'payments.amount contains a negative value.',
    severity: 'warning',
    sql: 'SELECT 1 FROM payments WHERE amount < 0 LIMIT 1',
  },
  {
    code: 'data_negative_commission_amount',
    message: 'commissions.amount contains a negative value.',
    severity: 'warning',
    sql: 'SELECT 1 FROM commissions WHERE amount < 0 LIMIT 1',
  },
  {
    code: 'data_negative_policy_premium',
    message: 'policies.total_premium contains a negative value.',
    severity: 'warning',
    sql: 'SELECT 1 FROM policies WHERE total_premium < 0 LIMIT 1',
  },
  {
    code: 'data_invalid_policy_dates',
    message: 'policies has end_date before start_date.',
    severity: 'warning',
    sql: 'SELECT 1 FROM policies WHERE end_date < start_date LIMIT 1',
  },
  {
    code: 'data_completed_payment_without_paid_at',
    message: 'payments has completed rows without paid_at.',
    severity: 'warning',
    sql: "SELECT 1 FROM payments WHERE status = 'completed' AND paid_at IS NULL LIMIT 1",
  },
  {
    code: 'data_tenant_multiple_primary_domains',
    message: 'A tenant has more than one primary domain.',
    severity: 'warning',
    sql: `SELECT 1 FROM tenant_domains
          WHERE is_primary = 1
          GROUP BY tenant_id HAVING COUNT(*) > 1 LIMIT 1`,
  },
  {
    code: 'data_tenant_without_admin_role',
    message: 'A tenant has no admin role.',
    severity: 'warning',
    sql: `SELECT 1 FROM tenants t
          WHERE t.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM roles r WHERE r.tenant_id = t.id AND r.is_admin = 1
            )
          LIMIT 1`,
  },
  {
    code: 'data_user_without_role',
    message: 'A user references a role that does not exist in its tenant.',
    severity: 'warning',
    sql: `SELECT 1 FROM users u
          WHERE NOT EXISTS (
            SELECT 1 FROM roles r
            WHERE r.tenant_id = u.tenant_id AND r.role_key = u.role
          )
          LIMIT 1`,
  },
  {
    code: 'data_tenant_without_primary_domain',
    message: 'A tenant has no primary domain.',
    severity: 'warning',
    sql: `SELECT 1 FROM tenants t
          WHERE t.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM tenant_domains d WHERE d.tenant_id = t.id AND d.is_primary = 1
            )
          LIMIT 1`,
  },
  {
    code: 'data_verified_domain_without_token',
    message: 'A verified tenant domain has no verification token.',
    severity: 'warning',
    sql: `SELECT 1 FROM tenant_domains
          WHERE type = 'custom' AND verified_at IS NOT NULL AND verification_token IS NULL LIMIT 1`,
  },
];

const deepChecks: DataCheck[] = [
  {
    code: 'data_cross_tenant_policy_customer',
    message: 'policies.customer_id belongs to a different tenant.',
    severity: 'critical',
    deep: true,
    sql: `SELECT 1 FROM policies p
          JOIN customers c ON c.id = p.customer_id
          WHERE p.tenant_id <> c.tenant_id LIMIT 1`,
  },
  {
    code: 'data_cross_tenant_policy_agent',
    message: 'policies.agent_id belongs to a different tenant.',
    severity: 'critical',
    deep: true,
    sql: `SELECT 1 FROM policies p
          JOIN agents a ON a.id = p.agent_id
          WHERE p.tenant_id <> a.tenant_id LIMIT 1`,
  },
  {
    code: 'data_cross_tenant_invoice_policy',
    message: 'invoices.policy_id belongs to a different tenant.',
    severity: 'critical',
    deep: true,
    sql: `SELECT 1 FROM invoices i
          JOIN policies p ON p.id = i.policy_id
          WHERE i.tenant_id <> p.tenant_id LIMIT 1`,
  },
  {
    code: 'data_cross_tenant_payment_invoice',
    message: 'payments.invoice_id belongs to a different tenant.',
    severity: 'critical',
    deep: true,
    sql: `SELECT 1 FROM payments p
          JOIN invoices i ON i.id = p.invoice_id
          WHERE p.tenant_id <> i.tenant_id LIMIT 1`,
  },
  {
    code: 'data_cross_tenant_claim_policy',
    message: 'claims.policy_id belongs to a different tenant.',
    severity: 'critical',
    deep: true,
    sql: `SELECT 1 FROM claims c
          JOIN policies p ON p.id = c.policy_id
          WHERE c.tenant_id <> p.tenant_id LIMIT 1`,
  },
  {
    code: 'data_invalid_claim_attachments',
    message: 'claims.attachments is not a JSON array.',
    severity: 'warning',
    deep: true,
    sql: `SELECT 1 FROM claims
          WHERE attachments IS NOT NULL AND JSON_TYPE(attachments) <> 'ARRAY' LIMIT 1`,
  },
];

const runCheck = async (
  connection: PoolConnection,
  check: DataCheck,
  timeoutMs: number,
): Promise<DoctorIssue | null> => {
  try {
    await connection.query('SET SESSION MAX_EXECUTION_TIME = ?', [timeoutMs]);
    const [rows] = await connection.query(check.sql);
    if (Array.isArray(rows) && rows.length > 0) {
      return {
        code: check.code,
        category: 'data',
        severity: check.severity ?? 'warning',
        message: check.message,
      };
    }
    return null;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ER_QUERY_TIMEOUT' || code === 'ER_QUERY_TIMEOUT_DURING_EXECUTION') {
      return {
        code: 'data_check_timeout',
        category: 'data',
        severity: 'warning',
        message: `Data check ${check.code} timed out after ${timeoutMs}ms.`,
      };
    }
    return {
      code: 'data_check_failed',
      category: 'data',
      severity: 'warning',
      message: `Data check ${check.code} failed: ${(error as Error).message}`,
    };
  } finally {
    await connection.query('SET SESSION MAX_EXECUTION_TIME = 0').catch(() => undefined);
  }
};

export const runDataChecks = async (
  connection: PoolConnection,
  {
    deep = false,
    timeoutMs = 5000,
    budgetMs = 15_000,
  }: { deep?: boolean; timeoutMs?: number; budgetMs?: number } = {},
): Promise<DoctorIssue[]> => {
  const checks = deep ? [...coreChecks, ...deepChecks] : coreChecks;
  const issues: DoctorIssue[] = [];
  const startedAt = Date.now();

  for (const check of checks) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= budgetMs) {
      issues.push({
        code: 'data_checks_budget_exceeded',
        category: 'data',
        severity: 'info',
        message: `Data checks stopped after ${elapsed}ms budget. Run "npm run db:doctor -- --deep" manually for a full report.`,
      });
      break;
    }
    const issue = await runCheck(connection, check, Math.min(timeoutMs, budgetMs - elapsed));
    if (issue) issues.push(issue);
  }
  return issues;
};
