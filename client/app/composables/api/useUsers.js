import { useEntityList } from './useEntityList'
import { mockUsers, toPublicUser } from '~/mocks/users'
import { tenantPath } from '~/config/api'

const users = mockUsers.map(toPublicUser)

export const useUsers = (options = {}) =>
  useEntityList(users, {
    endpoint: tenantPath('/users'),
    searchKeys: ['username', 'name', 'email', 'phone'],
    defaultFilters: { search: '', role: '', status: '' },
    ...options,
  })
