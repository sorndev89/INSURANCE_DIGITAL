import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { clone, delay, nextId } from '~/mocks/_helpers'
import { invoices } from '~/mocks/invoices'
import { payments } from '~/mocks/payments'
import { useEntityList } from './useEntityList'
import { useApiClient } from './useApiClient'
import { useRemoteStats } from './useRemoteStats'
import { tenantPath } from '~/config/api'
import { todayIso } from '~/utils/date'
import { calculatePaymentStats } from '~/utils/stats'

const endpoint = tenantPath('/payments')

export const usePayments = (options = {}) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const list = useEntityList(payments, {
    endpoint,
    searchKeys: ['receiptNumber', 'invoiceNumber', 'customerName'],
    defaultFilters: { search: '', status: '', method: '' },
    ...options,
  })
  const { remoteStats, refreshStats } = useRemoteStats('/payments')

  const stats = computed(() => {
    void list.total.value
    if (config.public.useMock) return calculatePaymentStats(payments)
    return (
      remoteStats.value || {
        total: list.total.value,
        today: 0,
        month: 0,
        pending: 0,
      }
    )
  })

  const create = async (payload) => {
    if (config.public.useMock) {
      await delay(config.public.mockDelay)
      const id = nextId(payments)
      const invoice = invoices.find((item) => String(item.id) === String(payload.invoiceId))
      const year = String(new Date().getFullYear()).slice(-2)
      const status = payload.status || 'completed'
      const payment = {
        id,
        receiptNumber: `RCP-${year}-${String(id).padStart(4, '0')}`,
        invoiceId: Number(payload.invoiceId),
        invoiceNumber: invoice?.invoiceNumber || '',
        customerName: invoice?.customerName || '',
        amount: Number(payload.amount) || Number(invoice?.amount) || 0,
        method: payload.method || 'cash',
        paidAt: payload.paidAt || (status === 'completed' ? todayIso() : ''),
        slipUrl: payload.slipUrl || '',
        status,
      }
      payments.unshift(payment)
      if (status === 'completed' && invoice) invoice.status = 'paid'
      return clone(payment)
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
