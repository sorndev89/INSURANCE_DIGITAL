export type PermissionDefinition = {
  key: string;
  label: string;
};

export type PermissionGroup = {
  key: string;
  title: string;
  permissions: PermissionDefinition[];
};

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
  ROLE_MANAGE: 'role.manage',
  PROFILE_VIEW: 'profile.view',
} as const;

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'general',
    title: 'ທົ່ວໄປ',
    permissions: [
      { key: PERM.DASHBOARD_VIEW, label: 'ເບິ່ງພາບລວມລະບົບ' },
      { key: PERM.PROFILE_VIEW, label: 'ເຂົ້າເຖິງໂປຣໄຟລ໌' },
    ],
  },
  {
    key: 'policies',
    title: 'ປະກັນໄພ ແລະ ສະເໜີລາຄາ',
    permissions: [
      { key: PERM.POLICY_VIEW, label: 'ເບິ່ງປະກັນໄພ' },
      { key: PERM.POLICY_CREATE, label: 'ສ້າງປະກັນໄພ' },
      { key: PERM.POLICY_UPDATE, label: 'ແກ້ໄຂ ແລະ ປ່ຽນສະຖານະປະກັນໄພ' },
      { key: PERM.POLICY_DELETE, label: 'ລຶບປະກັນໄພ' },
      { key: PERM.POLICY_EXPORT, label: 'ສົ່ງອອກຂໍ້ມູນປະກັນໄພ' },
      { key: PERM.QUOTATION_VIEW, label: 'ເບິ່ງສະເໜີລາຄາ' },
      { key: PERM.QUOTATION_CREATE, label: 'ສ້າງສະເໜີລາຄາ' },
      { key: PERM.QUOTATION_UPDATE, label: 'ແກ້ໄຂສະເໜີລາຄາ' },
      { key: PERM.QUOTATION_DELETE, label: 'ລຶບສະເໜີລາຄາ' },
    ],
  },
  {
    key: 'customers',
    title: 'ລູກຄ້າ',
    permissions: [
      { key: PERM.CUSTOMER_VIEW, label: 'ເບິ່ງຂໍ້ມູນລູກຄ້າ' },
      { key: PERM.CUSTOMER_CREATE, label: 'ເພີ່ມລູກຄ້າ' },
      { key: PERM.CUSTOMER_UPDATE, label: 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າ' },
      { key: PERM.CUSTOMER_DELETE, label: 'ລຶບລູກຄ້າ' },
    ],
  },
  {
    key: 'agents',
    title: 'ຕົວແທນ ແລະ ທີມ',
    permissions: [
      { key: PERM.AGENT_VIEW, label: 'ເບິ່ງຕົວແທນ' },
      { key: PERM.AGENT_MANAGE, label: 'ຈັດການຕົວແທນ' },
      { key: PERM.TEAM_VIEW, label: 'ເບິ່ງໂຄງສ້າງທີມ' },
      { key: PERM.TEAM_MANAGE, label: 'ຈັດການທີມ' },
    ],
  },
  {
    key: 'commissions',
    title: 'ຄອມມິດຊັ່ນ',
    permissions: [
      { key: PERM.COMMISSION_VIEW, label: 'ເບິ່ງຄ່າຄອມມິດຊັ່ນ' },
      { key: PERM.COMMISSION_PAY, label: 'ຈ່າຍຄ່າຄອມມິດຊັ່ນ' },
    ],
  },
  {
    key: 'claims',
    title: 'ເຄມ',
    permissions: [
      { key: PERM.CLAIM_VIEW, label: 'ເບິ່ງລາຍການເຄມ' },
      { key: PERM.CLAIM_CREATE, label: 'ແຈ້ງເຄມ' },
      { key: PERM.CLAIM_PROCESS, label: 'ອະນຸມັດ/ປະຕິເສດເຄມ' },
    ],
  },
  {
    key: 'finance',
    title: 'ການເງິນ',
    permissions: [
      { key: PERM.FINANCE_VIEW, label: 'ເບິ່ງການເງິນ' },
      { key: PERM.FINANCE_MANAGE, label: 'ຈັດການການເງິນ' },
      { key: PERM.PAYMENT_CREATE, label: 'ບັນທຶກການຊຳລະເງິນ' },
    ],
  },
  {
    key: 'reports',
    title: 'ລາຍງານ',
    permissions: [
      { key: PERM.REPORT_VIEW, label: 'ເບິ່ງລາຍງານ' },
      { key: PERM.REPORT_EXPORT, label: 'ສົ່ງອອກລາຍງານ' },
    ],
  },
];

