<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur md:hidden"
    aria-label="ເມນູລຸ່ມ"
  >
    <div class="grid" :style="{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }">
      <template v-for="tab in tabs" :key="tab.label">
        <button
          v-if="tab.action === 'more'"
          type="button"
          class="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-bold text-muted transition-all duration-150 active:scale-[0.92] hover:text-foreground select-none"
          :aria-label="tab.label"
          @click="ui.openDrawer()"
        >
          <BaseIcon :name="tab.icon" size="lg" />
          <span>{{ tab.label }}</span>
        </button>

        <NuxtLink
          v-else
          :to="tab.to"
          :aria-current="isActive(tab.to) ? 'page' : undefined"
          class="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-bold transition-all duration-150 active:scale-[0.92] select-none"
          :class="isActive(tab.to) ? 'text-primary-text' : 'text-muted hover:text-foreground'"
        >
          <span
            v-if="tab.accent"
            class="-mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-cta transition-transform duration-150 active:scale-95"
          >
            <BaseIcon :name="tab.icon" size="lg" />
          </span>
          <BaseIcon
            v-else
            :name="tab.icon"
            size="lg"
            class="transition-transform duration-150"
            :class="isActive(tab.to) ? 'scale-110' : ''"
          />
          <span>{{ tab.label }}</span>
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
const ui = useUiStore()
const route = useRoute()
const { bottomTabs } = useNavigation()
const tabs = computed(() => bottomTabs.value)

const isActive = (to) => {
  if (!to) return false
  if (to === '/home' || to === '/dashboard') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>
