import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const tenant = useTenantStore()

  const apiFetch = (path, options = {}) =>
    $fetch(path, {
      baseURL: config.public.apiBase,
      ...options,
      headers: {
        ...(tenant.slug ? { 'X-Tenant': tenant.slug } : {}),
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        ...(options.headers || {}),
      },
    })

  return { apiFetch }
}
