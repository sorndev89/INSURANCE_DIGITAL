<script setup>
import { onMounted, ref } from 'vue'

const { user, loadMe } = usePlatformAuth()
const { isDark, toggleTheme, initTheme } = useTheme()

const isMobileMenuOpen = ref(false)

onMounted(async () => {
  initTheme()
  if (!user.value) await loadMe()
})
</script>

<template>
  <div class="relative flex h-dvh overflow-hidden bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary-text">
    <!-- Ambient Background Glows for Unified Depth -->
    <div
      class="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[110px] dark:bg-primary/15"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none fixed bottom-1/4 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/10"
      aria-hidden="true"
    />

    <!-- Desktop Sidebar (Collapsible with smooth animation) -->
    <AppSidebar class="hidden lg:flex" />

    <!-- Mobile / Tablet Drawer Sidebar (Overlay) -->
    <AppSidebar
      v-if="isMobileMenuOpen"
      overlay
      @close="isMobileMenuOpen = false"
    />

    <!-- Main Viewport Area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden relative">
      <!-- Topbar Header -->
      <header
        class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line/50 bg-surface/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-colors"
      >
        <!-- Mobile Hamburger Button & Title -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-muted lg:hidden"
            aria-label="ເປີດເມນູ"
            @click="isMobileMenuOpen = true"
          >
            <BaseIcon name="menu" :size="20" />
          </button>

          <div class="hidden items-center gap-2 sm:flex">
            <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span class="text-xs font-bold text-muted">Platform Live · Insurance Digital Core</span>
          </div>
        </div>

        <!-- Right Side Header Controls -->
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink
            to="/tenants"
            class="hidden items-center gap-2 rounded-full border border-line/60 bg-surface/80 px-3.5 py-1.5 text-xs font-bold text-muted transition hover:border-primary/40 hover:text-foreground sm:inline-flex shadow-2xs"
          >
            <BaseIcon name="search" :size="14" />
            <span>ຄົ້ນຫາອົງກອນ...</span>
          </NuxtLink>

          <!-- Dark Mode Toggle Button -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-surface/80 text-muted transition hover:bg-surface-muted hover:text-foreground shadow-2xs cursor-pointer"
            :title="isDark ? 'ປ່ຽນເປັນ Light Mode' : 'ປ່ຽນເປັນ Dark Mode'"
            @click="toggleTheme"
          >
            <BaseIcon :name="isDark ? 'sun' : 'moon'" :size="16" />
          </button>

          <!-- Superadmin Profile Pill -->
          <div
            class="flex items-center gap-2 rounded-full border border-line/60 bg-surface/80 p-1 pr-3 text-xs font-bold shadow-2xs"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-black text-white"
            >
              {{ user?.username ? user.username.charAt(0).toUpperCase() : 'S' }}
            </span>
            <span class="hidden truncate text-foreground sm:inline">
              {{ user?.username || 'Superadmin' }}
            </span>
          </div>
        </div>
      </header>

      <!-- Scrollable Main Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="shrink-0 border-t border-line py-3 px-6 text-center text-xs text-muted">
        Insurance SaaS Platform Console &copy; 2026. All rights reserved.
      </footer>
    </div>
  </div>
</template>
