import { ref } from 'vue'
import { $fetch } from 'ofetch'
import { navigateTo, useRuntimeConfig } from '#imports'
import { delay, mockError } from '~/mocks/_helpers'
import { findMockUser, mockUsers, toPublicUser } from '~/mocks/users'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { tenantPath } from '~/config/api'
import { messageFrom } from '~/utils/apiError'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const tenant = useTenantStore()
  const pending = ref(false)
  const error = ref(null)

  const tenantHeaders = () => (tenant.slug ? { 'X-Tenant': tenant.slug } : {})

  const login = async ({ email, password, remember = true }) => {
    pending.value = true
    error.value = null
    try {
      let session
      if (config.public.useMock) {
        await delay(config.public.mockDelay ?? 600)
        const user = findMockUser(email)
        if (!user || user.password !== password) {
          throw mockError('ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ', 401)
        }
        if (user.status !== 'active') {
          throw mockError('ບັນຊີນີ້ຖືກປິດໃຊ້ງານ', 403)
        }
        session = {
          user: toPublicUser(user),
          token: `mock.${user.role}.${user.id}.${Date.now()}`,
        }
      } else {
        const response = await $fetch(tenantPath('/auth/login'), {
          baseURL: config.public.apiBase,
          method: 'POST',
          body: { email, password },
          headers: tenantHeaders(),
        })
        session = response.data
        if (!session?.token || !session?.user) {
          throw new Error('Invalid login response')
        }
      }
      auth.setSession(session, remember)
      return session
    } catch (requestError) {
      error.value = messageFrom(requestError, 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ')
      throw requestError
    } finally {
      pending.value = false
    }
  }

  const me = async () => {
    if (config.public.useMock) {
      if (auth.impersonating && !auth.user) {
        const impersonated = toPublicUser(mockUsers[0])
        auth.setSession({ user: impersonated, token: auth.token }, true, { impersonating: true })
        return impersonated
      }
      return auth.user
    }
    const response = await $fetch(tenantPath('/auth/me'), {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${auth.token}`,
        ...tenantHeaders(),
      },
    })
    const user = response.data || response.user
    const { permissions, roleName, landingPath, ...profile } = user || {}
    auth.setSession(
      { user: profile, token: auth.token, permissions, roleName, landingPath },
      true,
      { impersonating: auth.impersonating },
    )
    return profile
  }

  const updateProfile = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay ?? 300)
      const updated = auth.updateUser({
        name: payload.name || auth.displayName,
        phone: payload.phone ?? auth.user?.phone ?? '',
      })
      return updated
    }
    const response = await $fetch(tenantPath('/auth/profile'), {
      baseURL: config.public.apiBase,
      method: 'PATCH',
      body: payload,
      headers: {
        Authorization: `Bearer ${auth.token}`,
        ...tenantHeaders(),
      },
    })
    const user = response.data || response.user
    const merged = auth.updateUser({
      ...user,
      name: user?.name || user?.username || payload.name,
      phone: user?.phone ?? payload.phone ?? '',
    })
    return merged
  }

  const logout = () => {
    auth.logout()
    return navigateTo('/login')
  }

  return { login, logout, me, updateProfile, pending, error }
}
