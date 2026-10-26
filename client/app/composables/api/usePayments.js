import { useEntityList } from './useEntityList'
import { payments } from '~/mocks/payments'
import { tenantPath } from '~/config/api'

export const usePayments = (options = {}) =>
  useEntityList(payments, {
    endpoint: tenantPath('/payments'),
    searchKeys: ['receiptNumber', 'invoiceNumber', 'customerName'],
    defaultFilters: { search: '', status: '', method: '' },
    ...options,
  })
