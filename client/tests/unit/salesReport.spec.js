import { describe, expect, it } from 'vitest'
import {
  buildSalesReport,
  enumeratePeriods,
  periodKey,
  periodLabel,
} from '~/utils/salesReport'

const agents = [
  { id: 1, code: 'SB_001', name: 'ຄຳພູ' },
  { id: 2, code: 'SB_002', name: 'ມະລິ' },
]

const policy = (overrides) => ({
  id: overrides.id,
  agentId: overrides.agentId || 1,
  agentName: overrides.agentName || 'ຄຳພູ',
  companyCode: overrides.companyCode || 'DHP',
  productType: overrides.productType || 'Motor',
  startDate: overrides.startDate,
  netPremium: overrides.netPremium ?? 1000,
  vatAmount: overrides.vatAmount ?? 70,
  registrationFee: overrides.registrationFee ?? 200,
  totalPremium: overrides.totalPremium ?? 1270,
})

const policies = [
  policy({ id: 1, startDate: '2026-01-05', agentId: 1, totalPremium: 1000 }),
  policy({
    id: 2,
    startDate: '2026-01-20',
    agentId: 2,
    agentName: 'ມະລິ',
    companyCode: 'APA',
    totalPremium: 2000,
  }),
  policy({ id: 3, startDate: '2026-02-10', agentId: 1, totalPremium: 3000 }),
  policy({ id: 4, startDate: '2025-12-31', agentId: 1, totalPremium: 500 }),
]

describe('sales period helpers', () => {
  it('builds daily, monthly, quarterly and annual keys', () => {
    expect(periodKey('2026-10-27', 'daily')).toBe('2026-10-27')
    expect(periodKey('2026-10-27', 'monthly')).toBe('2026-10')
    expect(periodKey('2026-10-27', 'quarterly')).toBe('2026-Q4')
    expect(periodKey('2026-10-27', 'annual')).toBe('2026')
  })

  it('labels periods for display', () => {
    expect(periodLabel('2026-10', 'monthly')).toBe('10/2026')
    expect(periodLabel('2026-Q4', 'quarterly')).toBe('Q4/2026')
    expect(periodLabel('2026', 'annual')).toBe('2026')
  })

  it('enumerates every period between dates', () => {
    expect(
      enumeratePeriods({ from: '2026-01-01', to: '2026-03-31', granularity: 'monthly' }),
    ).toEqual(['2026-01', '2026-02', '2026-03'])
    expect(
      enumeratePeriods({ from: '2026-01-01', to: '2026-12-31', granularity: 'quarterly' }),
    ).toEqual(['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4'])
    expect(
      enumeratePeriods({ from: '2024-01-01', to: '2026-12-31', granularity: 'annual' }),
    ).toEqual(['2024', '2025', '2026'])
  })
})

describe('buildSalesReport', () => {
  it('returns period totals and keeps empty periods', () => {
    const report = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-03-31',
      granularity: 'monthly',
      groupBy: 'total',
    })

    expect(report.periods.map((row) => row.key)).toEqual(['2026-01', '2026-02', '2026-03'])
    expect(report.periods.map((row) => row.totalPremium)).toEqual([3000, 3000, 0])
    expect(report.totals.policyCount).toBe(3)
    expect(report.totals.totalPremium).toBe(6000)
  })

  it('splits totals by user and calculates share inside each period', () => {
    const report = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-01-31',
      granularity: 'monthly',
      groupBy: 'user',
    })

    const january = report.periods[0]
    expect(january.users).toHaveLength(2)
    expect(january.users[0]).toMatchObject({
      code: 'SB_002',
      name: 'ມະລິ',
      policyCount: 1,
      totalPremium: 2000,
      share: 66.7,
    })
    expect(january.users[1]).toMatchObject({
      code: 'SB_001',
      name: 'ຄຳພູ',
      totalPremium: 1000,
      share: 33.3,
    })
    expect(report.totals.totalPremium).toBe(3000)
  })

  it('filters by agent and company', () => {
    const byAgent = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-12-31',
      granularity: 'annual',
      agentId: '1',
    })
    expect(byAgent.totals.policyCount).toBe(2)
    expect(byAgent.totals.totalPremium).toBe(4000)

    const byCompany = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-12-31',
      granularity: 'annual',
      companyCode: 'APA',
    })
    expect(byCompany.totals.policyCount).toBe(1)
    expect(byCompany.totals.totalPremium).toBe(2000)
  })

  it('supports daily, quarterly and annual grouping', () => {
    const daily = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-01-31',
      granularity: 'daily',
    })
    expect(daily.periods).toHaveLength(31)
    expect(daily.periods.find((row) => row.key === '2026-01-05')?.totalPremium).toBe(1000)

    const quarterly = buildSalesReport({
      policies,
      agents,
      from: '2026-01-01',
      to: '2026-12-31',
      granularity: 'quarterly',
    })
    expect(quarterly.periods.find((row) => row.key === '2026-Q1')?.totalPremium).toBe(6000)

    const annual = buildSalesReport({
      policies,
      agents,
      from: '2025-01-01',
      to: '2026-12-31',
      granularity: 'annual',
    })
    expect(annual.periods.map((row) => row.totalPremium)).toEqual([500, 6000])
  })
})
