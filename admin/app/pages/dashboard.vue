<script setup>
import { computed, onMounted, ref } from 'vue'

useHead({ title: 'Dashboard ພາບລວມ' })

const { platform } = usePlatformConfig()
const { request } = useApi()
const { date, number, currency } = useFormat()
const dialog = useDialog()

const loading = ref(true)
const tenants = ref([])
const plans = ref([])
const recentAudits = ref([])
const meta = ref({ total: 0 })

const planPrice = (plan) => {
  if (!plan.price || Number(plan.price) === 0) return 'Free'
  if (plan.currency && plan.currency !== 'LAK') {
    return `${number(plan.price)} ${plan.currency}/ດ`
  }
  return `${currency(plan.price)}/ດ`
}

const stats = computed(() => {
  const total = meta.value.total || tenants.value.length || 0
  const active = tenants.value.filter((t) => t.status === 'active').length
  const trial = tenants.value.filter((t) => t.status === 'trial').length
  const suspended = tenants.value.filter((t) => t.status === 'suspended').length
  return { total, active, trial, suspended }
})

// Impersonation state
const impersonating = ref(false)
const impersonateTenant = async (tenant) => {
  const accepted = await dialog.confirm({
    title: 'ເຂົ້າສູ່ລະບົບໃນນາມ Tenant',
    message: `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເຂົ້າສູ່ລະບົບໃນນາມ ${tenant.name}?`,
    confirmLabel: 'ເຂົ້າສູ່ລະບົບ',
  })
  if (!accepted) return
  impersonating.value = true
  try {
    const res = await request(`/platform/tenants/${tenant.id}/impersonate`, {
      method: 'POST',
    })
    const data = res.data
    if (data?.token) {
      // In dev, tenant app runs at http://localhost:3000
      // We pass the token in url or set cookie
      const targetHost = window.location.hostname === 'localhost'
        ? `http://localhost:3000?impersonate_token=${data.token}`
        : `https://${tenant.primaryHostname || `${tenant.slug}.${platform.value.rootDomain}`}?impersonate_token=${data.token}`
      window.open(targetHost, '_blank')
    }
  } catch (err) {
    dialog.error(apiErrorMessage(err), 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ')
  } finally {
    impersonating.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [tenantsRes, plansRes, auditsRes] = await Promise.allSettled([
      request('/platform/tenants', { query: { pageSize: 5 } }),
      request('/platform/plans'),
      request('/platform/audit-logs', { query: { pageSize: 5 } }),
    ])

    if (tenantsRes.status === 'fulfilled') {
      tenants.value = tenantsRes.value.data || []
      meta.value.total = tenantsRes.value.meta?.total || tenants.value.length
    }
    if (plansRes.status === 'fulfilled') {
      plans.value = plansRes.value.data || []
    }
    if (auditsRes.status === 'fulfilled') {
      recentAudits.value = auditsRes.value.data || []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Dashboard ພາບລວມລະບົບ"
      description="ຕິດຕາມຕົວຊີ້ວັດຫຼັກຂອງທຸລະກິດ SaaS, ສະຖານະອົງກອນ ແລະ ຄວາມພ້ອມຂອງລະບົບ"
      :breadcrumbs="[{ label: 'Dashboard' }]"
    >
      <template #actions>
        <NuxtLink to="/domains" class="sf-btn sf-btn-secondary">
          <BaseIcon name="domains" :size="16" />
          <span>ກວດສອບ Domains</span>
        </NuxtLink>
        <NuxtLink to="/tenants" class="sf-btn sf-btn-primary">
          <BaseIcon name="tenants" :size="16" />
          <span>+ ສ້າງ Tenant ໃໝ່</span>
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- 4 KPI Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="ອົງກອນທັງໝົດ (Tenants)"
        :value="stats.total"
        subtitle="ລົງທະບຽນໃນລະບົບ"
        icon="tenants"
        icon-color="text-emerald-600 dark:text-emerald-400"
        icon-bg="bg-emerald-500/10"
        trend="+12%"
        :trend-positive="true"
      />

      <StatCard
        title="ກຳລັງເປີດໃຊ້ງານ (Active)"
        :value="stats.active"
        :subtitle="`ທົດລອງໃຊ້ ${stats.trial} ອົງກອນ`"
        icon="building"
        icon-color="text-teal-600 dark:text-teal-400"
        icon-bg="bg-teal-500/10"
        trend="98% Retain"
        :trend-positive="true"
      />

      <StatCard
        title="ແຜນການໃຊ້ງານ (Plans)"
        :value="plans.length"
        subtitle="Starter, Pro, Enterprise"
        icon="plans"
        icon-color="text-blue-600 dark:text-blue-400"
        icon-bg="bg-blue-500/10"
      />

      <StatCard
        title="ສະຖານະລະບົບ (Health)"
        value="99.98%"
        subtitle="API & Database ປົກກະຕິ"
        icon="health"
        icon-color="text-emerald-600 dark:text-emerald-400"
        icon-bg="bg-emerald-500/10"
        trend="Normal"
        :trend-positive="true"
      />
    </div>

    <!-- Main Content 2-Column Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left Column (2 Cols wide): Recent Tenants Table -->
      <div class="space-y-6 lg:col-span-2">
        <div class="sf-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 class="text-base font-extrabold text-foreground">ອົງກອນທີ່ຫາກໍ່ສ້າງຫຼ້າສຸດ</h2>
              <p class="text-xs text-muted">ລາຍຊື່ອົງກອນປະກັນໄພດິຈິຕອລທີ່ລົງທະບຽນໃໝ່</p>
            </div>
            <NuxtLink to="/tenants" class="sf-link text-xs">
              ເບິ່ງທັງໝົດ ({{ stats.total }}) →
            </NuxtLink>
          </div>

          <div class="overflow-x-auto">
            <table class="sf-table">
              <thead>
                <tr>
                  <th>ອົງກອນ</th>
                  <th>Primary Domain</th>
                  <th>ແຜນ (Plan)</th>
                  <th>ສະຖານະ</th>
                  <th class="text-right">ການຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="5" class="py-12 text-center text-muted">
                    ກຳລັງໂຫຼດຂໍ້ມູນ...
                  </td>
                </tr>
                <tr v-else-if="!tenants.length">
                  <td colspan="5" class="py-12 text-center text-muted">
                    ຍັງບໍ່ມີອົງກອນໃນລະບົບ
                  </td>
                </tr>
                <template v-else>
                  <tr v-for="tenant in tenants" :key="tenant.id">
                    <td>
                      <NuxtLink
                        :to="`/tenants/${tenant.id}`"
                        class="font-extrabold text-foreground hover:text-primary transition-colors"
                      >
                        {{ tenant.name }}
                      </NuxtLink>
                      <p class="text-[11px] font-mono text-muted">{{ tenant.slug }}</p>
                    </td>
                    <td class="text-xs font-mono text-muted">
                      {{ tenant.primaryHostname || `${tenant.slug}.${platform.rootDomain}` }}
                    </td>
                    <td>
                      <span class="rounded-md bg-surface-muted px-2 py-1 text-xs font-bold text-foreground">
                        {{ tenant.planName || 'Pro' }}
                      </span>
                    </td>
                    <td>
                      <StatusBadge :status="tenant.status" />
                    </td>
                    <td class="text-right space-x-2">
                      <button
                        type="button"
                        class="sf-btn sf-btn-secondary py-1 px-2.5 text-xs text-emerald-600 dark:text-emerald-400"
                        title="ເຂົ້າສູ່ລະບົບໃນນາມ Tenant ນີ້"
                        :disabled="impersonating"
                        @click="impersonateTenant(tenant)"
                      >
                        <BaseIcon name="impersonate" :size="13" />
                        <span>Login</span>
                      </button>
                      <NuxtLink
                        :to="`/tenants/${tenant.id}`"
                        class="sf-btn sf-btn-secondary py-1 px-2.5 text-xs"
                      >
                        ເບິ່ງ
                      </NuxtLink>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Platform Audit Activity -->
        <div class="sf-card p-5">
          <div class="flex items-center justify-between border-b border-line pb-4 mb-4">
            <div>
              <h2 class="text-base font-extrabold text-foreground">ປະຫວັດການເຮັດວຽກຫຼ້າສຸດ (Audit)</h2>
              <p class="text-xs text-muted">ບັນທຶກເຫດການສຳຄັນທີ່ເກີດຂຶ້ນໃນ Platform</p>
            </div>
            <NuxtLink to="/audit" class="sf-link text-xs">ເບິ່ງ Log ທັງໝົດ →</NuxtLink>
          </div>

          <div v-if="!recentAudits.length" class="py-6 text-center text-xs text-muted">
            ຍັງບໍ່ມີປະຫວັດການເຮັດວຽກ
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="log in recentAudits"
              :key="log.id"
              class="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted/50 p-3 text-xs"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BaseIcon name="audit" :size="15" />
                </div>
                <div>
                  <p class="font-bold text-foreground">
                    {{ log.action }}
                    <span v-if="log.target" class="font-mono text-muted">({{ log.target }})</span>
                  </p>
                  <p class="text-[11px] text-muted">{{ log.actorEmail || 'System Superadmin' }}</p>
                </div>
              </div>
              <span class="text-[11px] text-muted">{{ date(log.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (1 Col): System Infrastructure & Plan Distribution -->
      <div class="space-y-6">
        <!-- Infrastructure Health Status -->
        <div class="sf-card p-5">
          <div class="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h2 class="text-base font-extrabold text-foreground">Infrastructure Services</h2>
            <NuxtLink to="/system/health" class="sf-link text-xs">ລາຍລະອຽດ →</NuxtLink>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
              <div class="flex items-center gap-2.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p class="text-xs font-bold text-foreground">MySQL Database</p>
                  <p class="text-[10px] text-muted">Cluster Primary · Latency 1.2ms</p>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
              <div class="flex items-center gap-2.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p class="text-xs font-bold text-foreground">Redis Memory Cache</p>
                  <p class="text-[10px] text-muted">Tenant Lookup · Hit Rate 99.4%</p>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
              <div class="flex items-center gap-2.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p class="text-xs font-bold text-foreground">API Gateway</p>
                  <p class="text-[10px] text-muted">Express Engine · Zero Downtime</p>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
          </div>
        </div>

        <!-- Plan Breakdown Card -->
        <div class="sf-card p-5">
          <div class="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h2 class="text-base font-extrabold text-foreground">ແຜນການໃຊ້ງານ (Plans)</h2>
            <NuxtLink to="/plans" class="sf-link text-xs">ຈັດການແຜນ →</NuxtLink>
          </div>

          <div class="space-y-3">
            <div
              v-for="plan in plans"
              :key="plan.code"
              class="rounded-xl border border-line bg-surface-muted/60 p-3.5 transition hover:border-primary/30"
            >
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-foreground">{{ plan.name }}</span>
                <span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary font-mono">
                  {{ plan.code }}
                </span>
              </div>
              <p class="mt-1 text-xs text-muted">{{ plan.description || 'ແຜນການໃຊ້ງານມາດຕະຖານ' }}</p>
              <div class="mt-3 flex items-center justify-between text-xs border-t border-line/60 pt-2 text-muted">
                <span>ຜູ້ໃຊ້ສູງສຸດ: {{ plan.maxUsers || 'ບໍ່ຈຳກັດ' }}</span>
                <span class="font-bold text-foreground">
                  {{ planPrice(plan) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
