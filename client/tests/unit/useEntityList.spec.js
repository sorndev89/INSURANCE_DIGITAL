import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useNuxtApp } from '#imports'
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/composables/api/useApiClient', () => ({
  useApiClient: () => ({ apiFetch: vi.fn() }),
}))

const state = vi.hoisted(() => ({ query: { page: '2' } }))

mockNuxtImport('useRoute', () => () => ({ path: '/', fullPath: '/', meta: {}, query: state.query }))

const { useEntityList } = await import('~/composables/api/useEntityList')

const rows = [
  { id: 1, name: 'Alpha One', status: 'active' },
  { id: 2, name: 'Alpha Two', status: 'active' },
  { id: 3, name: 'Beta One', status: 'inactive' },
  { id: 4, name: 'Beta Two', status: 'active' },
  { id: 5, name: 'Gamma', status: 'inactive' },
]

const LocalHarness = defineComponent({
  setup() {
    return {
      list: useEntityList(rows, {
        searchKeys: ['name'],
        defaultFilters: { search: '', status: '' },
        pageSize: 2,
        querySync: false,
      }),
    }
  },
  template: '<div />',
})

const Harness = defineComponent({
  setup() {
    return {
      list: useEntityList(rows, {
        searchKeys: ['name'],
        defaultFilters: { search: '', status: '' },
        pageSize: 2,
      }),
    }
  },
  template: '<div />',
})

const listReplaceCalls = () =>
  replaceSpy.mock.calls.filter(([target]) => target && typeof target === 'object' && target.query)

const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 350))
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 10))
  await flushPromises()
}

let router
let replaceSpy

describe('useEntityList URL query synchronization', () => {
  beforeEach(async () => {
    const nuxt = useNuxtApp()
    nuxt.$config.public.useMock = true
    nuxt.$config.public.mockDelay = 0
    nuxt.$config.public.mockFailureRate = 0
    state.query = { page: '2' }
    router = nuxt.$router
    await router.replace({ path: '/', query: {} })
    replaceSpy = vi.spyOn(router, 'replace')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hydrates page and filters from the URL on first load', async () => {
    const wrapper = await mountSuspended(Harness)
    await settle()

    expect(wrapper.vm.list.page.value).toBe(2)
    expect(wrapper.vm.list.items.value.map((row) => row.id)).toEqual([3, 4])
    expect(wrapper.vm.list.total.value).toBe(5)
    expect(listReplaceCalls()).toHaveLength(0)
  })

  it('writes filters to the URL and resets to page 1', async () => {
    const wrapper = await mountSuspended(Harness)
    await settle()

    wrapper.vm.list.filters.search = 'Alpha'
    await settle()

    expect(wrapper.vm.list.page.value).toBe(1)
    expect(wrapper.vm.list.items.value.map((row) => row.id)).toEqual([1, 2])
    expect(listReplaceCalls()).toHaveLength(1)
    expect(listReplaceCalls().at(-1)[0].query).toEqual({ search: 'Alpha' })
  })

  it('can opt out of URL state for auxiliary dropdown lists', async () => {
    const wrapper = await mountSuspended(LocalHarness)
    await settle()

    expect(wrapper.vm.list.page.value).toBe(1)
    expect(wrapper.vm.list.items.value.map((row) => row.id)).toEqual([1, 2])
    expect(listReplaceCalls()).toHaveLength(0)
  })

  it('keeps the sort expression in the URL', async () => {
    const wrapper = await mountSuspended(Harness)
    await settle()

    wrapper.vm.list.sort.value = { key: 'name', order: 'desc' }
    await settle()

    expect(listReplaceCalls().at(-1)[0].query).toEqual({
      page: '2',
      sort: 'name:desc',
    })
  })
})
