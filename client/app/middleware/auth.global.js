import { ROLE_LANDING } from '~/config/permissions'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { useAuth } from '~/composables/api/useAuth'
import { useToast } from '~/composables/useToast'
import { IMPERSONATE_PARAM, omitQueryKey, readImpersonationToken } from '~/utils/impersonation'

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/forgot-password',
  '/tenant-not-found',
  '/maintenance',
  '/select-company',
])

const TENANT_STANDALONE = new Set(['/tenant-not-found', '/maintenance', '/select-company'])

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.dev && to.path.startsWith('/dev')) return
  if (to.path === '/403') return
  if (TENANT_STANDALONE.has(to.path)) return

  const tenant = useTenantStore()
  if (tenant.loading) await tenant.resolve()
  if (tenant.needsSelection || tenant.missing || tenant.suspended) return

  const auth = useAuthStore()
  const impersonateToken = readImpersonationToken(to.query)

  if (impersonateToken) {
    auth.beginImpersonation(impersonateToken)
    try {
      await useAuth().me()
      useToast().warning('ທ່ານກຳລັງຢູ່ໃນໂໝດ Impersonation ໂດຍ Superadmin')
      return navigateTo(
        {
          path: to.path,
          query: omitQueryKey(to.query, IMPERSONATE_PARAM),
          hash: to.hash,
        },
        { replace: true },
      )
    } catch {
      auth.logout()
      useToast().error('Token Impersonation ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ')
      return navigateTo(
        { path: '/login', query: { error: 'impersonation_failed' } },
        { replace: true },
      )
    }
  }

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
