import { agents } from './agents'
import { claims } from './claims'
import { payments } from './payments'
import { policies } from './policies'

export const dashboard = {
  kpis: {
    revenueThisMonth: 450000000,
    revenueTrend: 12,
    activePolicies: 1240,
    activePoliciesTrend: 5.2,
    claimsRatio: 45,
    pendingApprovals: 28,
  },
  monthlySales: [
    { label: 'Jan', value: 160000000 },
    { label: 'Feb', value: 220000000 },
    { label: 'Mar', value: 180000000 },
    { label: 'Apr', value: 280000000 },
    { label: 'May', value: 340000000 },
    { label: 'Jun', value: 260000000 },
    { label: 'Jul', value: 380000000 },
    { label: 'Aug', value: 310000000 },
    { label: 'Sep', value: 420000000 },
    { label: 'Oct', value: 450000000 },
    { label: 'Nov', value: 390000000 },
    { label: 'Dec', value: 0 },
  ],
  productMix: [
    { key: 'Motor', label: 'ປະກັນໄພລົດຍົນ', value: 65, tone: 'primary' },
    { key: 'Health', label: 'ປະກັນສຸຂະພາບ', value: 20, tone: 'danger' },
    { key: 'Fire', label: 'ປະກັນອັກຄີໄພ', value: 10, tone: 'warning' },
    { key: 'Other', label: 'ອື່ນໆ', value: 5, tone: 'neutral' },
  ],
  expiringPolicies: policies
    .filter((policy) => {
      if (policy.status !== 'active') return false
      const endDate = new Date(policy.endDate)
      const now = new Date()
      const inThirtyDays = new Date(now)
      inThirtyDays.setDate(inThirtyDays.getDate() + 30)
      return endDate >= now && endDate <= inThirtyDays
    })
    .slice(0, 4)
    .map((policy) => ({
      id: policy.id,
      customerName: policy.customerName,
      policyNumber: policy.policyNumber,
      productName: policy.productName,
      endDate: policy.endDate,
      phone: policy.customerPhone,
    })),
  recentClaims: claims.slice(0, 4).map((claim) => ({
    id: claim.id,
    claimNumber: claim.claimNumber,
    claimant: claim.claimant,
    type: claim.type,
    amount: claim.amount,
    status: claim.status,
    incidentDate: claim.incidentDate,
  })),
  topAgents: agents
    .slice()
    .sort((left, right) => right.salesYtd - left.salesYtd)
    .slice(0, 3)
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      teamName: agent.teamName,
      sales: agent.salesYtd,
      avatar: agent.avatar || '',
    })),
  recentTransactions: payments.slice(0, 5).map((payment) => ({
    id: payment.receiptNumber,
    customerName: payment.customerName,
    type: 'Payment',
    date: payment.paidAt,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
  })),
}
