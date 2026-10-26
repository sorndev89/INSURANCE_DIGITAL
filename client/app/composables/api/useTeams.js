import { useEntityList } from './useEntityList'
import { teams } from '~/mocks/teams'
import { tenantPath } from '~/config/api'

export const useTeams = (options = {}) =>
  useEntityList(teams, {
    endpoint: tenantPath('/teams'),
    searchKeys: ['name', 'location', 'headName'],
    defaultFilters: { search: '' },
    ...options,
  })
