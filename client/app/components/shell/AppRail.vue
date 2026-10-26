<template>
  <aside
    class="hidden h-full w-[72px] shrink-0 flex-col items-center border-r border-line bg-surface md:flex lg:hidden"
    aria-label="ເມນູຫຼັກ"
  >
    <NuxtLink
      to="/"
      class="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-cta"
      aria-label="ໜ້າຫຼັກ"
    >
      <BaseIcon name="shield" size="lg" />
    </NuxtLink>

    <nav
      class="scrollbar-thin mt-4 flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2 pb-3"
    >
      <NuxtLink
        v-for="item in flatItems"
        :key="item.to"
        :to="item.to"
        :title="item.label"
        :aria-label="item.label"
        :aria-current="isActivePath(item.to) ? 'page' : undefined"
        class="flex h-11 w-11 items-center justify-center rounded-xl transition-colors"
        :class="
          isActivePath(item.to)
            ? 'bg-primary/10 text-primary-text'
            : 'text-muted hover:bg-surface-muted hover:text-foreground'
        "
      >
        <BaseIcon :name="item.icon" size="md" />
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
const { flatItems, isActivePath } = useNavigation()
</script>
