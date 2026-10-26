import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { customers } from '~/mocks/customers'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

const endpoint = tenantPath('/customers')

export const useCustomers = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(customers, {
    endpoint,
    searchKeys: ['code', 'fullName', 'phone', 'email'],
    defaultFilters: { search: '', status: '' },
    ...options,
  })

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = customers.find((customer) => String(customer.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບລູກຄ້າ', 404)
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}`)
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(customers)
      const customer = {
        id,
        code: `CUS-${String(id).padStart(5, '0')}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`.trim(),
        gender: payload.gender || 'other',
        dob: payload.dob || '',
        phone: payload.phone,
        email: payload.email || '',
        address: payload.address || '',
        idCardNumber: payload.idCardNumber || '',
        idCardImage: payload.idCardImage || '',
        occupation: payload.occupation || '',
        policiesCount: 0,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      customers.unshift(customer)
      return clone(customer)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    return response.data
  }

  const update = async (id, payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = customers.find((customer) => String(customer.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບລູກຄ້າ', 404)
      const firstName = payload.firstName ?? found.firstName
      const lastName = payload.lastName ?? found.lastName
      Object.assign(found, payload, {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
      })
      return clone(found)
    }
    const response = await apiFetch(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    return response.data
  }

  return { ...list, getById, create, update }
}
