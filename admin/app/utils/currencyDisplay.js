import { computed, reactive } from 'vue'

export const STORAGE_KEY = 'sf_platform_currency_display'
export const DEFAULT_CURRENCY_DISPLAY = Object.freeze({ symbol: 'kip', position: 'prefix' })

export const CURRENCY_SYMBOL_OPTIONS = [
  { value: 'kip', label: '₭ (Kip)' },
  { value: 'lak', label: 'LAK' },
]

const state = reactive({ ...DEFAULT_CURRENCY_DISPLAY })

const hasStorage = () => {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export const normalizeCurrencyDisplay = (value) => {
  if (!value || typeof value !== 'object') return null
  const symbol = value.symbol === 'lak' || value.symbol === 'kip' ? value.symbol : null
  const position =
    value.position === 'suffix' || value.position === 'prefix' ? value.position : null
  if (!symbol || !position) return null
  return { symbol, position }
}

const load = () => {
  if (!hasStorage()) return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const normalized = raw ? normalizeCurrencyDisplay(JSON.parse(raw)) : null
    if (normalized) Object.assign(state, normalized)
  } catch {
    // ignore malformed preferences
  }
}

const persist = () => {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }))
  } catch {
    // persistence is best-effort
  }
}

load()

export const adminCurrencyDisplay = computed(() => ({ ...state }))
export const currencyLabel = computed(() => (state.symbol === 'lak' ? 'LAK' : '₭'))

export const setCurrencyDisplay = (value) => {
  const normalized = normalizeCurrencyDisplay(value)
  if (!normalized) return
  Object.assign(state, normalized)
  persist()
}

export const resetCurrencyDisplay = () => {
  Object.assign(state, DEFAULT_CURRENCY_DISPLAY)
  if (hasStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }
}

export const formatCurrency = (value, options) => {
  const display = normalizeCurrencyDisplay(options) || state
  const numeric = Number(value)
  const safe = Number.isFinite(numeric) ? numeric : 0
  const sign = safe < 0 ? '-' : ''
  const symbol = display.symbol === 'lak' ? 'LAK' : '₭'
  const formatted = new Intl.NumberFormat('en-US').format(Math.abs(safe))
  return display.position === 'suffix'
    ? `${sign}${formatted} ${symbol}`
    : `${sign}${symbol} ${formatted}`
}

export const formatGroupedNumber = (value, options = {}) => {
  if (value === '' || value === null || value === undefined) return ''
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return ''
  const sign = numeric < 0 ? '-' : ''
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: options.allowDecimal ? (options.maxDecimals ?? 2) : 0,
  })
  return `${sign}${formatter.format(Math.abs(numeric))}`
}

export const formatNumericDraft = (value, options = {}) => {
  const allowDecimal = Boolean(options.allowDecimal)
  const allowNegative = Boolean(options.allowNegative)
  const maxDecimals = Math.max(0, Number(options.maxDecimals) || 2)
  const raw = String(value ?? '')
  const negative = allowNegative && raw.trimStart().startsWith('-')
  const cleaned = raw.replace(allowDecimal ? /[^\d.]/g : /\D/g, '')

  if (!cleaned) return { display: negative ? '-' : '', value: '' }

  const [integerRaw = '', ...decimalParts] = cleaned.split('.')
  const integerDigits = integerRaw.replace(/^0+(?=\d)/, '')
  const hasDecimalPoint = allowDecimal && cleaned.includes('.')
  const decimalDigits = allowDecimal ? decimalParts.join('').slice(0, maxDecimals) : ''
  const grouped = new Intl.NumberFormat('en-US').format(Number(integerDigits || '0'))
  const display = `${negative ? '-' : ''}${grouped}${hasDecimalPoint ? `.${decimalDigits}` : ''}`
  const numericText = `${negative ? '-' : ''}${integerDigits || '0'}${
    hasDecimalPoint ? `.${decimalDigits}` : ''
  }`
  const numeric = Number(numericText)

  return { display, value: Number.isFinite(numeric) ? numeric : '' }
}

export const caretForSymbols = (formatted, symbolCount) => {
  if (!formatted || symbolCount <= 0) return 0
  let seen = 0
  for (let index = 0; index < formatted.length; index += 1) {
    if (/[\d.]/.test(formatted[index])) {
      seen += 1
      if (seen >= symbolCount) return index + 1
    }
  }
  return formatted.length
}
