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
        label: 'ພາບລວມທຸລະກິດ',
        icon: 'dashboard',
        to: '/dashboard',
        permission: PERM.DASHBOARD_VIEW,
        roles: ['admin', 'staff'],
      },
    ],
  },
  {
    title: 'ການຂາຍ ແລະ ລູກຄ້າ',
    items: [
      {
        label: 'ຈັດການປະກັນໄພ',
        icon: 'description',
        to: '/policies',
        permission: PERM.POLICY_VIEW,
        roles: ['admin', 'staff'],
      },
      {
        label: 'ປະກັນໄພຂອງຂ້ອຍ',
        icon: 'verified_user',
        to: '/my-policies',
        permission: PERM.POLICY_VIEW,
        roles: ['agent', 'customer'],
      },
      {
        label: 'ຂໍ້ມູນລູກຄ້າ',
        icon: 'people_alt',
        to: '/customers',
        permission: PERM.CUSTOMER_VIEW,
      },
      {
        label: 'ທະບຽນລົດ',
        icon: 'directions_car',
        to: '/vehicles',
        permission: PERM.VEHICLE_VIEW,
      },
    ],
  },
  {
    title: 'ຂໍ້ມູນຫຼັກ',
    items: [
      {
        label: 'ບໍລິສັດປະກັນໄພ',
        icon: 'apartment',
        to: '/insurers',
        permission: PERM.INSURER_VIEW,
      },
      {
        label: 'ຜະລິດຕະພັນ & ຄອມມິດຊັ່ນ',
        icon: 'percent',
        to: '/insurer-commissions',
        permission: PERM.INSURER_VIEW,
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
        label: 'ຄ່າຄອມມິດຊັ່ນ',
        icon: 'payments',
        to: '/commissions',
        permission: PERM.COMMISSION_VIEW,
      },
    ],
  },
  {
    title: 'ລາຍງານ',
    items: [
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍມື້',
        icon: 'today',
        to: '/reports/sales/daily',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍມື້ ແຍກຢູ່ເຊີ',
        icon: 'groups',
        to: '/reports/sales/daily-by-user',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍເດືອນ',
        icon: 'calendar_month',
        to: '/reports/sales/monthly',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍເດືອນ ແຍກຢູ່ເຊີ',
        icon: 'group',
        to: '/reports/sales/monthly-by-user',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍໄຕມາດ',
        icon: 'date_range',
        to: '/reports/sales/quarterly',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍໄຕມາດ ແຍກຢູ່ເຊີ',
        icon: 'groups_2',
        to: '/reports/sales/quarterly-by-user',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍປີ',
        icon: 'event_note',
        to: '/reports/sales/annual',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານຍອດຂາຍ',
        label: 'ຍອດຂາຍລາຍປີ ແຍກຢູ່ເຊີ',
        icon: 'group_add',
        to: '/reports/sales/annual-by-user',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານ UNDERWRITING',
        label: 'ຕາມຊ່ວງວັນທີ',
        icon: 'date_range',
        to: '/reports/underwriting/date-range',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານ UNDERWRITING',
        label: 'ຕາມບໍລິສັດ & ວັນທີ',
        icon: 'apartment',
        to: '/reports/underwriting/company',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານ UNDERWRITING',
        label: 'ສັນຍາໃກ້ໝົດອາຍຸ',
        icon: 'event_busy',
        to: '/reports/underwriting/expiration',
        permission: PERM.REPORT_VIEW,
      },
      {
        section: 'ລາຍງານ UNDERWRITING',
        label: 'ໝົດອາຍຸ ແຍກຕາມຕົວແທນ',
        icon: 'person_search',
        to: '/reports/underwriting/expiration-by-agent',
        permission: PERM.REPORT_VIEW,
      },
    ],
  },
  {
    title: 'ການຕະຫຼາດ',
    items: [
      {
        label: 'ໂຄສະນາ & ແບນເນີ',
        icon: 'campaign',
        to: '/marketing-banners',
        permission: PERM.MARKETING_MANAGE,
      },
    ],
  },
  {
    title: 'ບັນຊີຂອງຂ້ອຍ',
    items: [
      {
        label: 'ໂປຣໄຟລ໌ & ຄະແນນ',
        icon: 'person',
        to: '/profile',
        permission: PERM.PROFILE_VIEW,
      },
    ],
  },
]

export const bottomTabsByRole = {
  admin: [
    { label: 'ພາບລວມ', icon: 'dashboard', to: '/dashboard' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ບໍລິສັດ', icon: 'apartment', to: '/insurers' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  staff: [
    { label: 'ພາບລວມ', icon: 'dashboard', to: '/dashboard' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/policies' },
    { label: 'ບໍລິສັດ', icon: 'apartment', to: '/insurers' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  agent: [
    { label: 'ໜ້າຫຼັກ', icon: 'home', to: '/home' },
    { label: 'ປະກັນໄພ', icon: 'description', to: '/my-policies' },
    { label: 'ຂາຍ', icon: 'add_circle', to: '/policies/create', accent: true },
    { label: 'ຄອມມິດຊັ່ນ', icon: 'payments', to: '/commissions' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
  customer: [
    { label: 'ໜ້າຫຼັກ', icon: 'home', to: '/home' },
    { label: 'ປະກັນໄພ', icon: 'verified_user', to: '/my-policies' },
    { label: 'ຊື້ປະກັນໄພ', icon: 'add_circle', to: '/policies/create', accent: true },
    { label: 'ໂປຣໄຟລ໌', icon: 'person', to: '/profile' },
    { label: 'ເພີ່ມເຕີມ', icon: 'menu', action: 'more' },
  ],
}

export const findNavigationContext = (path) => {
  let best = null
  navigationGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (path === item.to || path.startsWith(`${item.to}/`)) {
        if (!best || item.to.length > best.item.to.length) best = { group, item }
      }
    })
  })
  return best
}

export const findNavigationItem = (path) => findNavigationContext(path)?.item
