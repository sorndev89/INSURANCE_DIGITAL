export const SALES_GRANULARITIES = [
  { value: 'daily', label: 'ລາຍມື້' },
  { value: 'monthly', label: 'ລາຍເດືອນ' },
  { value: 'quarterly', label: 'ໄຕມາດ' },
  { value: 'annual', label: 'ລາຍປີ' },
]

const pad = (value) => String(value).padStart(2, '0')

const parseIso = (value) => {
  const [year, month, day] = String(value || '')
    .slice(0, 10)
    .split('-')
    .map(Number)
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1, 12))
}

export const formatIso = (date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

export const periodKey = (dateValue, granularity = 'monthly') => {
  const date = parseIso(dateValue)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  if (granularity === 'daily') return formatIso(date)
  if (granularity === 'quarterly') return `${year}-Q${Math.floor((month - 1) / 3) + 1}`
  if (granularity === 'annual') return String(year)
  return `${year}-${pad(month)}`
}

export const periodLabel = (key, granularity = 'monthly') => {
  if (granularity === 'daily') return key
  if (granularity === 'quarterly') {
    const [year, quarter] = key.split('-')
    return `${quarter}/${year}`
  }
  if (granularity === 'annual') return key
  const [year, month] = key.split('-')
  return `${month}/${year}`
}

const startOfPeriod = (date, granularity) => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  if (granularity === 'daily') return new Date(Date.UTC(year, month, date.getUTCDate(), 12))
  if (granularity === 'quarterly') {
    return new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1, 12))
  }
  if (granularity === 'annual') return new Date(Date.UTC(year, 0, 1, 12))
  return new Date(Date.UTC(year, month, 1, 12))
}

const nextPeriod = (date, granularity) => {
  const next = new Date(date)
  if (granularity === 'daily') next.setUTCDate(next.getUTCDate() + 1)
  else if (granularity === 'quarterly') next.setUTCMonth(next.getUTCMonth() + 3)
  else if (granularity === 'annual') next.setUTCFullYear(next.getUTCFullYear() + 1)
  else next.setUTCMonth(next.getUTCMonth() + 1)
  return next
}

export const enumeratePeriods = ({ from, to, granularity = 'monthly' }) => {
  if (!from || !to || from > to) return []
  const keys = []
  let cursor = startOfPeriod(parseIso(from), granularity)
  const end = parseIso(to)
  let guard = 0
  while (cursor <= end && guard < 2000) {
    keys.push(periodKey(formatIso(cursor), granularity))
    cursor = nextPeriod(cursor, granularity)
    guard += 1
  }
  return keys
}

const createPeriod = (key, granularity) => ({
  key,
  label: periodLabel(key, granularity),
  policyCount: 0,
  netPremium: 0,
  vatAmount: 0,
  registrationFee: 0,
  totalPremium: 0,
  users: new Map(),
})

const addAmounts = (target, policy) => {
  target.policyCount += 1
  target.netPremium += Number(policy.netPremium) || 0
  target.vatAmount += Number(policy.vatAmount) || 0
  target.registrationFee += Number(policy.registrationFee) || 0
  target.totalPremium += Number(policy.totalPremium) || 0
}

const createUser = (id, policy, agent) => ({
  id,
  code: agent?.code || agent?.agentCode || (id === 'unassigned' ? '—' : `AG-${id}`),
  name: policy.agentName || agent?.name || 'ບໍ່ກຳນົດ',
  policyCount: 0,
  netPremium: 0,
  vatAmount: 0,
  registrationFee: 0,
  totalPremium: 0,
})

const addToUser = (target, policy) => {
  target.policyCount += 1
  target.netPremium += Number(policy.netPremium) || 0
  target.vatAmount += Number(policy.vatAmount) || 0
  target.registrationFee += Number(policy.registrationFee) || 0
  target.totalPremium += Number(policy.totalPremium) || 0
}

const percentOf = (value, total) => {
  if (!total) return 0
  return Math.round((value / total) * 1000) / 10
}

