import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, shouldFail } from '~/mocks/_helpers'
import { dashboard as mockDashboard } from '~/mocks/dashboard'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useDashboard = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const data = ref(null)
  const pending = ref(true)
  const error = ref(null)

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      if (config.public.useMock) {
        await delay(config.public.mockDelay)
        if (shouldFail(config.public.mockFailureRate)) {
          throw mockError('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນພາບລວມໄດ້')
        }
        data.value = clone(mockDashboard)
      } else {
        const response = await apiFetch(tenantPath('/dashboard'))
        data.value = response.data
      }
    } catch (requestError) {
      error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
    } finally {
      pending.value = false
    }
  }

  onMounted(load)

  return { data, pending, error, refresh: load }
}
