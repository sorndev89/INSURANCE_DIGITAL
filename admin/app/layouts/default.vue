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
  <div class="flex h-dvh overflow-hidden bg-background text-foreground transition-colors">
    <!-- Desktop Sidebar (Collapsible with smooth animation) -->
    <AppSidebar class="hidden lg:flex" />

    <!-- Mobile / Tablet Drawer Sidebar (Overlay) -->
    <AppSidebar
      v-if="isMobileMenuOpen"
      overlay
      @close="isMobileMenuOpen = false"
    />

    <!-- Main Viewport Area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Topbar Header -->
      <header
        class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8"
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
            class="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            <BaseIcon name="search" :size="14" />
            <span>ຄົ້ນຫາອົງກອນ...</span>
          </NuxtLink>

          <!-- Dark Mode Toggle Button -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-muted hover:text-foreground"
            :title="isDark ? 'ປ່ຽນເປັນ Light Mode' : 'ປ່ຽນເປັນ Dark Mode'"
            @click="toggleTheme"
          >
            <BaseIcon :name="isDark ? 'sun' : 'moon'" :size="16" />
          </button>

          <!-- Superadmin Profile Pill -->
          <div
            class="flex items-center gap-2 rounded-xl border border-line bg-surface p-1.5 pr-3 text-xs font-bold"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white"
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
