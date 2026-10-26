import { beforeEach, describe, expect, it } from 'vitest'
import {
  CURRENCY_USER_KEY_PREFIX,
  effectiveCurrencyDisplay,
  formatCurrency,
  formatGroupedNumber,
  formatNumericDraft,
  resetCurrencyDisplayState,
  setCurrencyUser,
  setTenantCurrencyDisplay,
  setUserCurrencyDisplay,
  clearUserCurrencyDisplay,
} from '~/utils/currencyDisplay'

describe('currencyDisplay', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetCurrencyDisplayState()
  })

  it('formats the four supported layouts', () => {
    expect(formatCurrency(12850000)).toBe('₭ 12,850,000')
    expect(formatCurrency(12850000, { symbol: 'kip', position: 'suffix' })).toBe('12,850,000 ₭')
    expect(formatCurrency(12850000, { symbol: 'lak', position: 'prefix' })).toBe('LAK 12,850,000')
    expect(formatCurrency(12850000, { symbol: 'lak', position: 'suffix' })).toBe('12,850,000 LAK')
  })

  it('keeps the sign before the number and handles empty values', () => {
    expect(formatCurrency(-1000)).toBe('-₭ 1,000')
    expect(formatCurrency(-1000, { symbol: 'lak', position: 'suffix' })).toBe('-1,000 LAK')
    expect(formatCurrency(null)).toBe('₭ 0')
  })

  it('prefers user override, then tenant default, then app default', () => {
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'kip', position: 'prefix' })

    setTenantCurrencyDisplay({ symbol: 'lak', position: 'suffix' })
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'lak', position: 'suffix' })
    expect(formatCurrency(1000)).toBe('1,000 LAK')

    setCurrencyUser(7)
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'lak', position: 'suffix' })

    setUserCurrencyDisplay({ symbol: 'kip', position: 'prefix' })
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'kip', position: 'prefix' })
    expect(formatCurrency(1000)).toBe('₭ 1,000')

    clearUserCurrencyDisplay()
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'lak', position: 'suffix' })
  })

  it('persists user overrides per user id', () => {
    setCurrencyUser(1)
    setUserCurrencyDisplay({ symbol: 'lak', position: 'suffix' })
    expect(window.localStorage.getItem(`${CURRENCY_USER_KEY_PREFIX}1`)).toContain('suffix')

    setCurrencyUser(2)
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'kip', position: 'prefix' })

    setCurrencyUser(1)
    expect(effectiveCurrencyDisplay.value).toEqual({ symbol: 'lak', position: 'suffix' })
  })

  it('formats grouped numeric input drafts', () => {
    expect(formatGroupedNumber(1234567)).toBe('1,234,567')
    expect(formatGroupedNumber('2500000.5', { allowDecimal: true })).toBe('2,500,000.5')
    expect(formatNumericDraft('1234567')).toEqual({
      display: '1,234,567',
      value: 1234567,
    })
    expect(formatNumericDraft('12a34')).toEqual({ display: '1,234', value: 1234 })
    expect(formatNumericDraft('12.3.4', { allowDecimal: true })).toEqual({
      display: '12.34',
      value: 12.34,
    })
    expect(formatNumericDraft('', { allowDecimal: true })).toEqual({ display: '', value: '' })
    expect(formatNumericDraft('-', { allowNegative: true })).toEqual({
      display: '-',
      value: '',
    })
  })
})
