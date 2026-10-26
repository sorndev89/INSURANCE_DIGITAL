<template>
  <k-app theme="material" class="min-h-dvh bg-background text-foreground">
    <k-page class="!bg-background">
      <a
        href="#main-content"
        class="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        ຂ້າມໄປເນື້ອຫາ
      </a>

      <ImpersonationBanner />
      <MobileTopBar />
      <main id="main-content" class="px-4 py-4 pb-28">
        <slot />
      </main>
      <BottomTabBar />
      <MobileDrawer />
    </k-page>
  </k-app>
</template>

<script setup>
import { kApp, kPage } from 'konsta/vue'
</script>
