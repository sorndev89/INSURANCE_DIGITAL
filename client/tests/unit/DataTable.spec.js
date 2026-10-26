import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import DataTable from '~/components/ui/DataTable.vue'

const screenState = vi.hoisted(() => ({ form: 'desktop' }))

vi.mock('~/composables/useScreen', async () => {
  const { ref } = await import('vue')
  return {
    useScreen: () => ({ form: ref(screenState.form) }),
  }
})

const columns = [
  { key: 'number', label: 'ເລກທີ', sortable: true },
  { key: 'customer', label: 'ລູກຄ້າ' },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const rows = [
  { id: 1, number: 'P-001', customer: 'ສົມສັກ', status: 'active' },
  { id: 2, number: 'P-002', customer: 'ນິດຊາ', status: 'pending' },
]

describe('DataTable', () => {
  it('renders desktop rows and emits selection', async () => {
    screenState.form = 'desktop'
    const wrapper = await mountSuspended(DataTable, {
      props: { columns, rows, total: 2, pageSize: 10, selectable: true },
    })

    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('ສົມສັກ')

    await wrapper.find('tbody input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1]])
  })

  it('emits a sort event from a sortable header', async () => {
    screenState.form = 'desktop'
    const wrapper = await mountSuspended(DataTable, {
      props: { columns, rows, total: 2, pageSize: 10 },
    })

    await wrapper.find('thead button').trigger('click')
    expect(wrapper.emitted('update:sort')?.at(-1)).toEqual([{ key: 'number', order: 'asc' }])
  })

  it('renders empty and error states', async () => {
    screenState.form = 'desktop'
    const empty = await mountSuspended(DataTable, {
      props: { columns, rows: [], total: 0, pageSize: 10, emptyTitle: 'ບໍ່ມີຂໍ້ມູນ' },
    })
    expect(empty.text()).toContain('ບໍ່ມີຂໍ້ມູນ')

    const failed = await mountSuspended(DataTable, {
      props: { columns, rows: [], total: 0, pageSize: 10, error: 'ໂຫຼດບໍ່ສຳເລັດ' },
    })
    expect(failed.text()).toContain('ໂຫຼດບໍ່ສຳເລັດ')
  })

  it('renders cards on mobile', async () => {
    screenState.form = 'mobile'
    const wrapper = await mountSuspended(DataTable, {
      props: { columns, rows, total: 2, pageSize: 10 },
    })

    expect(wrapper.findAll('table')).toHaveLength(0)
    expect(wrapper.findAll('article[role="listitem"]')).toHaveLength(2)
  })
})
