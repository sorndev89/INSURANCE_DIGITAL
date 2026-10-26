<template>
  <header
    class="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-2 border-b border-line bg-surface px-3 pt-safe"
  >
    <div class="flex min-w-0 items-center gap-1">
      <button
        v-if="showBack"
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="ກັບຄືນ"
        @click="router.back()"
      >
        <BaseIcon name="arrow_back" size="lg" />
      </button>
      <button
        v-else
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="ເປີດເມນູ"
        @click="ui.openDrawer()"
      >
        <BaseIcon name="menu" size="lg" />
      </button>
      <p class="truncate px-1 text-base font-bold">{{ pageTitle }}</p>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-primary-text"
        aria-label="ຄົ້ນຫາ"
        @click="searchOpen = true"
      >
        <BaseIcon name="search" size="lg" />
      </button>
      <NuxtLink
        to="/profile"
        class="flex h-11 w-11 items-center justify-center"
        aria-label="ໂປຣໄຟລ໌"
      >
        <BaseAvatar :src="auth.user?.avatar" :name="auth.displayName" size="sm" />
      </NuxtLink>
    </div>

    <GlobalSearch v-model="searchOpen" />
  </header>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { pageTitle } = useNavigation()
const searchOpen = ref(false)

const showBack = computed(() => route.path.split('/').filter(Boolean).length > 1)
</script>
