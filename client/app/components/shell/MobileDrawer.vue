<template>
  <BaseDrawer v-model="open" placement="left" title="ເມນູ">
    <div class="space-y-5 px-4 py-4">
      <div class="flex items-center gap-3 rounded-xl border border-line bg-surface-muted p-3">
        <BaseAvatar :src="auth.user?.avatar" :name="auth.displayName" size="md" />
        <div class="min-w-0">
          <p class="truncate text-sm font-bold">{{ auth.displayName }}</p>
          <p class="text-xs text-muted">{{ auth.roleLabel }}</p>
        </div>
      </div>

      <div v-for="group in menuGroups" :key="group.title">
        <p class="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted">
          {{ group.title }}
        </p>
        <div class="space-y-1">
          <template v-for="(item, index) in group.items" :key="item.to">
            <p
              v-if="item.section && group.items[index - 1]?.section !== item.section"
              class="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted/80"
            >
              {{ item.section }}
            </p>
            <NuxtLink
              :to="item.to"
              class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors"
              :class="
                isActivePath(item.to)
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-surface-muted hover:text-foreground'
              "
              @click="ui.closeDrawer()"
            >
              <BaseIcon :name="item.icon" size="md" />
              {{ item.label }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="space-y-2">
        <button
          type="button"
          class="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted"
          @click="ui.toggleTheme()"
        >
          <BaseIcon :name="ui.isDark ? 'light_mode' : 'dark_mode'" size="md" class="text-muted" />
          {{ ui.isDark ? 'Light mode' : 'Dark mode' }}
        </button>
        <button
          type="button"
          class="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-danger transition-colors hover:bg-danger/10"
          @click="handleLogout"
        >
          <BaseIcon name="logout" size="md" />
          ອອກຈາກລະບົບ
        </button>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
const ui = useUiStore()
const auth = useAuthStore()
const { menuGroups, isActivePath } = useNavigation()

const open = computed({
  get: () => ui.drawerOpen,
  set: (value) => {
    if (value) ui.openDrawer()
    else ui.closeDrawer()
  },
})

const handleLogout = () => {
  auth.logout()
  ui.closeDrawer()
  navigateTo('/login')
}
</script>
