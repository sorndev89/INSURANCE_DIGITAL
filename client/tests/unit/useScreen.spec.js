import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const breakpointState = {
  desktop: ref(false),
  tablet: ref(false),
  mobile: ref(true),
}

vi.mock('@vueuse/core', () => ({
  useBreakpoints: () => ({
    greaterOrEqual: () => breakpointState.desktop,
    between: () => breakpointState.tablet,
    smaller: () => breakpointState.mobile,
  }),
}))

const { useScreen } = await import('~/composables/useScreen')

describe('useScreen', () => {
  beforeEach(() => {
    breakpointState.desktop.value = false
    breakpointState.tablet.value = false
    breakpointState.mobile.value = true
  })

  it('returns mobile form on small screens', () => {
    const { form, isMobile } = useScreen()
    expect(isMobile.value).toBe(true)
    expect(form.value).toBe('mobile')
  })

  it('returns tablet form between 768 and 1023', () => {
    breakpointState.mobile.value = false
    breakpointState.tablet.value = true
    const { form, isTablet } = useScreen()
    expect(isTablet.value).toBe(true)
    expect(form.value).toBe('tablet')
  })

  it('returns desktop form at 1024 and above', () => {
    breakpointState.mobile.value = false
    breakpointState.desktop.value = true
    const { form, isDesktop } = useScreen()
    expect(isDesktop.value).toBe(true)
    expect(form.value).toBe('desktop')
  })
})
