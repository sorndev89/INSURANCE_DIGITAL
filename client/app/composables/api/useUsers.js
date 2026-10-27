import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { DEMO_PASSWORD, mockUsers, toPublicUser } from '~/mocks/users'
import { tenantPath } from '~/config/api'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'

const endpoint = tenantPath('/users')
const users = mockUsers.map(toPublicUser)

export const useUsers = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()

  const list = useEntityList(users, {
    endpoint,
    searchKeys: ['name', 'username', 'email', 'phone'],
    defaultFilters: { search: '', role: '', status: '' },
    ...options,
  })

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(mockUsers)
      const user = {
        id,
        name: payload.name || payload.username,
        username: payload.username,
        email: payload.email,
        password: payload.password || DEMO_PASSWORD,
        role: payload.role || 'staff',
        phone: payload.phone || '',
        avatar: payload.avatar || '',
        status: payload.status || 'active',
        createdAt: new Date().toISOString(),
      }
      mockUsers.push(user)
      users.push(toPublicUser(user))
      return clone(toPublicUser(user))
    }
    const response = await apiFetch(endpoint, { method: 'POST', body: payload })
    return response.data
  }

  const update = async (id, payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = mockUsers.find((user) => String(user.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບຜູ້ໃຊ້', 404)
      Object.assign(found, payload)
      const publicUser = users.find((user) => String(user.id) === String(id))
      if (publicUser) Object.assign(publicUser, toPublicUser(found))
      return clone(toPublicUser(found))
    }
    const response = await apiFetch(`${endpoint}/${id}`, { method: 'PATCH', body: payload })
    return response.data
  }

  const remove = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const index = mockUsers.findIndex((user) => String(user.id) === String(id))
      if (index === -1) throw mockError('ບໍ່ພົບຜູ້ໃຊ້', 404)
      mockUsers.splice(index, 1)
      const publicIndex = users.findIndex((user) => String(user.id) === String(id))
      if (publicIndex !== -1) users.splice(publicIndex, 1)
      return true
    }
    await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
    return true
  }

  return { ...list, create, update, remove }
}
