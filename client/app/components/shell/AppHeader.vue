<template>
  <header
    class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 md:px-6 lg:px-8"
  >
    <div class="flex min-w-0 items-center gap-3">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground md:flex lg:hidden"
        aria-label="ເປີດເມນູ"
        @click="ui.openTabletSidebar()"
      >
        <BaseIcon name="menu" size="lg" />
      </button>

      <Breadcrumb class="hidden sm:block" />
      <p class="truncate text-base font-bold sm:hidden">{{ pageTitle }}</p>
    </div>

    <div class="flex items-center gap-1 sm:gap-2">
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-xl px-2 text-muted transition-colors hover:bg-surface-muted hover:text-primary-text sm:px-3"
        aria-label="ຄົ້ນຫາ"
        @click="searchOpen = true"
      >
        <BaseIcon name="search" size="lg" />
        <span class="hidden text-sm font-bold lg:inline">ຄົ້ນຫາ</span>
        <kbd
          class="hidden rounded border border-line bg-surface-muted px-1.5 py-0.5 text-xs font-bold text-muted lg:inline"
        >
          ⌘K
        </kbd>
      </button>

      <NotificationMenu />
      <UserMenu />
    </div>

    <GlobalSearch v-model="searchOpen" />
  </header>
</template>

<script setup>
const ui = useUiStore()
const { pageTitle } = useNavigation()
const searchOpen = ref(false)
</script>
