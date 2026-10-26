import { describe, expect, it } from 'vitest'
import { PERM, getRolePermissions, hasPermission } from '~/config/permissions'

describe('permissions', () => {
  it('grants every permission to admin', () => {
    expect(hasPermission('admin', PERM.POLICY_DELETE)).toBe(true)
    expect(hasPermission('admin', PERM.SETTINGS_MANAGE)).toBe(true)
  })

  it('limits staff to operational permissions', () => {
    expect(hasPermission('staff', PERM.POLICY_CREATE)).toBe(true)
    expect(hasPermission('staff', PERM.USER_MANAGE)).toBe(false)
    expect(hasPermission('staff', PERM.SETTINGS_MANAGE)).toBe(false)
  })

  it('limits agent to own sales workflow', () => {
    expect(hasPermission('agent', PERM.POLICY_CREATE)).toBe(true)
    expect(hasPermission('agent', PERM.FINANCE_VIEW)).toBe(false)
    expect(hasPermission('agent', PERM.USER_MANAGE)).toBe(false)
  })

  it('limits customer to self-service permissions', () => {
    expect(hasPermission('customer', PERM.POLICY_VIEW)).toBe(true)
    expect(hasPermission('customer', PERM.CLAIM_CREATE)).toBe(true)
    expect(hasPermission('customer', PERM.CUSTOMER_VIEW)).toBe(false)
  })

  it('returns an empty list for an unknown role', () => {
    expect(getRolePermissions('unknown')).toEqual([])
    expect(hasPermission('unknown', PERM.POLICY_VIEW)).toBe(false)
  })

  it('treats a missing permission as allowed', () => {
    expect(hasPermission('customer', undefined)).toBe(false)
  })
})
