import { computed } from 'vue'
import {
  bottomTabsByRole,
  findNavigationContext,
  findNavigationItem,
  navigationGroups,
} from '~/config/navigation'
import { useAuthStore } from '~/stores/auth'

export const useNavigation = () => {
  const route = useRoute()
  const auth = useAuthStore()

  const canSeeItem = (item) => {
    if (item.roles && !item.roles.includes(auth.role)) return false
    return auth.can(item.permission)
  }

  const menuGroups = computed(() =>
    navigationGroups
      .map((group) => ({ ...group, items: group.items.filter(canSeeItem) }))
      .filter((group) => group.items.length > 0),
  )

  const flatItems = computed(() => menuGroups.value.flatMap((group) => group.items))

  const bottomTabs = computed(() => {
    const tabs = bottomTabsByRole[auth.role] || []
    return tabs.filter((tab) => {
      if (!tab.to) return true
      if (tab.accent) return true
      const item = findNavigationItem(tab.to)
      return !item || canSeeItem(item)
    })
  })

  const homeTo = computed(() =>
    auth.role === 'agent' || auth.role === 'customer' ? '/home' : '/dashboard',
  )

  const pageTitle = computed(
    () => route.meta.title || findNavigationItem(route.path)?.label || 'ສາຍຝົນ ປະກັນໄພ',
  )

  const breadcrumb = computed(() => {
    const items = []
    const context = findNavigationContext(route.path)
    const current = route.meta.title || context?.item?.label

    if (route.path !== homeTo.value) {
      items.push({ label: 'ໜ້າຫຼັກ', to: homeTo.value })
    }

    if (context?.group) {
      const sectionItems = context.item.section
        ? context.group.items.filter((item) => item.section === context.item.section)
        : context.group.items
      const groupFirst = sectionItems[0]?.to
      if (groupFirst) {
        items.push({ label: context.item.section || context.group.title, to: groupFirst })
      }
    }

    if (current && current !== items.at(-1)?.label) {
      items.push({ label: current, to: route.path })
    }

    return items
  })

  const isActivePath = (path) => route.path === path || route.path.startsWith(`${path}/`)

  return {
    menuGroups,
    flatItems,
    bottomTabs,
    pageTitle,
    breadcrumb,
    homeTo,
    isActivePath,
  }
}
