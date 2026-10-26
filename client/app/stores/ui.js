import { computed, onMounted, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

const THEME_COOKIE = 'saiyfon_theme'
const SIDEBAR_KEY = 'saiyfon_sidebar_collapsed'

export const useUiStore = defineStore('ui', () => {
  const themeCookie = useCookie(THEME_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => 'light',
  })

  const initialTheme =
    import.meta.client &&
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : themeCookie.value === 'dark'
        ? 'dark'
        : 'light'

  const theme = ref(initialTheme)
  const sidebarCollapsed = useStorage(SIDEBAR_KEY, false)
  const tabletSidebarOpen = ref(false)
  const drawerOpen = ref(false)

  const isDark = computed(() => theme.value === 'dark')

  const applyTheme = (nextTheme) => {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    document.documentElement.style.colorScheme = nextTheme
    themeCookie.value = nextTheme
  }

  const setTheme = (nextTheme) => {
    theme.value = nextTheme === 'dark' ? 'dark' : 'light'
    applyTheme(theme.value)
  }

  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  const openTabletSidebar = () => {
    tabletSidebarOpen.value = true
  }
  const closeTabletSidebar = () => {
    tabletSidebarOpen.value = false
  }
  const openDrawer = () => {
    drawerOpen.value = true
  }
  const closeDrawer = () => {
    drawerOpen.value = false
  }

  onMounted(() => {
    if (import.meta.client && document.documentElement.classList.contains('dark')) {
      theme.value = 'dark'
    }
    applyTheme(theme.value)
  })

  return {
    theme,
    isDark,
    sidebarCollapsed,
    tabletSidebarOpen,
    drawerOpen,
    setTheme,
    toggleTheme,
    toggleSidebar,
    openTabletSidebar,
    closeTabletSidebar,
    openDrawer,
    closeDrawer,
  }
})
