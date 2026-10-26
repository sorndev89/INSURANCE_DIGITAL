export const PERM = {
  DASHBOARD_VIEW: 'dashboard.view',

  POLICY_VIEW: 'policy.view',
  POLICY_CREATE: 'policy.create',
  POLICY_UPDATE: 'policy.update',
  POLICY_DELETE: 'policy.delete',
  POLICY_EXPORT: 'policy.export',

  QUOTATION_VIEW: 'quotation.view',
  QUOTATION_CREATE: 'quotation.create',
  QUOTATION_UPDATE: 'quotation.update',
  QUOTATION_DELETE: 'quotation.delete',

  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  CUSTOMER_DELETE: 'customer.delete',

  AGENT_VIEW: 'agent.view',
  AGENT_MANAGE: 'agent.manage',
  TEAM_VIEW: 'team.view',
  TEAM_MANAGE: 'team.manage',

  COMMISSION_VIEW: 'commission.view',
  COMMISSION_PAY: 'commission.pay',

  CLAIM_VIEW: 'claim.view',
  CLAIM_CREATE: 'claim.create',
  CLAIM_PROCESS: 'claim.process',

  FINANCE_VIEW: 'finance.view',
  FINANCE_MANAGE: 'finance.manage',
  PAYMENT_CREATE: 'payment.create',

  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  USER_VIEW: 'user.view',
  USER_MANAGE: 'user.manage',

  SETTINGS_MANAGE: 'settings.manage',
  PROFILE_VIEW: 'profile.view',
}

export const ROLE_PERMISSIONS = {
  admin: ['*'],
  staff: [
    PERM.DASHBOARD_VIEW,
    PERM.POLICY_VIEW,
    PERM.POLICY_CREATE,
    PERM.POLICY_UPDATE,
    PERM.POLICY_EXPORT,
    PERM.QUOTATION_VIEW,
    PERM.QUOTATION_CREATE,
    PERM.QUOTATION_UPDATE,
    PERM.CUSTOMER_VIEW,
    PERM.CUSTOMER_CREATE,
    PERM.CUSTOMER_UPDATE,
    PERM.AGENT_VIEW,
    PERM.TEAM_VIEW,
    PERM.COMMISSION_VIEW,
    PERM.CLAIM_VIEW,
    PERM.CLAIM_CREATE,
    PERM.CLAIM_PROCESS,
    PERM.FINANCE_VIEW,
    PERM.FINANCE_MANAGE,
    PERM.PAYMENT_CREATE,
    PERM.REPORT_VIEW,
    PERM.REPORT_EXPORT,
    PERM.PROFILE_VIEW,
  ],
  agent: [
    PERM.DASHBOARD_VIEW,
    PERM.POLICY_VIEW,
    PERM.POLICY_CREATE,
    PERM.QUOTATION_VIEW,
    PERM.QUOTATION_CREATE,
    PERM.QUOTATION_UPDATE,
    PERM.QUOTATION_DELETE,
    PERM.CUSTOMER_VIEW,
    PERM.CUSTOMER_CREATE,
    PERM.CUSTOMER_UPDATE,
    PERM.COMMISSION_VIEW,
    PERM.CLAIM_VIEW,
    PERM.CLAIM_CREATE,
    PERM.PROFILE_VIEW,
  ],
  customer: [
    PERM.POLICY_VIEW,
    PERM.POLICY_CREATE,
    PERM.QUOTATION_VIEW,
    PERM.QUOTATION_CREATE,
    PERM.CLAIM_VIEW,
    PERM.CLAIM_CREATE,
    PERM.PAYMENT_CREATE,
    PERM.PROFILE_VIEW,
  ],
}

export const ROLE_LABELS = {
  admin: 'ຜູ້ດູແລລະບົບ',
  staff: 'ພະນັກງານ',
  agent: 'ຕົວແທນ',
  customer: 'ລູກຄ້າ',
}

export const ROLE_LANDING = {
  admin: '/dashboard',
  staff: '/dashboard',
  agent: '/home',
  customer: '/home',
}

export const getRolePermissions = (role) => ROLE_PERMISSIONS[role] || []

export const hasPermission = (role, permission) => {
  const permissions = getRolePermissions(role)
  return permissions.includes('*') || permissions.includes(permission)
}
