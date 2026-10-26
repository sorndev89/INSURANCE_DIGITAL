import { describe, expect, it } from 'vitest'
import { useFormat } from '~/utils/format'
import { calculatePremium } from '~/utils/premium'

const format = useFormat()

describe('useFormat', () => {
  it('formats currency with the kip symbol and grouping', () => {
    expect(format.currency(12850000)).toBe('₭ 12,850,000')
    expect(format.currency(-1000)).toBe('-₭ 1,000')
    expect(format.currency(null)).toBe('₭ 0')
  })

  it('supports configured symbol, position and grouping', () => {
    expect(format.currency(12850000, { symbol: 'lak', position: 'suffix' })).toBe('12,850,000 LAK')
    expect(format.currency(12850000, { symbol: 'kip', position: 'prefix' })).toBe('₭ 12,850,000')
  })

  it('formats numbers and percentages', () => {
    expect(format.number(1234567)).toBe('1,234,567')
    expect(format.percent(12.345)).toBe('12.3%')
    expect(format.compact(1200000)).toBe('1.2M')
  })

  it('formats dates as dd/mm/yyyy without timezone drift', () => {
    expect(format.date('2026-10-25')).toBe('25/10/2026')
    expect(format.date('')).toBe('—')
    expect(format.date('not-a-date')).toBe('—')
  })

  it('normalizes Lao phone numbers', () => {
    expect(format.phone('02055551234')).toBe('020 5555 1234')
    expect(format.phone('2055551234')).toBe('020 5555 1234')
    expect(format.phone('8562055551234')).toBe('020 5555 1234')
    expect(format.phone('020 5555 1234')).toBe('020 5555 1234')
    expect(format.phone('')).toBe('—')
  })
})

describe('calculatePremium', () => {
  it('calculates net, VAT 7%, registration fee, and total', () => {
    const result = calculatePremium({ basePremium: 2500000, discountPercent: 10 })
    expect(result.discountAmount).toBe(250000)
    expect(result.netPremium).toBe(2250000)
    expect(result.vatAmount).toBe(157500)
    expect(result.registrationFee).toBe(20000)
    expect(result.totalPremium).toBe(2427500)
  })

  it('handles zero and full discount', () => {
    expect(calculatePremium({ basePremium: 1000000 }).totalPremium).toBe(1090000)
    const free = calculatePremium({ basePremium: 1000000, discountPercent: 100 })
    expect(free.netPremium).toBe(0)
    expect(free.vatAmount).toBe(0)
    expect(free.totalPremium).toBe(20000)
  })

  it('never returns negative values', () => {
    const result = calculatePremium({ basePremium: -500, discountPercent: 120 })
    expect(result.basePremium).toBe(0)
    expect(result.totalPremium).toBe(20000)
  })
})