const finalizePeriod = (period, totalPremium) => ({
  key: period.key,
  label: period.label,
  policyCount: period.policyCount,
  netPremium: period.netPremium,
  vatAmount: period.vatAmount,
  registrationFee: period.registrationFee,
  totalPremium: period.totalPremium,
  share: percentOf(period.totalPremium, totalPremium),
  users: Array.from(period.users.values())
    .map((user) => ({ ...user, share: percentOf(user.totalPremium, period.totalPremium) }))
    .sort((left, right) => right.totalPremium - left.totalPremium),
})

export const buildSalesReport = ({
  policies = [],
  agents = [],
  from,
  to,
  granularity = 'monthly',
  groupBy = 'total',
  agentId = 'ALL',
  companyCode = 'ALL',
  productType = 'ALL',
} = {}) => {
  const agentMap = new Map(agents.map((agent) => [String(agent.id), agent]))
  const filtered = policies.filter((policy) => {
    const date = String(policy.startDate || '')
    if (!date || date < from || date > to) return false
    if (agentId !== 'ALL' && String(policy.agentId ?? '') !== String(agentId)) return false
    if (companyCode !== 'ALL' && policy.companyCode !== companyCode) return false
    if (productType !== 'ALL' && policy.productType !== productType) return false
    return true
  })

  const keys = enumeratePeriods({ from, to, granularity })
  const periodMap = new Map(keys.map((key) => [key, createPeriod(key, granularity)]))
  const allUsers = new Map()

  filtered.forEach((policy) => {
    const key = periodKey(policy.startDate, granularity)
    const period = periodMap.get(key)
    if (!period) return

    addAmounts(period, policy)

    const userId = policy.agentId || 'unassigned'
    const userKey = String(userId)
    const agent = agentMap.get(userKey)
    if (!period.users.has(userKey)) {
      period.users.set(userKey, createUser(userId, policy, agent))
    }
    addToUser(period.users.get(userKey), policy)

    if (!allUsers.has(userKey)) {
      allUsers.set(userKey, createUser(userId, policy, agent))
    }
    addToUser(allUsers.get(userKey), policy)
  })

  const totalPremium = filtered.reduce(
    (sum, policy) => sum + (Number(policy.totalPremium) || 0),
    0,
  )
  const totals = {
    policyCount: filtered.length,
    netPremium: filtered.reduce((sum, policy) => sum + (Number(policy.netPremium) || 0), 0),
    vatAmount: filtered.reduce((sum, policy) => sum + (Number(policy.vatAmount) || 0), 0),
    registrationFee: filtered.reduce(
      (sum, policy) => sum + (Number(policy.registrationFee) || 0),
      0,
    ),
    totalPremium,
  }

  const periods = keys.map((key) =>
    finalizePeriod(periodMap.get(key), totals.totalPremium),
  )

  const users = Array.from(allUsers.values())
    .map((user) => ({ ...user, share: percentOf(user.totalPremium, totals.totalPremium) }))
    .sort((left, right) => right.totalPremium - left.totalPremium)

  return {
    meta: { from, to, granularity, groupBy, agentId, companyCode, productType },
    totals,
    periods,
    users,
    topUsers: users.slice(0, 6),
    tableRows:
      groupBy === 'user'
        ? periods.flatMap((period) =>
            period.users.map((user) => ({
              key: `${period.key}-${user.id}`,
              period: period.label,
              periodKey: period.key,
              userCode: user.code,
              userName: user.name,
              policyCount: user.policyCount,
              netPremium: user.netPremium,
              vatAmount: user.vatAmount,
              registrationFee: user.registrationFee,
              totalPremium: user.totalPremium,
              share: user.share,
            })),
          )
        : periods.map((period) => ({
            key: period.key,
            period: period.label,
            periodKey: period.key,
            policyCount: period.policyCount,
            netPremium: period.netPremium,
            vatAmount: period.vatAmount,
            registrationFee: period.registrationFee,
            totalPremium: period.totalPremium,
            share: period.share,
          })),
  }
}
