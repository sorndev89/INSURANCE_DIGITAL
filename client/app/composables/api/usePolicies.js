import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { policies } from '~/mocks/policies'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

const endpoint = tenantPath('/policies')

export const usePolicies = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(policies, {
    endpoint,
    searchKeys: ['policyNumber', 'customerName', 'customerPhone', 'vehiclePlate', 'agentName'],
    defaultFilters: { search: '', status: '', productType: '' },
    pageSize: 10,
    ...options,
  })

  const revision = ref(0)
  const remoteStats = ref(null)

  const loadStats = async () => {
    if (config.public.useMock) return
    try {
      const response = await apiFetch(`${endpoint}/stats`)
      remoteStats.value = response.data
    } catch {
      remoteStats.value = null
    }
  }

  onMounted(loadStats)

  const stats = computed(() => {
    revision.value
    if (!config.public.useMock && remoteStats.value) return remoteStats.value
    const now = new Date()
    const inThirtyDays = new Date(now)
    inThirtyDays.setDate(inThirtyDays.getDate() + 30)
    const rows = config.public.useMock ? policies : list.items.value
    const active = rows.filter((policy) => policy.status === 'active')
    const expiring = active.filter((policy) => {
      const endDate = new Date(policy.endDate)
      return endDate >= now && endDate <= inThirtyDays
    })
    const premium = rows.reduce((sum, policy) => sum + (Number(policy.totalPremium) || 0), 0)
    return {
      total: config.public.useMock ? policies.length : list.total.value,
      active: active.length,
      expiring: expiring.length,
      premium,
    }
  })

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = policies.find((policy) => String(policy.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບປະກັນໄພ', 404)
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}`)
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(policies)
      const now = new Date()
      const policy = {
        id,
        policyNumber: `P-${now.getFullYear()}-${String(id).padStart(6, '0')}`,
        ...payload,
        status: payload.status || 'pending',
        createdAt: now.toISOString().slice(0, 10),
      }
      policies.unshift(policy)
      revision.value += 1
      return clone(policy)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    await loadStats()
    return response.data
  }

  const updateStatus = async (id, status) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = policies.find((policy) => String(policy.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບປະກັນໄພ', 404)
      found.status = status
      revision.value += 1
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    await loadStats()
    return response.data
  }

  return { ...list, stats, getById, create, updateStatus }
}
