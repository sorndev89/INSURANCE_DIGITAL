import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError } from '~/mocks/_helpers'
import { useEntityList } from './useEntityList'
import { agents } from '~/mocks/agents'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useAgents = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(agents, {
    endpoint: tenantPath('/agents'),
    searchKeys: ['code', 'name', 'phone', 'email', 'teamName'],
    defaultFilters: { search: '', status: '', teamId: '' },
    ...options,
  })

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = agents.find((agent) => String(agent.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບຕົວແທນ', 404)
      return clone(found)
    }
    const response = await apiFetch(`/agents/${id}`)
    return response.data
  }

  return { ...list, getById }
}
