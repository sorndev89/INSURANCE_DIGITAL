export default defineNuxtRouteMiddleware((to) => {
  const token = useApiToken()

  if (!token.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (token.value && to.path === '/login') {
    return navigateTo('/tenants')
  }
})
