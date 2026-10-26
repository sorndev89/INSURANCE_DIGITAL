<script setup>
import { onMounted } from 'vue'

const route = useRoute()
const { user, loadMe, logout } = usePlatformAuth()

const nav = [
  { label: 'Tenants', to: '/tenants' },
  { label: 'Plans', to: '/plans' },
  { label: 'Audit log', to: '/audit' },
]

onMounted(async () => {
  if (!user.value) await loadMe()
})
</script>

<template>
  <div class="min-h-screen lg:flex">
    <aside class="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div class="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white"
        >
          SF
        </span>
        <div class="leading-tight">
          <p class="text-sm font-bold text-slate-900">Saiyfon SaaS</p>
          <p class="text-[11px] text-slate-500">Platform console</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 p-3">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="block rounded-lg px-3 py-2 text-sm font-bold transition"
          :class="
            route.path.startsWith(item.to)
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-slate-200 p-3">
        <p class="truncate px-2 text-xs font-bold text-slate-700">
          {{ user?.email || '—' }}
        </p>
        <p class="px-2 text-[11px] uppercase tracking-wide text-slate-400">
          {{ user?.role || 'platform' }}
        </p>
        <button
          type="button"
          class="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          @click="logout"
        >
          ອອກຈາກລະບົບ
        </button>
      </div>
    </aside>

    <div class="min-w-0 flex-1">
      <header class="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div class="flex items-center justify-between gap-3">
          <NuxtLink to="/tenants" class="text-sm font-bold text-slate-900">Saiyfon SaaS</NuxtLink>
          <button
            type="button"
            class="text-xs font-bold text-slate-500 hover:text-slate-900"
            @click="logout"
          >
            ອອກ
          </button>
        </div>
        <nav class="mt-2 flex gap-2 overflow-x-auto">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold"
            :class="
              route.path.startsWith(item.to)
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-500 hover:bg-slate-50'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </header>

      <main class="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
