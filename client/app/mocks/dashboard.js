import { agents } from './agents'
import { insurers } from './insurers'
import { policies } from './policies'

const TARGET = 3600000000
const YTD_PREVIOUS = 1265572934
const YTD_CURRENT = 1848013176

const ytdByInsurer = [
  { code: 'DHP', value: 614243165.74 },
  { code: 'APA', value: 612086221.12 },
  { code: 'SOK', value: 200975820 },
  { code: 'LXA', value: 109835777.8 },
  { code: 'FTK', value: 98474100.5 },
  { code: 'ALZ', value: 58422061.94 },
  { code: 'ZJI', value: 50181708 },
  { code: 'NVK', value: 44032821.8 },
  { code: 'LVI', value: 33655404.63 },
  { code: 'VTE', value: 19898004 },
  { code: 'STM', value: 3265027 },
].map((row, index) => {
  const insurer = insurers.find((item) => item.code === row.code)
  return {
    id: index + 1,
    code: row.code,
    name: insurer?.name || row.code,
    nameLao: insurer?.nameLao || row.code,
    shortName: insurer?.shortName || row.code,
    logo: insurer?.logo || '',
    value: row.value,
    policyCount: policies.filter((policy) => policy.companyCode === row.code).length,
  }
})

const totalYtd = ytdByInsurer.reduce((sum, row) => sum + row.value, 0)

const monthly = [
  { label: 'Jan', value: 126000000, claimsValue: 52000000 },
  { label: 'Feb', value: 148000000, claimsValue: 61000000 },
  { label: 'Mar', value: 139000000, claimsValue: 58000000 },
  { label: 'Apr', value: 172000000, claimsValue: 72000000 },
  { label: 'May', value: 186000000, claimsValue: 79000000 },
  { label: 'Jun', value: 165000000, claimsValue: 68000000 },
  { label: 'Jul', value: 198000000, claimsValue: 81000000 },
  { label: 'Aug', value: 181000000, claimsValue: 75000000 },
  { label: 'Sep', value: 205000000, claimsValue: 84000000 },
  { label: 'Oct', value: 128013176, claimsValue: 52000000 },
  { label: 'Nov', value: 0, claimsValue: 0 },
  { label: 'Dec', value: 0, claimsValue: 0 },
]

const today = new Date()
const inDays = (days) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const expiringPolicies = policies
  .filter((policy) => policy.status === 'active')
  .sort((left, right) => String(left.endDate).localeCompare(String(right.endDate)))
  .slice(0, 6)
  .map((policy) => ({
    id: policy.id,
    customerName: policy.customerName,
    policyNumber: policy.policyNumber,
    productName: policy.productName,
    companyCode: policy.companyCode,
    endDate: policy.endDate,
    phone: policy.customerPhone,
  }))

export const dashboard = {
  target: TARGET,
  ytdCurrent: YTD_CURRENT,
  ytdPrevious: YTD_PREVIOUS,
  variance: TARGET - YTD_CURRENT,
  achievementRate: Math.round((YTD_CURRENT / TARGET) * 1000) / 10,
  growthRate: Math.round(((YTD_CURRENT - YTD_PREVIOUS) / YTD_PREVIOUS) * 1000) / 10,
  insurerYtd: ytdByInsurer,
  totalYtd,
  monthly,
  productMix: [
    { key: 'Motor', label: 'ປະກັນໄພລົດຍົນ', value: 62, tone: 'primary' },
    { key: 'Health', label: 'ປະກັນສຸຂະພາບ', value: 19, tone: 'danger' },
    { key: 'Fire', label: 'ປະກັນອັກຄີໄພ', value: 12, tone: 'warning' },
    { key: 'Other', label: 'ອື່ນໆ', value: 7, tone: 'neutral' },
  ],
  expiringPolicies,
  topAgents: agents
    .slice()
    .sort((left, right) => right.salesYtd - left.salesYtd)
    .slice(0, 5),
  recentPolicies: policies.slice(0, 6),
  triage: {
    pendingPolicies: policies.filter((policy) => policy.status === 'pending').length,
    expiringCount: expiringPolicies.length,
    birthdayCount: 3,
  },
  birthdayPreview: [
    { name: 'ນິດຊາ ສີສຸວັນ', date: inDays(1), type: 'customer' },
    { name: 'ມະລິ ເພັດສະຫວັນ', date: inDays(2), type: 'agent' },
    { name: 'ແກ້ວມະນີ ວົງພະຈັນ', date: inDays(5), type: 'agent' },
  ],
}

export const brokerKpis = [
  { label: 'ເປົ້າໝາຍປີ', value: TARGET, icon: 'flag' },
  { label: 'ຍອດຂາຍປີ 2021', value: YTD_PREVIOUS, icon: 'history' },
  { label: 'ຍອດຂາຍປີ 2022', value: YTD_CURRENT, icon: 'trending_up' },
  { label: 'Variance', value: TARGET - YTD_CURRENT, icon: 'difference' },
]
