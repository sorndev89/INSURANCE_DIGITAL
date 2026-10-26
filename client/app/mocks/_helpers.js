export const clone = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

export const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

export const shouldFail = (rate = 0) => Math.random() < Number(rate || 0)

export const mockError = (message, statusCode = 500) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const searchItems = (items, query, keys = []) => {
  const keyword = String(query || '')
    .trim()
    .toLowerCase()
  if (!keyword) return items
  return items.filter((item) =>
    keys.some((key) =>
      String(item[key] ?? '')
        .toLowerCase()
        .includes(keyword),
    ),
  )
}

export const filterItems = (items, filters = {}, ignored = ['search', 'page', 'pageSize']) => {
  const active = Object.entries(filters).filter(
    ([key, value]) =>
      !ignored.includes(key) && value !== '' && value !== null && value !== undefined,
  )
  if (!active.length) return items
  return items.filter((item) =>
    active.every(([key, value]) => String(item[key] ?? '') === String(value)),
  )
}

export const sortItems = (items, sort) => {
  if (!sort?.key) return items
  const direction = sort.order === 'desc' ? -1 : 1
  return [...items].sort((left, right) => {
    const a = left[sort.key]
    const b = right[sort.key]
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction
    return String(a ?? '').localeCompare(String(b ?? ''), 'lo') * direction
  })
}

export const paginate = (items, page = 1, pageSize = 10) => {
  const safePage = Math.max(1, Number(page) || 1)
  const safeSize = Math.max(1, Number(pageSize) || 10)
  const start = (safePage - 1) * safeSize
  return {
    data: items.slice(start, start + safeSize),
    meta: {
      total: items.length,
      page: safePage,
      pageSize: safeSize,
    },
  }
}

export const nextId = (items) =>
  items.reduce((maximum, item) => Math.max(maximum, Number(item.id) || 0), 0) + 1
