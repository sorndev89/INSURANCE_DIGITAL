export const IMPERSONATE_PARAM = 'impersonate_token'

export const readImpersonationToken = (query) => {
  const value = query?.[IMPERSONATE_PARAM]
  return typeof value === 'string' ? value.trim() : ''
}

export const omitQueryKey = (query = {}, key) => {
  const next = { ...(query || {}) }
  delete next[key]
  return next
}

export const isSafeInternalPath = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
