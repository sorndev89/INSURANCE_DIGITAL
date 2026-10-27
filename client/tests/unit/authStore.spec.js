import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '~/stores/auth'

const Harness = defineComponent({
  setup() {
    return { auth: useAuthStore() }
  },
  template: '<div />',
})

const user = {
  id: 7,
  name: 'ສົມສັກ ມະນີວົງ',
  username: 'admin',
  email: 'admin@saiyfon.com',
  role: 'admin',
  phone: '020 5555 1234',
}

describe('auth store session handling', () => {
  let auth

  beforeEach(async () => {
    const wrapper = await mountSuspended(Harness)
    auth = wrapper.vm.auth
    auth.logout()
  })

  it('stores a normal login without the impersonation flag', () => {
    auth.setSession({ user, token: 'jwt-1' }, true)

    expect(auth.user).toEqual(user)
    expect(auth.token).toBe('jwt-1')
    expect(auth.impersonating).toBe(false)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('admin')
    expect(auth.can('policy.create')).toBe(true)
  })

  it('starts impersonation with a token but no user until /me resolves', () => {
    auth.beginImpersonation('impersonation-token')

    expect(auth.token).toBe('impersonation-token')
    expect(auth.user).toBeNull()
    expect(auth.impersonating).toBe(true)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('keeps the impersonation flag when /me fills the user', () => {
    auth.beginImpersonation('impersonation-token')
    auth.setSession({ user, token: 'impersonation-token' }, true, { impersonating: true })

    expect(auth.user).toEqual(user)
    expect(auth.impersonating).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('merges profile updates and keeps the session valid', () => {
    auth.setSession({ user, token: 'jwt-2' }, true)
    auth.updateUser({ name: 'ຊື່ໃໝ່', phone: '020 1111 2222' })

    expect(auth.user.name).toBe('ຊື່ໃໝ່')
    expect(auth.user.phone).toBe('020 1111 2222')
    expect(auth.user.email).toBe(user.email)
    expect(auth.token).toBe('jwt-2')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('uses server-provided role name, permissions and landing path', () => {
    auth.setSession(
      {
        user: { ...user, role: 'custom_ops' },
        token: 'jwt-1',
        roleName: 'ທີມປະຕິບັດງານ',
        permissions: ['policy.view'],
        landingPath: '/policies',
      },
      true,
    )

    expect(auth.role).toBe('custom_ops')
    expect(auth.roleLabel).toBe('ທີມປະຕິບັດງານ')
    expect(auth.landingPath).toBe('/policies')
    expect(auth.can('policy.view')).toBe(true)
    expect(auth.can('policy.create')).toBe(false)
  })

  it('clears all session state on logout', () => {
    auth.setSession({ user, token: 'jwt-3' }, true, { impersonating: true })
    auth.logout()

    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.impersonating).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('rejects an empty impersonation token', () => {
    expect(() => auth.beginImpersonation('')).toThrow('Impersonation token is required')
  })
})
