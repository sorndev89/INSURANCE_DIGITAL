import { describe, expect, it } from 'vitest'
import {
  MESSAGES,
  date,
  email,
  maxLength,
  minLength,
  numeric,
  phone,
  required,
  validate,
} from '~/utils/validators'

describe('validators', () => {
  it('requires a non-empty value', () => {
    expect(required('')).toBe(MESSAGES.required)
    expect(required('   ')).toBe(MESSAGES.required)
    expect(required('ok')).toBe('')
  })

  it('validates email addresses', () => {
    expect(email('agent@saiyfon.com')).toBe('')
    expect(email('not-an-email')).toBe(MESSAGES.email)
    expect(email('')).toBe('')
  })

  it('validates Lao phone numbers', () => {
    expect(phone('020 5555 1234')).toBe('')
    expect(phone('2055551234')).toBe('')
    expect(phone('1234')).toBe(MESSAGES.phone)
    expect(phone('')).toBe('')
  })

  it('validates numbers, lengths, and dates', () => {
    expect(numeric('12')).toBe('')
    expect(numeric('abc')).toBe(MESSAGES.number)
    expect(minLength(3)('ab')).toBe(MESSAGES.minLength(3))
    expect(maxLength(3)('abcd')).toBe(MESSAGES.maxLength(3))
    expect(date('2026-10-25')).toBe('')
    expect(date('bad-date')).toBe(MESSAGES.date)
  })

  it('returns the first validation error', () => {
    expect(validate('', [required, email])).toBe(MESSAGES.required)
    expect(validate('bad', [required, email])).toBe(MESSAGES.email)
    expect(validate('agent@saiyfon.com', [required, email])).toBe('')
  })
})
