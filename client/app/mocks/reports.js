import { agents } from './agents'
import { claims } from './claims'
import { commissions } from './commissions'
import { customers } from './customers'
import { invoices } from './invoices'
import { payments } from './payments'
import { policies } from './policies'
import { quotations } from './quotations'
import { teams } from './teams'

const PRODUCT_LABELS = {
  Motor: 'ປະກັນໄພລົດຍົນ',
  Health: 'ປະກັນສຸຂະພາບ',
  Fire: 'ປະກັນອັກຄີໄພ',
  Accident: 'ປະກັນອຸບັດຕິເຫດ',
}

const STATUS_LABELS = {
  pending: 'ລໍຖ້າ',
  reviewing: 'ກຳລັງກວດສອບ',
  active: 'ມີຜົນ',
  expired: 'ໝົດອາຍຸ',
  cancelled: 'ຍົກເລີກ',
  draft: 'ຮ່າງ',
  sent: 'ສົ່ງແລ້ວ',
  accepted: 'ຍອມຮັບ',
  approved: 'ອະນຸມັດ',
  rejected: 'ປະຕິເສດ',
  unpaid: 'ຍັງບໍ່ຈ່າຍ',
  overdue: 'ເກີນກຳນົດ',
  paid: 'ຈ່າຍແລ້ວ',
  completed: 'ສຳເລັດ',
}

