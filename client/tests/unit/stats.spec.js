import { describe, expect, it } from 'vitest'
import { calculateInvoiceStats, calculatePaymentStats, calculatePolicyStats } from '~/utils/stats'

describe('KPI calculations are independent from pagination', () => {
  it('sums every invoice row, not just the visible page', () => {
    const rows = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      amount: 1000,
      status: index < 10 ? 'unpaid' : index < 13 ? 'overdue' : 'paid',
    }))

    expect(calculateInvoiceStats(rows)).toEqual({
      total: 25,
      unpaid: 10,
      overdue: 3,
      amount: 25000,
    })
  })

  it('returns zeroed invoice stats for no data', () => {
    expect(calculateInvoiceStats([])).toEqual({
      total: 0,
      unpaid: 0,
      overdue: 0,
      amount: 0,
    })
  })

  it('calculates today/month payments across the full dataset', () => {
    const rows = [
      { amount: 1000, status: 'completed', paidAt: '2026-10-26' },
      { amount: 2000, status: 'completed', paidAt: '2026-10-01' },
      { amount: 3000, status: 'completed', paidAt: '2026-09-30' },
      { amount: 4000, status: 'pending', paidAt: '' },
      { amount: 5000, status: 'failed', paidAt: '2026-10-26' },
    ]

    expect(calculatePaymentStats(rows, { today: '2026-10-26' })).toEqual({
      total: 5,
      today: 1000,
      month: 3000,
      pending: 1,
    })
    expect(calculatePaymentStats([], { today: '2026-10-26' })).toEqual({
      total: 0,
      today: 0,
      month: 0,
      pending: 0,
    })
  })

  it('calculates policy totals and expiring windows from all rows', () => {
    const rows = [
      { status: 'active', totalPremium: 1000, endDate: '2026-11-01' },
      { status: 'active', totalPremium: 2000, endDate: '2027-12-01' },
      { status: 'active', totalPremium: 3000, endDate: '2026-10-01' },
      { status: 'expired', totalPremium: 4000, endDate: '2026-11-01' },
      ...Array.from({ length: 20 }, () => ({
        status: 'active',
        totalPremium: 100,
        endDate: '2027-06-01',
      })),
    ]

    expect(calculatePolicyStats(rows, { now: new Date('2026-10-26T00:00:00') })).toEqual({
      total: 24,
      active: 23,
      expiring: 1,
      premium: 12000,
    })
  })
})
