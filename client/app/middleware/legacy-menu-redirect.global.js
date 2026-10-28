const LEGACY_MENU_PATHS = {
  '/insurers/commissions': '/insurer-commissions',
  '/customers/vehicles': '/vehicles',
  '/policies/my-policies': '/my-policies',
  '/marketing/banners': '/marketing-banners',
}

export default defineNuxtRouteMiddleware((to) => {
  const target = LEGACY_MENU_PATHS[to.path]
  if (!target) return
  return navigateTo(
    {
      path: target,
      query: to.query,
      hash: to.hash,
    },
    { replace: true },
  )
})
