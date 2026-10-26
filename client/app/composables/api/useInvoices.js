import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { clone, delay, nextId } from '~/mocks/_helpers'
import { invoices } from '~/mocks/invoices'
import { policies } from '~/mocks/policies'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { useRemoteStats } from './useRemoteStats'
import { tenantPath } from '~/config/api'
import { todayIso } from '~/utils/date'
import { calculateInvoiceStats } from '~/utils/stats'

const endpoint = tenantPath('/invoices')

export const useInvoices = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(invoices, {
    endpoint,
    searchKeys: ['invoiceNumber', 'policyNumber', 'customerName'],
    defaultFilters: { search: '', status: '' },
    ...options,
  })
  const { remoteStats, refreshStats } = useRemoteStats('/invoices')

  const stats = computed(() => {
    void list.total.value
    if (config.public.useMock) return calculateInvoiceStats(invoices)
    return (
      remoteStats.value || {
        total: list.total.value,
        unpaid: 0,
        overdue: 0,
        amount: 0,
      }
    )
  })

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(invoices)
      const policy = policies.find((item) => String(item.id) === String(payload.policyId))
      const year = String(new Date().getFullYear()).slice(-2)
      const invoice = {
        id,
        invoiceNumber: `INV-${year}-${String(id).padStart(4, '0')}`,
        policyId: Number(payload.policyId),
        policyNumber: policy?.policyNumber || '',
        customerName: policy?.customerName || payload.customerName || '',
        amount: Number(payload.amount) || Number(policy?.totalPremium) || 0,
        issuedDate: payload.issuedDate || todayIso(),
        dueDate: payload.dueDate || '',
        notes: payload.notes || payload.note || '',
        status: payload.status || 'unpaid',
      }
      invoices.unshift(invoice)
      return clone(invoice)
    }
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: payload,
    })
    await refreshStats()
    return response.data
  }

  return { ...list, stats, create, refreshStats }
}
