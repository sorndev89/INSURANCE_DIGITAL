import { formatCurrency } from '~/utils/currencyDisplay'

export const useFormat = () => {
  const number = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '0'
    return new Intl.NumberFormat('en-US').format(numeric)
  }

  const currency = (value, options) => formatCurrency(value, options)

  const date = (value) => {
    if (!value) return '—'
    if (typeof value === 'string') {
      const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    const day = String(parsed.getDate()).padStart(2, '0')
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${parsed.getFullYear()}`
  }

  const phone = (value) => {
    if (!value) return '—'
    let digits = String(value).replace(/\D/g, '')
    if (digits.startsWith('856')) digits = `0${digits.slice(3)}`
    if (digits.length === 10 && digits.startsWith('20')) digits = `0${digits}`
    if (digits.length === 11) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
    }
    return String(value)
  }

  const percent = (value, digits = 1) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '0%'
    return `${numeric.toFixed(digits)}%`
  }

  const compact = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '0'
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(numeric)
  }

  return { number, currency, date, phone, percent, compact }
}
