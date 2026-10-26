import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useRemoteStats = (endpoint) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const remoteStats = ref(null)

  const refreshStats = async () => {
    if (config.public.useMock) return
    try {
      const response = await apiFetch(`${tenantPath(endpoint)}/stats`)
      remoteStats.value = response.data
    } catch {
      remoteStats.value = null
    }
  }

  onMounted(refreshStats)

  return { remoteStats, refreshStats }
}
