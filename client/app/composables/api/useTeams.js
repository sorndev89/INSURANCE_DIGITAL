import { useRuntimeConfig } from '#imports'
import { clone, delay, nextId } from '~/mocks/_helpers'
import { useEntityList } from './useEntityList'
import { teams } from '~/mocks/teams'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

const endpoint = tenantPath('/teams')

export const useTeams = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(teams, {
    endpoint,
    searchKeys: ['name', 'location', 'headName'],
    defaultFilters: { search: '' },
    ...options,
  })

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(teams)
      const team = {
        id,
        name: payload.name,
        headName: payload.headName || '',
        location: payload.location || '',
        members: Number(payload.members) || 0,
        monthlySales: Number(payload.monthlySales) || 0,
        status: payload.status || 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      teams.unshift(team)
      return clone(team)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    return response.data
  }

  return { ...list, create }
}
