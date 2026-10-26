export const UNAUTHORIZED_MESSAGE = 'Session ຂອງທ່ານໝົດອາຍຸ, ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'

export const errorStatus = (error) =>
  error?.response?.status ?? error?.statusCode ?? error?.status ?? null

export const isUnauthorized = (error) => errorStatus(error) === 401

export const messageFrom = (error, fallback = 'ເກີດຂໍ້ຜິດພາດ') => {
  const candidate =
    error?.data?.error?.message ?? error?.data?.error ?? error?.message ?? error?.statusMessage
  return typeof candidate === 'string' && candidate.trim() ? candidate : fallback
}

/**
 * Builds a login location that preserves the current path for post-login redirect.
 * Never redirects to itself or to protocol-relative URLs.
 */
export const buildLoginLocation = (fullPath = '/') => {
  const path = typeof fullPath === 'string' ? fullPath : '/'
  const safe = path.startsWith('/') && !path.startsWith('//')
  const isLogin = safe && (path === '/login' || path.startsWith('/login?'))
  const isRoot = path === '/'
  const query = safe && !isLogin && !isRoot ? { redirect: path } : undefined
  return { path: '/login', query }
}

/**
 * Creates a guard that logs out and redirects exactly once per session expiry.
 * Returning `true` means the error was handled as an expired session.
 */
export const createUnauthorizedHandler = ({
  logout,
  redirect,
  notify,
  isAuthenticated = () => true,
  isLoginRoute = () => false,
}) => {
  let handled = false

  return (error) => {
    if (!isUnauthorized(error)) return false
    if (handled) return true
    if (!isAuthenticated()) return false

    handled = true
    try {
      logout()
    } finally {
      if (!isLoginRoute()) {
        notify?.()
        redirect?.()
      }
    }
    return true
  }
}
