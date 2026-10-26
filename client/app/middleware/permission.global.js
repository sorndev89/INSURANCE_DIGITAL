import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/403') return

  const auth = useAuthStore()
  if (!auth.isAuthenticated) return

  const requiredPermission = to.meta.permission
  if (requiredPermission && !auth.can(requiredPermission)) {
    return navigateTo('/403')
  }
})
