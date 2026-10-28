import { useToast } from '~/composables/useToast'

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const csvCell = (value) => {
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

const download = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const tableHtml = ({ title, columns, rows }) => `
  <table border="1" cellspacing="0" cellpadding="6">
    <caption><strong>${escapeHtml(title)}</strong></caption>
    <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${columns
              .map((column) => `<td>${escapeHtml(row[column.key] ?? '')}</td>`)
              .join('')}</tr>`,
        )
        .join('')}
    </tbody>
  </table>
`

export const useExport = () => {
  const toast = useToast()

  const exportCsv = ({ filename = 'report', columns = [], rows = [] }) => {
    if (!import.meta.client) return
    const header = columns.map((column) => csvCell(column.label)).join(',')
    const body = rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(','))
    download(`\uFEFF${[header, ...body].join('\n')}`, `${filename}.csv`, 'text/csv;charset=utf-8')
    toast.success('ດາວໂຫຼດ CSV ແລ້ວ')
  }

  const exportExcel = ({ filename = 'report', title = 'Report', columns = [], rows = [] }) => {
    if (!import.meta.client) return
    const html = `<html><head><meta charset="utf-8"></head><body>${tableHtml({
      title,
      columns,
      rows,
    })}</body></html>`
    download(html, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8')
    toast.success('ດາວໂຫຼດ Excel ແລ້ວ')
  }

  const exportPdf = ({ title = 'Report', columns = [], rows = [] }) => {
    if (!import.meta.client) return
    const win = window.open('', '_blank', 'width=1024,height=768')
    if (!win) {
      toast.warning('ກະລຸນາອະນຸຍາດ Popup ເພື່ອພິມ PDF')
      return
    }
    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: 'Noto Sans Lao', sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <p>ສາຍຝົນ ນາຍໜ້າປະກັນໄພ · ${new Date().toLocaleString('lo-LA')}</p>
          ${tableHtml({ title, columns, rows })}
          <script>window.onload = () => { window.print(); }${'</scr' + 'ipt>'}
        </body>
      </html>
    `)
    win.document.close()
    toast.info('ເປີດໜ້າພິມ PDF ແລ້ວ')
  }

  const exportData = (payload, format = 'csv') => {
    if (format === 'xlsx' || format === 'excel') return exportExcel(payload)
    if (format === 'pdf') return exportPdf(payload)
    return exportCsv(payload)
  }

  return { exportCsv, exportExcel, exportPdf, exportData }
}
