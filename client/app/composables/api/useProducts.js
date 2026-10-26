import { useRuntimeConfig } from '#imports'
import { clone, delay } from '~/mocks/_helpers'
import { products } from '~/mocks/products'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useProducts = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()

  const list = async (query = {}) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      let rows = clone(products)
      if (query.type) rows = rows.filter((p) => p.type === query.type)
      if (query.companyId) rows = rows.filter((p) => p.companyId === Number(query.companyId))
      return rows
    }
    try {
      const response = await apiFetch(tenantPath('/products'), { query })
      return response.data || []
    } catch (err) {
      console.error('[useProducts] Error fetching products:', err)
      return clone(products)
    }
  }

  return { list }
}
