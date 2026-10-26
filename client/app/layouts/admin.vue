<template>
  <div class="flex h-dvh overflow-hidden bg-background text-foreground">
    <a
      href="#main-content"
      class="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
    >
      ຂ້າມໄປເນື້ອຫາ
    </a>

    <AppSidebar class="hidden lg:flex" />
    <AppRail />
    <AppSidebar v-if="ui.tabletSidebarOpen" overlay />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main id="main-content" class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[1920px] p-4 md:p-6 lg:p-8">
          <slot />
        </div>
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
const ui = useUiStore()
</script>
