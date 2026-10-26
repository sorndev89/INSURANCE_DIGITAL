import { useScreen } from '~/composables/useScreen'

export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.layout === 'auth' || to.meta.layout === 'blank' || to.meta.layout === false) {
    return
  }

  const { form } = useScreen()
  const targetLayout =
    form.value === 'mobile' ? 'mobile' : form.value === 'tablet' ? 'tablet' : 'desktop'

  setPageLayout(targetLayout)
})
