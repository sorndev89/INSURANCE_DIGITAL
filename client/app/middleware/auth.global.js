import { ROLE_LANDING } from '~/config/permissions'
import { useAuthStore } from '~/stores/auth'

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/forgot-password',
  '/tenant-not-found',
  '/maintenance',
  '/select-company',
])

const TENANT_STANDALONE = new Set(['/tenant-not-found', '/maintenance', '/select-company'])

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev && to.path.startsWith('/dev')) return
  if (to.path === '/403') return
  if (TENANT_STANDALONE.has(to.path)) return

  const tenant = useTenantStore()
  if (tenant.needsSelection || tenant.missing || tenant.suspended) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated && !PUBLIC_ROUTES.has(to.path)) {
    return navigateTo({
      path: '/login',
      query: to.fullPath === '/' ? undefined : { redirect: to.fullPath },
    })
  }

  if (auth.isAuthenticated && (PUBLIC_ROUTES.has(to.path) || to.path === '/')) {
    return navigateTo(ROLE_LANDING[auth.role] || '/dashboard')
  }
})
