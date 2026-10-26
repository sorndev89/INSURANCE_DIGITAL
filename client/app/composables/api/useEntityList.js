import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import {
  clone,
  delay,
  filterItems,
  mockError,
  paginate,
  searchItems,
  shouldFail,
  sortItems,
} from '~/mocks/_helpers'
import { buildListQuery, parseListState } from '~/utils/query'
import { useApiClient } from './useApiClient'

export const useEntityList = (source, options = {}) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()
  const { apiFetch } = useApiClient()

  const defaults = { ...(options.defaultFilters || {}) }
  const useUrlState = options.querySync !== false
  const initial = useUrlState
    ? parseListState(route?.query, defaults)
    : { filters: defaults, page: 1, pageSize: null, sort: null }

  const filters = reactive({ ...defaults, ...initial.filters })
  const page = ref(initial.page)
  const pageSize = ref(initial.pageSize || options.pageSize || 10)
  const sort = ref(initial.sort || options.defaultSort || null)
  const items = ref([])
  const total = ref(0)
  const pending = ref(false)
  const error = ref(null)
  let requestId = 0

  const syncQuery = () => {
    if (!useUrlState || !router) return
    try {
      const query = buildListQuery({
        filters,
        page: page.value,
        sort: sort.value,
        base: { ...(route?.query || {}) },
      })
      void router.replace({ query })
    } catch {
      // URL sync is best-effort; navigation should never block data loading.
    }
  }

  const load = async () => {
    const currentRequest = ++requestId
    pending.value = true
    error.value = null

    try {
      if (config.public.useMock) {
        await delay(config.public.mockDelay)
        if (shouldFail(config.public.mockFailureRate)) {
          throw mockError(options.errorMessage || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້')
        }

        let rows = clone(source)
        rows = searchItems(rows, filters.search, options.searchKeys || [])
        rows = filterItems(rows, filters)
        rows = sortItems(rows, sort.value)
        const result = paginate(rows, page.value, pageSize.value)
        if (currentRequest !== requestId) return
        items.value = result.data
        total.value = result.meta.total
      } else {
        const response = await apiFetch(options.endpoint, {
          query: {
            ...filters,
            page: page.value,
            pageSize: pageSize.value,
            sort: sort.value ? `${sort.value.key}:${sort.value.order}` : undefined,
          },
        })
        if (currentRequest !== requestId) return
        items.value = response.data || []
        total.value = response.meta?.total ?? response.total ?? items.value.length
      }
    } catch (requestError) {
      if (currentRequest !== requestId) return
      error.value =
        requestError?.data?.error?.message || requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
    } finally {
      if (currentRequest === requestId) pending.value = false
    }
  }

  const setPage = (nextPage) => {
    page.value = Math.max(1, Number(nextPage) || 1)
  }

  const refresh = () => load()

  const handleFiltersChange = useDebounceFn(() => {
    if (page.value !== 1) {
      page.value = 1
      return
    }
    load()
    syncQuery()
  }, 300)

  watch(filters, handleFiltersChange, { deep: true })

  watch([page, sort], () => {
    syncQuery()
    load()
  })

  watch(pageSize, () => {
    syncQuery()
    load()
  })

  onMounted(() => {
    if (options.immediate !== false) load()
  })

  const query = computed(() => ({
    ...filters,
    page: page.value,
    pageSize: pageSize.value,
    sort: sort.value,
  }))

  return {
    items,
    total,
    page,
    pageSize,
    sort,
    pending,
    error,
    filters,
    query,
    refresh,
    setPage,
    load,
  }
}
