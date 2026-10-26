import { describe, expect, it } from 'vitest'
import {
  IMPERSONATE_PARAM,
  isSafeInternalPath,
  omitQueryKey,
  readImpersonationToken,
} from '~/utils/impersonation'

describe('impersonation helpers', () => {
  it('reads and trims the impersonation token', () => {
    expect(readImpersonationToken({ [IMPERSONATE_PARAM]: '  abc.def  ' })).toBe('abc.def')
  })

  it('ignores missing, blank, or non-string tokens', () => {
    expect(readImpersonationToken({})).toBe('')
    expect(readImpersonationToken({ [IMPERSONATE_PARAM]: '' })).toBe('')
    expect(readImpersonationToken({ [IMPERSONATE_PARAM]: ['a', 'b'] })).toBe('')
    expect(readImpersonationToken(undefined)).toBe('')
  })

  it('removes only the impersonation query parameter', () => {
    expect(
      omitQueryKey(
        { [IMPERSONATE_PARAM]: 'token', redirect: '/dashboard', page: '2' },
        IMPERSONATE_PARAM,
      ),
    ).toEqual({ redirect: '/dashboard', page: '2' })
    expect(omitQueryKey(undefined, IMPERSONATE_PARAM)).toEqual({})
  })

  it('accepts only internal redirect paths', () => {
    expect(isSafeInternalPath('/dashboard')).toBe(true)
    expect(isSafeInternalPath('/')).toBe(true)
    expect(isSafeInternalPath('//evil.example')).toBe(false)
    expect(isSafeInternalPath('https://evil.example')).toBe(false)
    expect(isSafeInternalPath('')).toBe(false)
    expect(isSafeInternalPath(null)).toBe(false)
  })
})
