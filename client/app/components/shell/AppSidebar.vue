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
        <span v-if="!collapsed" class="truncate text-lg font-bold tracking-tight">
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

    <nav class="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div v-for="group in menuGroups" :key="group.title">
        <p
          v-if="!collapsed"
          class="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted"
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
              collapsed ? 'justify-center px-0' : '',
            ]"
            @click="handleNavigate"
          >
            <BaseIcon :name="item.icon" size="md" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="shrink-0 border-t border-line p-3">
      <div v-if="!collapsed" class="mb-3 flex items-center gap-2 px-2">
        <BaseAvatar :src="auth.user?.avatar" :name="auth.displayName" size="sm" />
        <div class="min-w-0">
          <p class="truncate text-xs font-bold">{{ auth.displayName }}</p>
          <p class="text-xs text-muted">{{ auth.roleLabel }}</p>
        </div>
      </div>
      <button
        v-if="!overlay"
        type="button"
        class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        :class="collapsed ? 'justify-center px-0' : ''"
        :aria-label="collapsed ? 'ຂະຫຍາຍເມນູ' : 'ຫຍໍ້ເມນູ'"
        @click="ui.toggleSidebar()"
      >
        <BaseIcon :name="collapsed ? 'chevron_right' : 'chevron_left'" size="md" />
        <span v-if="!collapsed">ຫຍໍ້ເມນູ</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  overlay: { type: Boolean, default: false },
})

const ui = useUiStore()
const auth = useAuthStore()
const tenant = useTenantStore()
const { menuGroups, isActivePath } = useNavigation()

const collapsed = computed(() => !props.overlay && ui.sidebarCollapsed)

const asideClass = computed(() => [
  'flex h-full flex-col border-r border-line bg-surface',
  props.overlay
    ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl'
    : 'shrink-0 transition-[width] duration-200',
  !props.overlay && (collapsed.value ? 'w-20' : 'w-64'),
])

const handleNavigate = () => {
  if (props.overlay) ui.closeTabletSidebar()
}
</script>
