<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  overlay: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const route = useRoute()
const { user, logout } = usePlatformAuth()
const { isDark, toggleTheme } = useTheme()

// Collapsible state (preserved in localStorage for desktop)
const isCollapsed = ref(false)

if (import.meta.client && !props.overlay) {
  try {
    isCollapsed.value = localStorage.getItem('sf_platform_sidebar_collapsed') === 'true'
  } catch {
    // ignore
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  if (import.meta.client && !props.overlay) {
    try {
      localStorage.setItem('sf_platform_sidebar_collapsed', String(isCollapsed.value))
    } catch {
      // ignore
    }
  }
}

const collapsed = computed(() => !props.overlay && isCollapsed.value)

const navGroups = [
  {
    title: 'ພາບລວມລະບົບ',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    ],
  },
  {
    title: 'ການຈັດການ Platform',
    items: [
      { label: 'ອົງກອນ (Tenants)', to: '/tenants', icon: 'tenants' },
      { label: 'ແຜນການໃຊ້ງານ (Plans)', to: '/plans', icon: 'plans' },
      { label: 'Custom Domains', to: '/domains', icon: 'domains' },
    ],
  },
  {
    title: 'ລະບົບ & ຄວາມປອດໄພ',
    items: [
      { label: 'Audit Logs', to: '/audit', icon: 'audit' },
      { label: 'ສະຖານະລະບົບ (Health)', to: '/system/health', icon: 'health' },
    ],
  },
]

const isActivePath = (path) => {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path.startsWith(path)
}

const handleNavigate = () => {
  if (props.overlay) emit('close')
}

const asideClass = computed(() => [
  'flex h-full min-h-0 flex-col overflow-hidden border-r border-line bg-surface select-none',
  props.overlay
    ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl'
    : 'shrink-0 transition-[width] duration-250 ease-in-out',
  !props.overlay && (collapsed.value ? 'w-20' : 'w-64'),
])
</script>

<template>
  <div class="h-full min-h-0">
    <!-- Overlay Backdrop for Mobile / Tablet -->
    <div
      v-if="overlay"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      aria-hidden="true"
      @click="emit('close')"
    />

    <!-- Sidebar Aside Element -->
    <aside :class="asideClass" aria-label="ເມນູຫຼັກ">
      <!-- Header / Logo Branding -->
      <div
        class="flex h-16 shrink-0 items-center justify-between border-b border-line px-4"
        :class="collapsed ? 'justify-center px-0' : 'px-4'"
      >
        <NuxtLink
          to="/dashboard"
          class="flex min-w-0 items-center gap-3 text-foreground"
          :title="collapsed ? 'Insurance SaaS' : undefined"
          @click="handleNavigate"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-sm font-black text-white shadow-md shadow-emerald-700/20"
          >
            IS
          </div>
          <div v-if="!collapsed" class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-base font-extrabold tracking-tight text-foreground">
              Insurance SaaS
            </p>
            <p class="text-[11px] font-bold text-muted">Platform Console</p>
          </div>
        </NuxtLink>

        <!-- Close button if in Mobile Overlay mode -->
        <button
          v-if="overlay"
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-foreground"
          aria-label="ປິດເມນູ"
          @click="emit('close')"
        >
          <BaseIcon name="close" :size="18" />
        </button>
      </div>

      <!-- Navigation Menu Groups -->
      <nav class="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-5">
        <div v-for="group in navGroups" :key="group.title">
          <p
            v-if="!collapsed"
            class="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted/80"
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
              class="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-all"
              :class="[
                isActivePath(item.to)
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-muted hover:bg-surface-muted hover:text-foreground',
                collapsed ? 'justify-center px-0' : '',
              ]"
              @click="handleNavigate"
            >
              <BaseIcon
                :name="item.icon"
                :size="19"
                :class="isActivePath(item.to) ? 'text-white' : 'text-muted group-hover:text-foreground'"
              />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Bottom User Section & Collapse Toggle -->
      <div class="shrink-0 border-t border-line p-3">
        <!-- User Info Card (Expanded) -->
        <div
          v-if="!collapsed"
          class="mb-2.5 flex items-center justify-between gap-2 rounded-xl bg-surface-muted p-2.5"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white"
            >
              {{ user?.username ? user.username.charAt(0).toUpperCase() : 'S' }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-bold text-foreground">
                {{ user?.email || 'superadmin' }}
              </p>
              <span
                class="inline-block rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wide text-primary"
              >
                {{ user?.role || 'Superadmin' }}
              </span>
            </div>
          </div>

          <!-- Theme toggle -->
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground"
            :title="isDark ? 'ປ່ຽນເປັນ Light Mode' : 'ປ່ຽນເປັນ Dark Mode'"
            @click="toggleTheme"
          >
            <BaseIcon :name="isDark ? 'sun' : 'moon'" :size="16" />
          </button>
        </div>

        <!-- Logout Button (Expanded) -->
        <button
          v-if="!collapsed"
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-muted transition hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400"
          @click="logout"
        >
          <BaseIcon name="logout" :size="14" />
          <span>ອອກຈາກລະບົບ</span>
        </button>

        <!-- Collapsed Icons Only (Collapsed mode) -->
        <div v-if="collapsed" class="flex flex-col items-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-foreground"
            :title="isDark ? 'ປ່ຽນເປັນ Light Mode' : 'ປ່ຽນເປັນ Dark Mode'"
            @click="toggleTheme"
          >
            <BaseIcon :name="isDark ? 'sun' : 'moon'" :size="17" />
          </button>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-rose-500/10 hover:text-rose-600"
            title="ອອກຈາກລະບົບ"
            @click="logout"
          >
            <BaseIcon name="logout" :size="16" />
          </button>
        </div>

        <!-- Desktop Sidebar Collapse Toggle Button -->
        <button
          v-if="!overlay"
          type="button"
          class="mt-2 flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          :class="collapsed ? 'justify-center px-0' : ''"
          :title="collapsed ? 'ຂະຫຍາຍເມນູ' : 'ຫຍໍ້ເມນູ'"
          @click="toggleCollapse"
        >
          <BaseIcon :name="collapsed ? 'chevron_right' : 'chevron_left'" :size="16" />
          <span v-if="!collapsed">ຫຍໍ້ເມນູ</span>
        </button>
      </div>
    </aside>
  </div>
</template>
