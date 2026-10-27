import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'
import { agents } from '~/mocks/agents'
import { delay } from '~/mocks/_helpers'

export const useAgentOptions = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const items = ref([])
  const pending = ref(false)

  const refresh = async () => {
    pending.value = true
    try {
      if (config.public.useMock) {
        await delay(config.public.mockDelay)
        items.value = agents
          .filter((agent) => agent.status === 'active')
          .map((agent) => ({
            id: agent.id,
            code: agent.code || agent.agentCode || '',
            name: agent.name,
            phone: agent.phone || '',
          }))
        return items.value
      }
      const response = await apiFetch(tenantPath('/agents/options'))
      items.value = response.data || []
      return items.value
    } finally {
      pending.value = false
    }
  }

  if (options.immediate !== false) onMounted(refresh)

  return { items, pending, refresh }
}
