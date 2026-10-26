export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev && to.path.startsWith('/dev')) return

  const STANDALONE_ROUTES = new Set([
    '/tenant-not-found',
    '/maintenance',
    '/select-company',
  ])
  if (STANDALONE_ROUTES.has(to.path)) return

  const tenant = useTenantStore()
  if (tenant.needsSelection) return navigateTo('/select-company')
  if (tenant.missing) return navigateTo('/tenant-not-found')
  if (tenant.suspended) return navigateTo('/maintenance')
})
