import { useEntityList } from './useEntityList'
import { invoices } from '~/mocks/invoices'
import { tenantPath } from '~/config/api'

export const useInvoices = (options = {}) =>
  useEntityList(invoices, {
    endpoint: tenantPath('/invoices'),
    searchKeys: ['invoiceNumber', 'policyNumber', 'customerName'],
    defaultFilters: { search: '', status: '' },
    ...options,
  })
