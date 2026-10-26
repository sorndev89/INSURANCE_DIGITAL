import { todayIso } from './date'

const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0)

export const calculateInvoiceStats = (rows = []) => ({
  total: rows.length,
  unpaid: rows.filter((row) => row.status === 'unpaid').length,
  overdue: rows.filter((row) => row.status === 'overdue').length,
  amount: sumBy(rows, 'amount'),
})

export const calculatePaymentStats = (rows = [], { today = todayIso() } = {}) => {
  const monthPrefix = today.slice(0, 7)
  const completed = rows.filter((row) => row.status === 'completed')
  return {
    total: rows.length,
    today: completed
      .filter((row) => row.paidAt === today)
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    month: completed
      .filter((row) => row.paidAt?.startsWith(monthPrefix))
      .reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    pending: rows.filter((row) => row.status === 'pending').length,
  }
}

export const calculatePolicyStats = (rows = [], { now = new Date() } = {}) => {
  const inThirtyDays = new Date(now)
  inThirtyDays.setDate(inThirtyDays.getDate() + 30)
  const active = rows.filter((row) => row.status === 'active')
  const expiring = active.filter((row) => {
    const endDate = new Date(row.endDate)
    return endDate >= now && endDate <= inThirtyDays
  })
  return {
    total: rows.length,
    active: active.length,
    expiring: expiring.length,
    premium: sumBy(rows, 'totalPremium'),
  }
}
