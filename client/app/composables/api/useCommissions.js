import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError } from '~/mocks/_helpers'
import { useEntityList } from './useEntityList'
import { commissions } from '~/mocks/commissions'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useCommissions = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(commissions, {
    endpoint: tenantPath('/commissions'),
    searchKeys: ['agentName', 'policyNumber'],
    defaultFilters: { search: '', status: '' },
    ...options,
  })

  const pay = async (id) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const found = commissions.find((commission) => String(commission.id) === String(id))
      if (!found) throw mockError('ບໍ່ພົບຄອມມິດຊັ່ນ', 404)
      found.status = 'paid'
      found.paidAt = new Date().toISOString().slice(0, 10)
      return clone(found)
    }
    const response = await apiFetch(tenantPath(`/commissions/${id}/pay`), {
      method: 'POST',
    })
    return response.data
  }

  return { ...list, pay }
}
