import { $fetch } from 'ofetch'
import { navigateTo, useRoute, useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { useToast } from '~/composables/useToast'
import {
  UNAUTHORIZED_MESSAGE,
  buildLoginLocation,
  createUnauthorizedHandler,
} from '~/utils/apiError'

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const tenant = useTenantStore()
  const toast = useToast()
  const route = useRoute()

  const handleUnauthorized = createUnauthorizedHandler({
    logout: () => auth.logout(),
    isAuthenticated: () => auth.isAuthenticated,
    isLoginRoute: () => route?.path === '/login',
    notify: () => toast.warning(UNAUTHORIZED_MESSAGE),
    redirect: () => navigateTo(buildLoginLocation(route?.fullPath || '/')),
  })

  const apiFetch = async (path, options = {}) => {
    try {
      return await $fetch(path, {
        baseURL: config.public.apiBase,
        ...options,
        headers: {
          ...(tenant.slug ? { 'X-Tenant': tenant.slug } : {}),
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
          ...(options.headers || {}),
        },
      })
    } catch (requestError) {
      handleUnauthorized(requestError)
      throw requestError
    }
  }

  return { apiFetch }
}
