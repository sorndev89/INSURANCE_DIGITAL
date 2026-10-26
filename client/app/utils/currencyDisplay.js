import { computed, reactive } from 'vue'

export const CURRENCY_USER_KEY_PREFIX = 'saiyfon_currency_display_user:'
export const DEFAULT_CURRENCY_DISPLAY = Object.freeze({ symbol: 'kip', position: 'prefix' })

export const CURRENCY_SYMBOL_OPTIONS = [
  { value: 'kip', label: '₭ (Kip)' },
  { value: 'lak', label: 'LAK' },
]

export const CURRENCY_POSITION_OPTIONS = [
  { value: 'prefix', label: 'ທາງໜ້າ' },
  { value: 'suffix', label: 'ທາງຫຼັງ' },
]

const state = reactive({
  tenant: null,
  user: null,
  userId: null,
})

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

const userStorageKey = (userId) => `${CURRENCY_USER_KEY_PREFIX}${userId}`

const readUserDisplay = (userId) => {
  if (!userId || !hasStorage()) return null
  try {
    const raw = window.localStorage.getItem(userStorageKey(userId))
    return raw ? normalizeCurrencyDisplay(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

const writeUserDisplay = (userId, value) => {
  if (!userId || !hasStorage()) return
  try {
    if (value) {
      window.localStorage.setItem(userStorageKey(userId), JSON.stringify(value))
    } else {
      window.localStorage.removeItem(userStorageKey(userId))
    }
  } catch {
    // persistence is best-effort
  }
}

export const effectiveCurrencyDisplay = computed(
  () => state.user || state.tenant || DEFAULT_CURRENCY_DISPLAY,
)

export const currencyLabel = computed(() =>
  effectiveCurrencyDisplay.value.symbol === 'lak' ? 'LAK' : '₭',
)

export const tenantCurrencyDisplay = computed(() => state.tenant)
export const userCurrencyDisplay = computed(() => state.user)

export const setTenantCurrencyDisplay = (value) => {
  state.tenant = normalizeCurrencyDisplay(value)
}

export const setCurrencyUser = (userId) => {
  const nextId = userId === null || userId === undefined ? null : Number(userId)
  if (Number.isFinite(nextId)) {
    state.userId = nextId
    state.user = readUserDisplay(nextId)
    return
  }
  state.userId = null
  state.user = null
}

export const setUserCurrencyDisplay = (value) => {
  const normalized = normalizeCurrencyDisplay(value)
  state.user = normalized
  writeUserDisplay(state.userId, normalized)
}

export const clearUserCurrencyDisplay = () => {
  state.user = null
  writeUserDisplay(state.userId, null)
}

export const resetCurrencyDisplayState = () => {
  state.tenant = null
  state.user = null
  state.userId = null
}

const mergedDisplay = (options) => {
  if (!options) return effectiveCurrencyDisplay.value
  const normalized = normalizeCurrencyDisplay(options)
  if (!normalized) return effectiveCurrencyDisplay.value
  return normalized
}

export const formatCurrency = (value, options) => {
  const display = mergedDisplay(options)
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
