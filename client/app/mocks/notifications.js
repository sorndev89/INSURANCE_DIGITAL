import { agents } from './agents'
import { policies } from './policies'

const dateInDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const birthdayNames = [
  { id: 'c1', name: 'ນິດຊາ ສີສຸວັນ', kind: 'ລູກຄ້າ', days: 1 },
  { id: 'a1', name: 'ມະລິ ເພັດສະຫວັນ', kind: 'ຕົວແທນ', days: 2 },
  { id: 'a2', name: 'ແກ້ວມະນີ ວົງພະຈັນ', kind: 'ຕົວແທນ', days: 5 },
]

export const buildNotifications = () => {
  const birthdayItems = birthdayNames.map((item, index) => ({
    id: `birthday-${item.id}`,
    type: 'birthday',
    title: `ວັນເກີດ${item.kind}: ${item.name}`,
    message: `ອີກ ${item.days} ວັນ · ສົ່ງຄຳອວຍພອນ ແລະ Coupon ສ່ວນຫຼຸດ`,
    date: dateInDays(item.days),
    icon: 'cake',
    read: index > 0,
    to: '/customers',
  }))

  const expiryItems = policies
    .filter((policy) => policy.status === 'active')
    .sort((left, right) => String(left.endDate).localeCompare(String(right.endDate)))
    .slice(0, 3)
    .map((policy, index) => ({
      id: `policy-${policy.id}`,
      type: 'policy',
      title: `ສັນຍາ ${policy.policyNumber} ໃກ້ໝົດອາຍຸ`,
      message: `${policy.customerName} · ${policy.companyCode} · ໝົດ ${policy.endDate}`,
      date: policy.endDate,
      icon: 'schedule',
      read: index > 1,
      to: `/policies/${policy.id}`,
    }))

  const agentItems = agents.slice(0, 2).map((agent, index) => ({
    id: `agent-${agent.id}`,
    type: 'commission',
    title: `ຄອມມິດຊັ່ນພ້ອມຈ່າຍ: ${agent.name}`,
    message: `ຍອດຄ້າງຈ່າຍ ${agent.commissionBalance?.toLocaleString('en-US')} ກີບ`,
    date: dateInDays(-index),
    icon: 'payments',
    read: true,
    to: '/commissions',
  }))

  return [...birthdayItems, ...expiryItems, ...agentItems]
}
