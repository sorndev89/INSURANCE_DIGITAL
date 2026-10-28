import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
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
    const response = await apiFetch(tenantPath(`/agents/${id}`))
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(agents)
      const agent = {
        id,
        userId: payload.userId || null,
        code: payload.code || `SB_${String(id).padStart(3, '0')}`,
        agentCode: payload.code || `SB_${String(id).padStart(3, '0')}`,
        name: payload.name || payload.username || '',
        email: payload.email || '',
        phone: payload.phone || '',
        dob: payload.dob || '',
        address: payload.address || '',
        idCardNumber: payload.idCardNumber || '',
        bankAccount: payload.bankAccount || '',
        teamId: payload.teamId || null,
        teamName: payload.teamName || '',
        level: payload.level || 'Junior',
        commissionRate: Number(payload.commissionRate) || 5,
        salesTarget: Number(payload.salesTarget) || 0,
        creditLimit: Number(payload.creditLimit) || 0,
        salesYtd: 0,
        points: 0,
        commissionBalance: 0,
        status: payload.status || 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      agents.unshift(agent)
      return clone(agent)
    }
    const response = await apiFetch(tenantPath('/agents'), {
      method: 'POST',
      body: payload,
    })
    return response.data
  }

  return { ...list, getById, create }
}
