import { describe, expect, it, vi } from 'vitest'
import {
  UNAUTHORIZED_MESSAGE,
  buildLoginLocation,
  createUnauthorizedHandler,
  errorStatus,
  isUnauthorized,
  messageFrom,
} from '~/utils/apiError'

describe('apiError helpers', () => {
  it('detects status from every supported error shape', () => {
    expect(errorStatus({ response: { status: 401 } })).toBe(401)
    expect(errorStatus({ statusCode: 500 })).toBe(500)
    expect(errorStatus({ status: 404 })).toBe(404)
    expect(errorStatus(null)).toBeNull()
    expect(isUnauthorized({ response: { status: 401 } })).toBe(true)
    expect(isUnauthorized({ statusCode: 401 })).toBe(true)
    expect(isUnauthorized({ statusCode: 403 })).toBe(false)
    expect(isUnauthorized(new Error('network'))).toBe(false)
  })

  it('extracts the most specific error message', () => {
    expect(messageFrom({ data: { error: { message: 'bad input' } } })).toBe('bad input')
    expect(messageFrom({ data: { error: 'forbidden' } })).toBe('forbidden')
    expect(messageFrom({ message: 'offline' })).toBe('offline')
    expect(messageFrom({ statusMessage: 'slow down' })).toBe('slow down')
    expect(messageFrom({}, 'fallback')).toBe('fallback')
    expect(messageFrom({ message: '   ' }, 'fallback')).toBe('fallback')
  })

  it('builds a safe login redirect only for internal paths', () => {
    expect(buildLoginLocation('/customers?page=2')).toEqual({
      path: '/login',
      query: { redirect: '/customers?page=2' },
    })
    expect(buildLoginLocation('/')).toEqual({ path: '/login', query: undefined })
    expect(buildLoginLocation('/login')).toEqual({ path: '/login', query: undefined })
    expect(buildLoginLocation('/login?redirect=/dashboard')).toEqual({
      path: '/login',
      query: undefined,
    })
    expect(buildLoginLocation('//evil.example')).toEqual({ path: '/login', query: undefined })
    expect(buildLoginLocation(null)).toEqual({ path: '/login', query: undefined })
  })

  it('logs out and redirects exactly once for an expired session', () => {
    const logout = vi.fn()
    const redirect = vi.fn()
    const notify = vi.fn()
    const handler = createUnauthorizedHandler({
      logout,
      redirect,
      notify,
      isAuthenticated: () => true,
    })

    expect(handler({ statusCode: 500 })).toBe(false)
    expect(logout).not.toHaveBeenCalled()

    expect(handler({ response: { status: 401 } })).toBe(true)
    expect(logout).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith()
    expect(redirect).toHaveBeenCalledTimes(1)

    expect(handler({ statusCode: 401 })).toBe(true)
    expect(logout).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledTimes(1)
  })

  it('does not redirect on the login route or when already logged out', () => {
    const logout = vi.fn()
    const redirect = vi.fn()
    const notify = vi.fn()

    const onLogin = createUnauthorizedHandler({
      logout,
      redirect,
      notify,
      isLoginRoute: () => true,
    })
    expect(onLogin({ status: 401 })).toBe(true)
    expect(logout).toHaveBeenCalledTimes(1)
    expect(redirect).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()

    const loggedOut = createUnauthorizedHandler({
      logout: vi.fn(),
      redirect: vi.fn(),
      notify: vi.fn(),
      isAuthenticated: () => false,
    })
    expect(loggedOut({ status: 401 })).toBe(false)
  })

  it('exposes a Lao expiry message', () => {
    expect(UNAUTHORIZED_MESSAGE).toContain('ໝົດອາຍຸ')
  })
})
