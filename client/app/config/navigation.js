import { PERM } from './permissions'

export const navigationGroups = [
  {
    title: 'ພາບລວມ',
    items: [
      {
        label: 'ໜ້າຫຼັກ',
        icon: 'home',
        to: '/home',
        permission: PERM.PROFILE_VIEW,
        roles: ['agent', 'customer'],
      },
      {
        label: 'ພາບລວມລະບົບ',
        icon: 'dashboard',
        to: '/dashboard',
        permission: PERM.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: 'ການຂາຍ ແລະ ບໍລິການ',
    items: [
      {
        label: 'ຈັດການປະກັນໄພ',
        icon: 'description',
        to: '/policies',
        permission: PERM.POLICY_VIEW,
      },
      {
        label: 'ສະເໜີລາຄາ',
        icon: 'request_quote',
        to: '/quotations',
        permission: PERM.QUOTATION_VIEW,
      },
      {
        label: 'ຂໍ້ມູນລູກຄ້າ',
        icon: 'people_alt',
        to: '/customers',
        permission: PERM.CUSTOMER_VIEW,
      },
    ],
  },
  {
    title: 'ຕົວແທນ ແລະ ຄອມມິດຊັ່ນ',
    items: [
      {
        label: 'ຕົວແທນຂາຍ',
        icon: 'badge',
        to: '/agents',
        permission: PERM.AGENT_VIEW,
      },
      {
        label: 'ໂຄງສ້າງທີມ',
        icon: 'diversity_3',
        to: '/teams',
        permission: PERM.TEAM_VIEW,
      },
      {
        label: 'ຄ່າຄອມມິດຊັ່ນ',
        icon: 'payments',
        to: '/commissions',
        permission: PERM.COMMISSION_VIEW,
      },
    ],
  },
  {
    title: 'ເຄມ',
    items: [
      {
        label: 'ລາຍການເຄມ',
        icon: 'assignment_late',
        to: '/claims',
        permission: PERM.CLAIM_VIEW,
      },
    ],
  },
  {
    title: 'ການເງິນ',
    items: [
      {
        label: 'ໃບແຈ້ງໜີ້',
        icon: 'receipt_long',
        to: '/finance/invoices',
        permission: PERM.FINANCE_VIEW,
      },
      {
        label: 'ການຊຳລະເງິນ',
        icon: 'account_balance_wallet',
        to: '/finance/payments',
        permission: PERM.FINANCE_VIEW,
      },
    ],
  },
  {
    title: 'ລາຍງານ ແລະ ລະບົບ',
    items: [
      {
        label: 'ລາຍງານທຸລະກິດ',
        icon: 'analytics',
        to: '/reports',
        permission: PERM.REPORT_VIEW,
      },
      {
        label: 'ຜູ້ໃຊ້ງານ',
        icon: 'manage_accounts',
        to: '/users',
        permission: PERM.USER_VIEW,
      },
      {
        label: 'ຕັ້ງຄ່າລະບົບ',
        icon: 'settings',
        to: '/settings',
        permission: PERM.SETTINGS_MANAGE,
      },
    ],
  },
]

export const bottomTabsByRole = {
  admin: [
    { label: 'ພາບລວມ', icon: 'dashboard', to: '/dashboard' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ເຄມ', icon: 'assignment_late', to: '/claims' },
    { label: 'ການເງິນ', icon: 'account_balance_wallet', to: '/finance/payments' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  staff: [
    { label: 'ພາບລວມ', icon: 'dashboard', to: '/dashboard' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ເຄມ', icon: 'assignment_late', to: '/claims' },
    { label: 'ການເງິນ', icon: 'account_balance_wallet', to: '/finance/payments' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  agent: [
    { label: 'ໜ້າຫຼັກ', icon: 'home', to: '/home' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ຂາຍ', icon: 'add_circle', to: '/policies/create', accent: true },
    { label: 'ຄອມມິດຊັ່ນ', icon: 'payments', to: '/commissions' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  customer: [
    { label: 'ໜ້າຫຼັກ', icon: 'home', to: '/home' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ຊື້ປະກັນໄພ', icon: 'add_circle', to: '/policies/create', accent: true },
    { label: 'ເຄມ', icon: 'assignment_late', to: '/claims' },
    { label: 'ໂປຣໄຟລ໌', icon: 'person', to: '/profile' },
  ],
}

export const findNavigationItem = (path) =>
  navigationGroups
    .flatMap((group) => group.items)
    .filter((item) => path === item.to || path.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]
