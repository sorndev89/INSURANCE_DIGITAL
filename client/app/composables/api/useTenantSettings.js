import { useRuntimeConfig } from '#imports'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'
import { useTenantStore } from '~/stores/tenant'

const endpoint = tenantPath('/settings')

export const useTenantSettings = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const tenant = useTenantStore()

  const getSettings = async () => {
    if (config.public.useMock) {
      return {
        currency: tenant.currency,
        currencyDisplay: tenant.currencyDisplay,
      }
    }
    const response = await apiFetch(endpoint)
    return response.data
  }

  const updateCurrencyDisplay = async (currencyDisplay) => {
    if (config.public.useMock) {
      tenant.setCurrencyDisplay(currencyDisplay)
      return currencyDisplay
    }
    const response = await apiFetch(endpoint, {
      method: 'PATCH',
      body: { currencyDisplay },
    })
    const value = response.data?.currencyDisplay ?? null
    tenant.setCurrencyDisplay(value)
    return value
  }

  return { getSettings, updateCurrencyDisplay }
}
