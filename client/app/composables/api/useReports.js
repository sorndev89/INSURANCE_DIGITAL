import { onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { delay, mockError, shouldFail } from '~/mocks/_helpers'
import { buildReportMock } from '~/mocks/reports'
import { useApiClient } from './useApiClient'
import { useToast } from '~/composables/useToast'
import { tenantPath } from '~/config/api'

const ENDPOINTS = {
  summary: '/reports/summary',
  sales: '/reports/sales',
  policies: '/reports/policies',
  quotations: '/reports/quotations',
  claims: '/reports/claims',
  customers: '/reports/customers',
  agents: '/reports/agents',
  teams: '/reports/teams',
  commissions: '/reports/commissions',
  finance: '/reports/finance',
}

export const REPORT_TYPES = Object.keys(ENDPOINTS)

export const useReport = (type, range) => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const data = ref(null)
  const pending = ref(true)
  const error = ref(null)
  let requestId = 0

  const load = async () => {
    const current = ++requestId
    pending.value = true
    error.value = null
    try {
      if (config.public.useMock) {
        await delay(config.public.mockDelay)
        if (shouldFail(config.public.mockFailureRate)) {
          throw mockError('ບໍ່ສາມາດໂຫຼດລາຍງານໄດ້')
        }
        data.value = buildReportMock(type, { from: range.from, to: range.to })
      } else {
        const response = await apiFetch(tenantPath(ENDPOINTS[type]), {
          query: {
            from: range.from || undefined,
            to: range.to || undefined,
          },
        })
        data.value = response.data
      }
    } catch (requestError) {
      if (current !== requestId) return
      error.value =
        requestError?.data?.error?.message || requestError?.message || 'ບໍ່ສາມາດໂຫຼດລາຍງານໄດ້'
    } finally {
      if (current === requestId) pending.value = false
    }
  }

  watch(
    () => [range.from, range.to],
    () => {
      load()
    },
  )

  onMounted(load)

  return { data, pending, error, refresh: load }
}

export const useReports = (types, range) => {
  const reports = {}
  types.forEach((type) => {
    reports[type] = useReport(type, range)
  })

  const data = (type) => reports[type]?.data
  const pending = (type) => reports[type]?.pending
  const error = (type) => reports[type]?.error
  const refresh = () => Promise.all(types.map((type) => reports[type].refresh()))

  return { reports, data, pending, error, refresh }
}

const CSV_LABELS = {
  range: 'ໄລຍະ',
  from: 'ຈາກວັນທີ',
  to: 'ຮອດວັນທີ',
  month: 'ເດືອນ',
  label: 'ລາຍການ',
  value: 'ມູນຄ່າ',
  amount: 'ຈຳນວນເງິນ',
  count: 'ຈຳນວນ',
  name: 'ຊື່',
  status: 'ສະຖານະ',
  key: 'ລະຫັດ',
}

const escapeCsv = (value) => {
  if (value === null || value === undefined) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

const rowsToCsv = (rows) => {
  if (!rows.length) return ''
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set()),
  )
  const lines = [headers.map((header) => escapeCsv(CSV_LABELS[header] || header)).join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(','))
  })
  return lines.join('\n')
}

const mockCsv = (data) => {
  if (!data || typeof data !== 'object') return ''
  const sections = []
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const rows = value.filter((row) => row && typeof row === 'object')
      if (!rows.length) return
      sections.push('')
      sections.push(escapeCsv(CSV_LABELS[key] || key))
      sections.push(rowsToCsv(rows))
      return
    }
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([childKey, childValue]) => {
        if (Array.isArray(childValue) || (childValue && typeof childValue === 'object')) return
        sections.push(
          [escapeCsv(CSV_LABELS[childKey] || childKey), escapeCsv(childValue)].join(','),
        )
      })
      return
    }
    sections.push([escapeCsv(CSV_LABELS[key] || key), escapeCsv(value)].join(','))
  })
  return sections.join('\n')
}

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const useReportExport = () => {
  const config = useRuntimeConfig()
  const { apiFetch } = useApiClient()
  const toast = useToast()
  const exporting = ref(false)

  const exportReport = async (type, range, format = 'csv') => {
    if (exporting.value) return
    exporting.value = true
    try {
      if (config.public.useMock && format === 'csv') {
        const data = buildReportMock(type, { from: range.from, to: range.to })
        const blob = new Blob([`\uFEFF${mockCsv(data)}`], { type: 'text/csv;charset=utf-8' })
        triggerDownload(blob, `report-${type}-${range.from}-${range.to}.csv`)
      } else {
        const blob = await apiFetch(tenantPath('/reports/export'), {
          query: { type, from: range.from, to: range.to, format },
          responseType: 'blob',
        })
        triggerDownload(blob, `report-${type}-${range.from}-${range.to}.${format}`)
      }
      toast.success('ດາວໂຫຼດລາຍງານແລ້ວ')
    } catch (error) {
      toast.error(error?.data?.error?.message || error?.message || 'ບໍ່ສາມາດ Export ໄດ້')
    } finally {
      exporting.value = false
    }
  }

  return { exportReport, exporting }
}
