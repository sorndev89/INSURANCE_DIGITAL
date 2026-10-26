<template>
  <div
    v-if="overlay"
    class="fixed inset-0 z-40 bg-foreground/40"
    aria-hidden="true"
    @click="ui.closeTabletSidebar()"
  />
  <aside :class="asideClass" aria-label="ເມນູຫຼັກ">
    <div class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
      <NuxtLink to="/" class="flex min-w-0 items-center gap-3 text-primary-text">
        <span
          class="flex shrink-0 transition-transform duration-300 ease-in-out"
          :class="collapsed ? 'translate-x-1.5' : ''"
        >
          <img
            v-if="tenant.logoUrl"
            :src="tenant.logoUrl"
            :alt="tenant.brandName"
            class="h-9 w-9 shrink-0 rounded-lg bg-surface-muted object-contain p-0.5"
          />
          <span
            v-else
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-cta"
          >
            <BaseIcon name="shield" size="md" />
          </span>
        </span>
        <span
          class="min-w-0 truncate text-lg font-bold tracking-tight transition-all duration-300 ease-in-out"
          :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100'"
        >
          {{ tenant.shortName }}
        </span>
      </NuxtLink>
      <button
        v-if="overlay"
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
        aria-label="ປິດເມນູ"
        @click="ui.closeTabletSidebar()"
      >
        <BaseIcon name="close" />
      </button>
    </div>

    <nav
      class="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-5"
    >
      <div v-for="group in menuGroups" :key="group.title">
        <p
          class="overflow-hidden px-3 text-xs font-bold uppercase tracking-wider text-muted transition-all duration-300 ease-in-out"
          :class="collapsed ? 'mb-0 max-h-0 opacity-0' : 'mb-2 max-h-8 opacity-100'"
        >
          {{ group.title }}
        </p>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :title="collapsed ? item.label : undefined"
            :aria-current="isActivePath(item.to) ? 'page' : undefined"
            class="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors"
            :class="[
              isActivePath(item.to)
                ? 'bg-primary text-white'
                : 'text-muted hover:bg-surface-muted hover:text-foreground',
            ]"
            @click="handleNavigate"
          >
            <BaseIcon
              :name="item.icon"
              size="md"
              class="shrink-0 transition-transform duration-300 ease-in-out"
              :class="collapsed ? 'translate-x-1.5' : ''"
            />
            <span
              class="min-w-0 truncate transition-all duration-300 ease-in-out"
              :class="collapsed ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100'"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
const props = defineProps({
  overlay: { type: Boolean, default: false },
})

const ui = useUiStore()
const tenant = useTenantStore()
const { menuGroups, isActivePath } = useNavigation()

const collapsed = computed(() => !props.overlay && ui.sidebarCollapsed)

const asideClass = computed(() => [
  'flex h-full min-h-0 flex-col overflow-hidden border-r border-line bg-surface',
  props.overlay
    ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl'
    : 'shrink-0 transition-[width] duration-300 ease-in-out',
  !props.overlay && (collapsed.value ? 'w-20' : 'w-64'),
])

const handleNavigate = () => {
  if (props.overlay) ui.closeTabletSidebar()
}
</script>
