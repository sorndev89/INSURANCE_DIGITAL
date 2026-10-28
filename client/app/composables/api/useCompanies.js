import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, nextId } from '~/mocks/_helpers'
import { insurers } from '~/mocks/insurers'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useCompanies = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()

  const list = async () => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      return clone(insurers)
    }
    try {
      const response = await apiFetch(tenantPath('/companies'))
      return response.data || []
    } catch (err) {
      console.error('[useCompanies] Error fetching companies:', err)
      return clone(insurers)
    }
  }

  const getById = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = insurers.find((item) => String(item.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບບໍລິສັດປະກັນໄພ', 404)
      return clone(found)
    }
    const response = await apiFetch(tenantPath(`/companies/${id}`))
    return response.data
  }

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(insurers)
      const insurer = {
        id,
        code: payload.code || `INS${id}`,
        name: payload.name || '',
        nameLao: payload.nameLao || payload.name || '',
        shortName: payload.shortName || payload.name || '',
        contactPerson: payload.contactPerson || '',
        contactPhone: payload.contactPhone || '',
        claimsHotline: payload.claimsHotline || '',
        address: payload.address || '',
        defaultCommissionRate: Number(payload.defaultCommissionRate) || 15,
        creditDays: Number(payload.creditDays) || 30,
        status: payload.status || 'active',
        logo: payload.logo || '',
        commissionRates: { Motor: 15, Health: 15, Fire: 15, Accident: 15, Travel: 15 },
      }
      insurers.push(insurer)
      return clone(insurer)
    }
    const response = await apiFetch(tenantPath('/companies'), { method: 'POST', body: payload })
    return response.data
  }

  const update = async (id, payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = insurers.find((item) => String(item.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບບໍລິສັດປະກັນໄພ', 404)
      Object.assign(found, {
        ...payload,
        defaultCommissionRate:
          payload.defaultCommissionRate !== undefined
            ? Number(payload.defaultCommissionRate)
            : found.defaultCommissionRate,
        creditDays:
          payload.creditDays !== undefined ? Number(payload.creditDays) : found.creditDays,
      })
      return clone(found)
    }
    const response = await apiFetch(tenantPath(`/companies/${id}`), {
      method: 'PATCH',
      body: payload,
    })
    return response.data
  }

  const remove = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const index = insurers.findIndex((item) => String(item.id) === String(id))
      if (index === -1) throw mockError('ບໍ່ພົບບໍລິສັດປະກັນໄພ', 404)
      insurers.splice(index, 1)
      return true
    }
    await apiFetch(tenantPath(`/companies/${id}`), { method: 'DELETE' })
    return true
  }

  const updateCommissionRate = async (id, productType, rate) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = insurers.find((item) => String(item.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບບໍລິສັດປະກັນໄພ', 404)
      found.commissionRates = { ...found.commissionRates, [productType]: Number(rate) || 0 }
      return clone(found)
    }
    const response = await apiFetch(tenantPath(`/companies/${id}/commission-rates`), {
      method: 'PATCH',
      body: { productType, rate },
    })
    return response.data
  }

  return { list, getById, create, update, remove, updateCommissionRate }
}
