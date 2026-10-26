import { useRuntimeConfig } from '#imports'
import { clone, delay } from '~/mocks/_helpers'
import { companies } from '~/mocks/companies'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useCompanies = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()

  const list = async () => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      return clone(companies)
    }
    try {
      const response = await apiFetch(tenantPath('/companies'))
      return response.data || []
    } catch (err) {
      // ຖ້າ api error ໃນຂະນະ dev ໃຫ້ fallback ແຈ້ງເຕືອນ
      console.error('[useCompanies] Error fetching companies:', err)
      return clone(companies)
    }
  }

  return { list }
}