const pad = (value) => String(value).padStart(2, '0')
const dateOnly = (value) => String(value || '').slice(0, 10)
const monthKey = (value) => dateOnly(value).slice(0, 7)
const monthLabel = (key) => `${key.slice(5, 7)}/${key.slice(0, 4)}`
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (value, days) => {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
const inRange = (value, range) => {
  if (!range?.from || !range?.to) return true
  if (!value) return false
  const date = dateOnly(value)
  return date >= range.from && date <= range.to
}
const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
const percent = (value, total) => (total > 0 ? Math.round((value / total) * 1000) / 10 : 0)
const statusLabel = (value) => STATUS_LABELS[value] || value || 'ອື່ນໆ'
const productLabel = (value) => PRODUCT_LABELS[value] || value || 'ອື່ນໆ'
const productTone = (value) =>
  value === 'Motor'
    ? 'primary'
    : value === 'Health'
      ? 'danger'
      : value === 'Fire'
        ? 'warning'
        : 'neutral'
const monthKeys = (range) => {
  if (!range?.from || !range?.to) return []
  const keys = []
  const start = new Date(`${range.from.slice(0, 7)}-01T12:00:00Z`)
  const end = new Date(`${range.to.slice(0, 7)}-01T12:00:00Z`)
  let year = start.getUTCFullYear()
  let month = start.getUTCMonth()
  while (
    year < end.getUTCFullYear() ||
    (year === end.getUTCFullYear() && month <= end.getUTCMonth())
  ) {
    keys.push(`${year}-${pad(month + 1)}`)
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }
  return keys
}
const fill = (rows, range, key = 'value') => {
  const map = new Map(rows.map((row) => [row.month, row[key]]))
  return monthKeys(range).map((month) => ({
    month,
    label: monthLabel(month),
    value: map.get(month) ?? 0,
  }))
}
const groupMonth = (rows, dateKey, valueKey) => {
  const map = new Map()
  rows.forEach((row) => {
    const key = monthKey(row[dateKey])
    if (!key) return
    const current = map.get(key) || { month: key, count: 0, value: 0 }
    current.count += 1
    current.value += Number(row[valueKey]) || 0
    map.set(key, current)
  })
  return Array.from(map.values())
}
const groupSum = (rows, key, valueKey) => {
  const map = new Map()
  rows.forEach((row) => {
    const group = row[key] ?? 'Other'
    const current = map.get(group) || { key: group, count: 0, value: 0 }
    current.count += 1
    current.value += Number(row[valueKey]) || 0
    map.set(group, current)
  })
  return Array.from(map.values())
}
const activePolicies = policies.filter((policy) => policy.status === 'active')
const periodPolicies = (range) => policies.filter((policy) => inRange(policy.startDate, range))
const periodClaims = (range) => claims.filter((claim) => inRange(claim.incidentDate, range))
const periodQuotations = (range) => quotations.filter((quote) => inRange(quote.createdAt, range))
const periodCommissions = (range) =>
  commissions.filter((item) => inRange(item.paidAt || '2026-10-01', range))

const buildSummary = (range) => {
  const current = periodPolicies(range)
  const revenue = sum(current, 'totalPremium')
  const claimRows = periodClaims(range)
  const claimAmount = sum(claimRows, 'amount')
  const collected = sum(
    payments.filter((payment) => payment.status === 'completed' && inRange(payment.paidAt, range)),
    'amount',
  )
  const outstanding = sum(
    invoices.filter((invoice) => ['unpaid', 'overdue'].includes(invoice.status)),
    'amount',
  )
  const monthlyRows = groupMonth(policies, 'startDate', 'totalPremium')
  const mix = groupSum(periodPolicies(range), 'productType', 'totalPremium')
  const mixTotal = mix.reduce((total, row) => total + row.value, 0)
  return {
    range,
    kpis: {
      revenue,
      revenueTrend: revenue > 0 ? 12 : 0,
      collected,
      outstanding,
      activePolicies: activePolicies.length,
      activePoliciesTrend: 5.2,
      claimsRatio: percent(claimAmount, revenue),
      pendingApprovals: claimRows.filter((claim) => ['pending', 'reviewing'].includes(claim.status))
        .length,
      policyCount: current.length,
      claimCount: claimRows.length,
      newCustomers: customers.filter((customer) => inRange(customer.createdAt, range)).length,
      expiring30: activePolicies.filter(
        (policy) => policy.endDate >= today() && policy.endDate <= addDays(today(), 30),
      ).length,
    },
    monthlySales: fill(monthlyRows, range),
    productMix: mix.map((row) => ({
      key: row.key,
      label: productLabel(row.key),
      value: percent(row.value, mixTotal),
      amount: row.value,
      count: row.count,
      tone: productTone(row.key),
    })),
  }
}

const buildSales = (range) => {
  const rows = periodPolicies(range)
  const totalPremium = sum(rows, 'totalPremium')
  const monthlyRows = groupMonth(rows, 'startDate', 'totalPremium')
  const byProduct = groupSum(rows, 'productType', 'totalPremium')
  const byCompany = groupSum(rows, 'companyName', 'totalPremium')
  const byAgent = groupSum(rows, 'agentName', 'totalPremium')
  return {
    range,
    totals: {
      totalPremium,
      netPremium: sum(rows, 'netPremium'),
      vatAmount: sum(rows, 'vatAmount'),
      registrationFee: sum(rows, 'registrationFee'),
      policyCount: rows.length,
    },
    monthly: fill(monthlyRows, range),
    byProduct: byProduct.map((row) => ({
      key: row.key,
      label: productLabel(row.key),
      value: row.value,
      count: row.count,
      percentage: percent(row.value, totalPremium),
      tone: productTone(row.key),
    })),
    byCompany: byCompany.map((row) => ({
      key: row.key,
      label: row.key,
      value: row.value,
      count: row.count,
      percentage: percent(row.value, totalPremium),
    })),
    byAgent: byAgent.map((row) => ({
      id: row.key,
      label: row.key,
      value: row.value,
      count: row.count,
      percentage: percent(row.value, totalPremium),
    })),
  }
}

const buildPolicies = (range) => {
  const issued = periodPolicies(range)
  const portfolio = groupSum(policies, 'status', 'totalPremium')
  const byStatus = groupSum(issued, 'status', 'totalPremium')
  const expiringList = activePolicies
    .filter((policy) => policy.endDate >= today() && policy.endDate <= addDays(today(), 30))
    .map((policy) => ({
      id: policy.id,
      policyNumber: policy.policyNumber,
      customerName: policy.customerName,
      customerPhone: policy.customerPhone,
      productName: policy.productName,
      endDate: policy.endDate,
      totalPremium: policy.totalPremium,
    }))
  return {
    range,
    total: policies.length,
    active: activePolicies.length,
    expiring30: expiringList.length,
    expired: policies.filter((policy) => policy.status === 'expired').length,
    cancelled: policies.filter((policy) => policy.status === 'cancelled').length,
    pending: policies.filter((policy) => policy.status === 'pending').length,
    premium: sum(policies, 'totalPremium'),
    issuedInPeriod: {
      count: issued.length,
      value: sum(issued, 'totalPremium'),
      byStatus: byStatus.map((row) => ({
        key: row.key,
        label: statusLabel(row.key),
        count: row.count,
        value: row.value,
      })),
    },
    portfolioByStatus: portfolio.map((row) => ({
      key: row.key,
      label: statusLabel(row.key),
      count: row.count,
      value: row.value,
    })),
    expiringList,
  }
}

const buildQuotations = (range) => {
  const rows = periodQuotations(range)
  const groups = groupSum(rows, 'status', 'premium')
  const total = rows.length
  const accepted = rows.filter((quote) => quote.status === 'accepted').length
  const value = sum(rows, 'premium')
  return {
    range,
    total,
    totalValue: value,
    draft: rows.filter((quote) => quote.status === 'draft').length,
    sent: rows.filter((quote) => quote.status === 'sent').length,
    accepted,
    expired: rows.filter((quote) => quote.status === 'expired').length,
    conversionRate: percent(accepted, total),
    pipelineValue: rows
      .filter((quote) => ['draft', 'sent'].includes(quote.status))
      .reduce((totalValue, quote) => totalValue + quote.premium, 0),
    byStatus: groups.map((row) => ({
      key: row.key,
      label: statusLabel(row.key),
      count: row.count,
      value: row.value,
    })),
    monthly: fill(
      groupMonth(rows, 'createdAt', 'premium').map((row) => ({ ...row, value: row.count })),
      range,
    ),
    recent: rows.slice(0, 20).map((quote) => ({
      id: quote.id,
      reference: quote.reference,
      customerName: quote.customerName,
      premium: quote.premium,
      validUntil: quote.validUntil,
      status: quote.status,
      createdAt: quote.createdAt,
    })),
  }
}

const buildClaims = (range) => {
  const rows = periodClaims(range)
  const amount = sum(rows, 'amount')
  const premium = sum(periodPolicies(range), 'totalPremium')
  return {
    range,
    total: rows.length,
    pending: rows.filter((claim) => claim.status === 'pending').length,
    reviewing: rows.filter((claim) => claim.status === 'reviewing').length,
    approved: rows.filter((claim) => claim.status === 'approved').length,
    rejected: rows.filter((claim) => claim.status === 'rejected').length,
    amount,
    approvedAmount: sum(
      rows.filter((claim) => claim.status === 'approved'),
      'amount',
    ),
    premium,
    ratio: percent(amount, premium),
    byStatus: groupSum(rows, 'status', 'amount').map((row) => ({
      key: row.key,
      label: statusLabel(row.key),
      count: row.count,
      value: row.value,
    })),
    byType: groupSum(rows, 'type', 'amount').map((row) => ({
      key: row.key,
      label: row.key,
      count: row.count,
      value: row.value,
    })),
    monthly: fill(groupMonth(rows, 'incidentDate', 'amount'), range),
    recent: rows.slice(0, 20),
  }
}

const buildCustomers = (range) => {
  const total = customers.length
  const topCustomers = groupSum(
    periodPolicies(range).map((policy) => ({
      ...policy,
      customerName: policy.customerName,
    })),
    'customerName',
    'totalPremium',
  )
    .sort((left, right) => right.value - left.value)
    .slice(0, 20)
    .map((row) => ({
      id: row.key,
      name: row.key,
      phone: '',
      policyCount: row.count,
      value: row.value,
    }))
  return {
    range,
    total,
    active: customers.filter((customer) => customer.status === 'active').length,
    newInPeriod: customers.filter((customer) => inRange(customer.createdAt, range)).length,
    withActivePolicy: new Set(activePolicies.map((policy) => policy.customerId)).size,
    policyCount: policies.length,
    policiesPerCustomer: total > 0 ? Math.round((policies.length / total) * 10) / 10 : 0,
    newByMonth: fill(
      groupMonth(
        customers.filter((customer) => inRange(customer.createdAt, range)),
        'createdAt',
        'id',
      ),
      range,
    ),
    topCustomers,
  }
}

const buildAgents = (range) => {
  const ranking = agents
    .map((agent) => {
      const agentPolicies = periodPolicies(range).filter((policy) => policy.agentId === agent.id)
      const agentCommissions = periodCommissions(range).filter((item) => item.agentId === agent.id)
      const sales = sum(agentPolicies, 'totalPremium')
      return {
        id: agent.id,
        code: agent.agentCode || agent.code,
        name: agent.name,
        teamName: agent.teamName,
        level: agent.level,
        status: agent.status,
        sales,
        policyCount: agentPolicies.length,
        target: agent.salesTarget,
        achievement: percent(sales, agent.salesTarget),
        commission: sum(agentCommissions, 'amount'),
        pendingCommission: sum(
          agentCommissions.filter((item) => item.status === 'pending'),
          'amount',
        ),
        paidCommission: sum(
          agentCommissions.filter((item) => item.status === 'paid'),
          'amount',
        ),
      }
    })
    .sort((left, right) => right.sales - left.sales)
  return {
    range,
    total: agents.length,
    active: agents.filter((agent) => agent.status === 'active').length,
    sales: ranking.reduce((total, agent) => total + agent.sales, 0),
    target: ranking.reduce((total, agent) => total + agent.target, 0),
    commission: ranking.reduce((total, agent) => total + agent.commission, 0),
    salesTargetAchievement: percent(
      ranking.reduce((total, agent) => total + agent.sales, 0),
      ranking.reduce((total, agent) => total + agent.target, 0),
    ),
    ranking,
  }
}

const buildTeams = (range) => {
  const ranking = teams
    .map((team) => {
      const teamAgents = agents.filter((agent) => agent.teamId === team.id)
      const teamPolicies = periodPolicies(range).filter((policy) =>
        teamAgents.some((agent) => agent.id === policy.agentId),
      )
      const sales = sum(teamPolicies, 'totalPremium')
      const target = sum(teamAgents, 'salesTarget')
      return {
        id: team.id,
        name: team.name,
        location: team.location,
        headName: team.headName,
        status: team.status,
        members: team.members,
        agentCount: teamAgents.length,
        sales,
        policyCount: teamPolicies.length,
        target,
        achievement: percent(sales, target),
      }
    })
    .sort((left, right) => right.sales - left.sales)
  return {
    range,
    total: ranking.length,
    members: ranking.reduce((total, team) => total + team.members, 0),
    sales: ranking.reduce((total, team) => total + team.sales, 0),
    target: ranking.reduce((total, team) => total + team.target, 0),
    salesTargetAchievement: percent(
      ranking.reduce((total, team) => total + team.sales, 0),
      ranking.reduce((total, team) => total + team.target, 0),
    ),
    ranking,
  }
}

const buildCommissions = (range) => {
  const rows = periodCommissions(range)
  const groups = groupSum(rows, 'status', 'amount')
  return {
    range,
    total: rows.length,
    pending: rows.filter((item) => item.status === 'pending').length,
    paid: rows.filter((item) => item.status === 'paid').length,
    pendingAmount: sum(
      rows.filter((item) => item.status === 'pending'),
      'amount',
    ),
    paidAmount: sum(
      rows.filter((item) => item.status === 'paid'),
      'amount',
    ),
    totalAmount: sum(rows, 'amount'),
    byStatus: groups.map((row) => ({
      key: row.key,
      label: statusLabel(row.key),
      count: row.count,
      value: row.value,
    })),
    byAgent: groupSum(rows, 'agentName', 'amount')
      .sort((left, right) => right.value - left.value)
      .map((row) => ({
        id: row.key,
        name: row.key,
        teamName: '',
        count: row.count,
        value: row.value,
        pending: sum(
          rows.filter((item) => item.agentName === row.key && item.status === 'pending'),
          'amount',
        ),
        paid: sum(
          rows.filter((item) => item.agentName === row.key && item.status === 'paid'),
          'amount',
        ),
      })),
    monthly: fill(groupMonth(rows, 'paidAt', 'amount'), range),
    recent: rows.slice(0, 20),
  }
}

const buildFinance = (range) => {
  const periodInvoices = invoices.filter((invoice) => inRange(invoice.issuedDate, range))
  const periodPayments = payments.filter((payment) => inRange(payment.paidAt, range))
  const invoiced = sum(periodInvoices, 'amount')
  const collected = sum(
    periodPayments.filter((payment) => payment.status === 'completed'),
    'amount',
  )
  const outstanding = invoices.filter((invoice) => ['unpaid', 'overdue'].includes(invoice.status))
  return {
    range,
    invoices: {
      total: periodInvoices.length,
      unpaid: periodInvoices.filter((invoice) => invoice.status === 'unpaid').length,
      overdue: periodInvoices.filter((invoice) => invoice.status === 'overdue').length,
      paid: periodInvoices.filter((invoice) => invoice.status === 'paid').length,
      amount: invoiced,
      unpaidAmount: sum(
        periodInvoices.filter((invoice) => invoice.status === 'unpaid'),
        'amount',
      ),
      overdueAmount: sum(
        periodInvoices.filter((invoice) => invoice.status === 'overdue'),
        'amount',
      ),
    },
    payments: {
      total: periodPayments.length,
      collected,
      pending: periodPayments.filter((payment) => payment.status === 'pending').length,
      today: sum(
        periodPayments.filter((payment) => payment.paidAt === today()),
        'amount',
      ),
      month: sum(
        periodPayments.filter((payment) => monthKey(payment.paidAt) === monthKey(today())),
        'amount',
      ),
      byMethod: groupSum(
        periodPayments.filter((payment) => payment.status === 'completed'),
        'method',
        'amount',
      ).map((row) => ({ key: row.key, label: row.key, count: row.count, value: row.value })),
    },
    collectionRate: percent(collected, invoiced),
    aging: {
      current: 0,
      days1to30: sum(outstanding, 'amount'),
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
      total: sum(outstanding, 'amount'),
    },
    monthly: monthKeys(range).map((month) => ({
      month,
      label: monthLabel(month),
      invoiced: sum(
        periodInvoices.filter((invoice) => monthKey(invoice.issuedDate) === month),
        'amount',
      ),
      collected: sum(
        periodPayments.filter(
          (payment) => payment.status === 'completed' && monthKey(payment.paidAt) === month,
        ),
        'amount',
      ),
    })),
    overdueList: outstanding.slice(0, 20),
  }
}

const builders = {
  summary: buildSummary,
  sales: buildSales,
  policies: buildPolicies,
  quotations: buildQuotations,
  claims: buildClaims,
  customers: buildCustomers,
  agents: buildAgents,
  teams: buildTeams,
  commissions: buildCommissions,
  finance: buildFinance,
}

export const buildReportMock = (type, range) => {
  const builder = builders[type] || builders.summary
  return builder(range)
}