export const SYSTEM_PERMISSION_GROUP: PermissionGroup = {
  key: 'system',
  title: 'ລະບົບ (ສະເພາະ admin)',
  permissions: [
    { key: PERM.USER_VIEW, label: 'ເບິ່ງຜູ້ໃຊ້ງານ' },
    { key: PERM.USER_MANAGE, label: 'ຈັດການຜູ້ໃຊ້ງານ' },
    { key: PERM.SETTINGS_MANAGE, label: 'ຕັ້ງຄ່າລະບົບ' },
    { key: PERM.ROLE_MANAGE, label: 'ຈັດການສິດ ແລະ ບົດບາດ' },
  ],
};

export const ALL_PERMISSION_GROUPS = [...PERMISSION_GROUPS, SYSTEM_PERMISSION_GROUP];

export const ALL_PERMISSION_KEYS = new Set(
  ALL_PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => permission.key)),
);

export const SYSTEM_PERMISSION_KEYS = new Set(
  SYSTEM_PERMISSION_GROUP.permissions.map((permission) => permission.key),
);

export const LANDING_PATHS = [
  { value: '/dashboard', label: 'ພາບລວມລະບົບ' },
  { value: '/home', label: 'ໜ້າຫຼັກ' },
  { value: '/policies', label: 'ປະກັນໄພ' },
  { value: '/claims', label: 'ເຄມ' },
  { value: '/finance/payments', label: 'ການຊຳລະເງິນ' },
  { value: '/reports/summary', label: 'ລາຍງານສະຫຼຸບ' },
];

export const LANDING_PATH_VALUES = new Set(LANDING_PATHS.map((path) => path.value));

export type DefaultRole = {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  landingPath: string;
  isSystem: true;
  isAdmin: boolean;
};

export const DEFAULT_ROLES: DefaultRole[] = [
  {
    key: 'admin',
    name: 'ຜູ້ດູແລລະບົບ',
    description: 'ສິດເຕັມໃນລະບົບ',
    permissions: ['*'],
    landingPath: '/dashboard',
    isSystem: true,
    isAdmin: true,
  },
  {
    key: 'staff',
    name: 'ພະນັກງານ',
    description: 'ພະນັກງານປະຕິບັດງານ',
    permissions: [
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
      PERM.AGENT_MANAGE,
      PERM.TEAM_VIEW,
      PERM.TEAM_MANAGE,
      PERM.COMMISSION_VIEW,
      PERM.COMMISSION_PAY,
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
    landingPath: '/dashboard',
    isSystem: true,
    isAdmin: false,
  },
  {
    key: 'agent',
    name: 'ຕົວແທນ',
    description: 'ຕົວແທນຂາຍ',
    permissions: [
      PERM.DASHBOARD_VIEW,
      PERM.POLICY_VIEW,
      PERM.POLICY_CREATE,
      PERM.POLICY_UPDATE,
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
      PERM.CLAIM_PROCESS,
      PERM.PROFILE_VIEW,
    ],
    landingPath: '/home',
    isSystem: true,
    isAdmin: false,
  },
  {
    key: 'customer',
    name: 'ລູກຄ້າ',
    description: 'ລູກຄ້າ',
    permissions: [
      PERM.POLICY_VIEW,
      PERM.POLICY_CREATE,
      PERM.QUOTATION_VIEW,
      PERM.QUOTATION_CREATE,
      PERM.CLAIM_VIEW,
      PERM.CLAIM_CREATE,
      PERM.PAYMENT_CREATE,
      PERM.PROFILE_VIEW,
    ],
    landingPath: '/home',
    isSystem: true,
    isAdmin: false,
  },
];

export const RESERVED_ROLE_KEYS = new Set(DEFAULT_ROLES.map((role) => role.key));

export const isKnownPermission = (key: string) => ALL_PERMISSION_KEYS.has(key);

export const isSystemPermission = (key: string) => SYSTEM_PERMISSION_KEYS.has(key);
