import { computed } from 'vue'
import { useBreakpoints } from '@vueuse/core'

export const useScreen = () => {
  const breakpoints = useBreakpoints({ tablet: 768, desktop: 1024 })
  const isDesktop = breakpoints.greaterOrEqual('desktop')
  const isTablet = breakpoints.between('tablet', 'desktop')
  const isMobile = breakpoints.smaller('tablet')

  const form = computed(() => {
    if (isDesktop.value) return 'desktop'
    if (isTablet.value) return 'tablet'
    return 'mobile'
  })

  return { isDesktop, isTablet, isMobile, form, breakpoints }
}
