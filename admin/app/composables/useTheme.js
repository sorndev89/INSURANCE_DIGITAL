import { onMounted, ref } from 'vue'

export const useTheme = () => {
  const isDark = ref(false)

  const applyTheme = (dark) => {
    isDark.value = dark
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (dark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      try {
        localStorage.setItem('sf_platform_theme', dark ? 'dark' : 'light')
      } catch {
        // ignore
      }
    }
  }

  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  const initTheme = () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('sf_platform_theme')
      if (saved) {
        applyTheme(saved === 'dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(prefersDark)
      }
    } catch {
      applyTheme(false)
    }
  }

  return {
    isDark,
    toggleTheme,
    applyTheme,
    initTheme,
  }
}
