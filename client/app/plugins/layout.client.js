import { watch } from 'vue'
import { useScreen } from '~/composables/useScreen'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { form } = useScreen()

  const resolveLayout = () => {
    const metaLayout = route.meta.layout
    if (metaLayout === 'auth' || metaLayout === 'blank' || metaLayout === false) {
      return
    }

    const targetLayout =
      form.value === 'mobile' ? 'mobile' : form.value === 'tablet' ? 'tablet' : 'desktop'

    setPageLayout(targetLayout)
  }

  watch(form, resolveLayout, { immediate: true })
})
