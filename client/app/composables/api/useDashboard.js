import { isRef, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { clone, delay, mockError, shouldFail } from '~/mocks/_helpers'
import { dashboard as mockDashboard } from '~/mocks/dashboard'
import { useApiClient } from './useApiClient'
import { tenantPath } from '~/config/api'

export const useDashboard = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const data = ref(null)
  const pending = ref(true)
  const error = ref(null)

  const period = isRef(options)
    ? options
    : isRef(options?.period)
      ? options.period
      : ref(options?.period || 'month')

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
        const response = await apiFetch(tenantPath('/dashboard'), {
          params: { period: period.value },
        })
        data.value = response.data
      }
    } catch (requestError) {
      error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
    } finally {
      pending.value = false
    }
  }

  onMounted(load)

  if (isRef(options) || isRef(options?.period)) {
    watch(period, () => {
      load()
    })
  }

  return { data, pending, error, refresh: load, period }
}
