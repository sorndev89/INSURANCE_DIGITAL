import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'
import { clone, delay, nextId } from '~/mocks/_helpers'
import {
  LANDING_PATHS,
  PERMISSION_GROUPS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  SYSTEM_PERMISSIONS,
} from '~/config/permissions'

const endpoint = tenantPath('/roles')

const mockRoles = []
const mockSeed = () => {
  if (mockRoles.length) return mockRoles
  const landing = { admin: '/dashboard', staff: '/dashboard', agent: '/home', customer: '/home' }
  for (const [index, key] of ['admin', 'staff', 'agent', 'customer'].entries()) {
    mockRoles.push({
      id: index + 1,
      key,
      name: ROLE_LABELS[key],
      description: ROLE_DESCRIPTIONS[key],
      permissions: [...ROLE_PERMISSIONS[key]],
      isSystem: true,
      isAdmin: key === 'admin',
      landingPath: landing[key],
      userCount: 0,
    })
  }
  return mockRoles
}

const mockCatalog = () => ({
  groups: PERMISSION_GROUPS,
  system: { key: 'system', title: 'ລະບົບ (ສະເພາະ admin)', permissions: SYSTEM_PERMISSIONS },
  landingPaths: LANDING_PATHS,
})

export const useRoles = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()

  const list = async () => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      return clone(mockSeed())
    }
    const response = await apiFetch(endpoint)
    return response.data || []
  }

  const catalog = async () => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      return mockCatalog()
    }
    const response = await apiFetch(`${endpoint}/permissions`)
    return response.data
  }

  const options = async () => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      return mockSeed().map((role) => ({
        id: role.id,
        key: role.key,
        name: role.name,
        isSystem: role.isSystem,
        isAdmin: role.isAdmin,
      }))
    }
    const response = await apiFetch(`${endpoint}/options`)
    return response.data || []
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const roles = mockSeed()
      const id = nextId(roles)
      const baseKey = String(payload.name || 'role')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const role = {
        id,
        key: baseKey || `role-${id}`,
        name: payload.name,
        description: payload.description || '',
        permissions: [...(payload.permissions || [])],
        isSystem: false,
        isAdmin: false,
        landingPath: payload.landingPath || '/dashboard',
        userCount: 0,
      }
      roles.push(role)
      return clone(role)
    }
    const response = await apiFetch(endpoint, { method: 'POST', body: payload })
    return response.data
  }

  const update = async (id, payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const role = mockSeed().find((item) => item.id === id)
      if (!role) throw new Error('Role not found')
      Object.assign(role, payload)
      return clone(role)
    }
    const response = await apiFetch(`${endpoint}/${id}`, { method: 'PATCH', body: payload })
    return response.data
  }

  const remove = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const index = mockSeed().findIndex((item) => item.id === id)
      if (index >= 0) mockSeed().splice(index, 1)
      return true
    }
    await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
    return true
  }

  return { list, catalog, options, create, update, remove }
}

export const useRoleOptions = (options = {}) => {
  const { options: fetchOptions } = useRoles()
  const items = ref([])
  const pending = ref(false)

  const refresh = async () => {
    pending.value = true
    try {
      items.value = await fetchOptions()
      return items.value
    } catch {
      return items.value
    } finally {
      pending.value = false
    }
  }

  if (options.immediate !== false) onMounted(refresh)

  return { items, pending, refresh }
}
