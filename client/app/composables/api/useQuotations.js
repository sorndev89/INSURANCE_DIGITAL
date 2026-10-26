import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { quotations } from '~/mocks/quotations'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

const endpoint = tenantPath('/quotations')

export const useQuotations = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(quotations, {
    endpoint,
    searchKeys: ['reference', 'customerName', 'productName'],
    defaultFilters: { search: '', status: '', productType: '' },
    ...options,
  })

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = quotations.find((quotation) => String(quotation.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບໃບສະເໜີລາຄາ', 404)
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}`)
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(quotations)
      const quotation = {
        id,
        reference: `QT-${String(26000 + id)}`,
        status: 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
        ...payload,
      }
      quotations.unshift(quotation)
      return clone(quotation)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    return response.data
  }

  return { ...list, getById, create }
}
