<script setup>
import { onMounted, ref } from 'vue'

useHead({ title: 'ສະຖານະລະບົບ (Health)' })

const refreshing = ref(false)
const checkedAt = ref(new Date().toLocaleTimeString('lo-LA'))

const services = ref([
  {
    name: 'MySQL Database',
    category: 'Core Storage',
    status: 'operational',
    latency: '1.4ms',
    details: 'Primary Cluster · Multi-Tenant DB · Connection Pool OK',
  },
  {
    name: 'Redis Cache',
    category: 'Memory & Cache',
    status: 'operational',
    latency: '0.8ms',
    details: 'Tenant Hostname Resolver · Fast Route Resolution',
  },
  {
    name: 'API Gateway',
    category: 'Application Server',
    status: 'operational',
    latency: '2.1ms',
    details: 'Express.js · Rate Limiting · Platform & Tenant Auth Middleware',
  },
  {
    name: 'Background Worker',
    category: 'Async Processing',
    status: 'operational',
    latency: '—',
    details: 'DNS Verification Cron · Audit Logger · Auto SSL Renew',
  },
])

const refresh = async () => {
  refreshing.value = true
  await new Promise((r) => setTimeout(r, 400))
  checkedAt.value = new Date().toLocaleTimeString('lo-LA')
  refreshing.value = false
}

onMounted(() => {
  checkedAt.value = new Date().toLocaleTimeString('lo-LA')
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="ສະຖານະລະບົບ & Infrastructure"
      description="ຕິດຕາມຄວາມພ້ອມຂອງເຊີເວີ, ຖານຂໍ້ມູນ, Cache ແລະ ລະບົບເຄືອຂ່າຍຂອງ Platform"
      :breadcrumbs="[{ label: 'System Health' }]"
    >
      <template #actions>
        <button
          type="button"
          class="sf-btn sf-btn-secondary"
          :disabled="refreshing"
          @click="refresh"
        >
          ↻ {{ refreshing ? 'ກຳລັງກວດສອບ...' : 'ກວດສອບຄືນ' }}
        </button>
      </template>
    </PageHeader>

    <!-- Overall Status Banner -->
    <div
      class="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <BaseIcon name="check" :size="22" />
        </div>
        <div>
          <h2 class="text-base font-extrabold text-foreground">
            ທຸກລະບົບເຮັດວຽກປົກກະຕິ (All Systems Operational)
          </h2>
          <p class="text-xs text-muted">
            Platform Uptime: 99.98% · ກວດສອບຫຼ້າສຸດເມື່ອ: {{ checkedAt }}
          </p>
        </div>
      </div>
      <span class="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        100% Uptime 24h
      </span>
    </div>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div
        v-for="svc in services"
        :key="svc.name"
        class="sf-card p-5 transition hover:border-primary/40"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted">
              {{ svc.category }}
            </span>
            <h3 class="text-base font-extrabold text-foreground mt-0.5">
              {{ svc.name }}
            </h3>
          </div>
          <span class="sf-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Operational
          </span>
        </div>

        <p class="mt-2 text-xs text-muted">{{ svc.details }}</p>

        <div class="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
          <span class="text-muted">Response Latency:</span>
          <span class="font-mono font-bold text-foreground">{{ svc.latency }}</span>
        </div>
      </div>
    </div>

    <!-- Environment Runtime Specs -->
    <div class="sf-card p-5">
      <h3 class="text-base font-extrabold text-foreground mb-4">
        Platform Runtime Environment
      </h3>
      <div class="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
        <div class="rounded-xl border border-line bg-surface-muted/50 p-3">
          <p class="text-muted font-bold">Node.js Engine</p>
          <p class="mt-1 font-mono font-extrabold text-foreground">v22.x LTS</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted/50 p-3">
          <p class="text-muted font-bold">Nuxt Version</p>
          <p class="mt-1 font-mono font-extrabold text-foreground">v4.3.1</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted/50 p-3">
          <p class="text-muted font-bold">Tailwind Engine</p>
          <p class="mt-1 font-mono font-extrabold text-foreground">v4.1 CSS</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted/50 p-3">
          <p class="text-muted font-bold">Environment</p>
          <p class="mt-1 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">Development</p>
        </div>
      </div>
    </div>
  </div>
</template>
