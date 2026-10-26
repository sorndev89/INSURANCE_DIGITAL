import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { claims } from '~/mocks/claims'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

const endpoint = tenantPath('/claims')

export const useClaims = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(claims, {
    endpoint,
    searchKeys: ['claimNumber', 'policyNumber', 'claimant', 'type'],
    defaultFilters: { search: '', status: '', type: '' },
    ...options,
  })

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = claims.find((claim) => String(claim.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບເຄມ', 404)
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}`)
    return response.data
  }

  const updateStatus = async (id, status) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = claims.find((claim) => String(claim.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບເຄມ', 404)
      found.status = status
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(claims)
      const now = new Date()
      const claim = {
        id,
        claimNumber: `CLM-${String(now.getFullYear()).slice(-2)}-${String(id).padStart(3, '0')}`,
        status: 'pending',
        attachments: payload.attachments || [],
        createdAt: now.toISOString().slice(0, 10),
        ...payload,
      }
      claims.unshift(claim)
      return clone(claim)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    return response.data
  }

  return { ...list, getById, create, updateStatus }
}
