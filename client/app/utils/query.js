const toPositiveInt = (value) => {
  const numeric = Number(value)
  if (!Number.isInteger(numeric) || numeric < 1) return null
  return numeric
}

const isBlank = (value) => value === '' || value === null || value === undefined

export const parseListSort = (value) => {
  if (typeof value !== 'string') return null
  const [key, order] = value.split(':')
  const field = key?.trim()
  if (!field) return null
  return { key: field, order: order?.trim() === 'desc' ? 'desc' : 'asc' }
}

export const parseListState = (routeQuery = {}, defaultFilters = {}) => {
  const query = routeQuery || {}
  const filters = { ...defaultFilters }

  for (const key of Object.keys(defaultFilters)) {
    const value = query[key]
    if (typeof value === 'string') filters[key] = value
  }

  const page = toPositiveInt(query.page) || 1
  const pageSize = toPositiveInt(query.pageSize)
  const sort = parseListSort(query.sort)

  return { filters, page, pageSize, sort }
}

/**
 * Serializes the list state into a compact route query.
 * Empty filters and the first page are omitted so shared URLs stay clean.
 */
export const buildListQuery = ({ filters = {}, page = 1, sort = null, base = {} } = {}) => {
  const query = { ...base }

  for (const [key, value] of Object.entries(filters)) {
    if (isBlank(value) || value === false) delete query[key]
    else query[key] = String(value)
  }

  const safePage = toPositiveInt(page)
  if (safePage && safePage > 1) query.page = String(safePage)
  else delete query.page

  if (sort?.key) query.sort = `${sort.key}:${sort.order === 'desc' ? 'desc' : 'asc'}`
  else delete query.sort

  return query
}
