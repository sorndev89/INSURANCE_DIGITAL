<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- 1. Tenant Header & Context -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-3">
        <BaseAvatar
          v-if="tenant.logoUrl"
          :src="tenant.logoUrl"
          :name="tenant.brandName"
          size="lg"
          class="ring-2 ring-primary/20 shadow-sm"
        />
        <div
          v-else
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-text font-bold shadow-sm"
        >
          <BaseIcon name="domain" size="md" />
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="truncate text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {{ tenant.brandName }}
            </h1>
            <BaseBadge tone="success" dot>Active</BaseBadge>
            <BaseBadge tone="neutral" class="hidden sm:inline-flex">
              {{ data?.quota?.planName || 'Enterprise Plan' }}
            </BaseBadge>
          </div>
          <p class="mt-0.5 text-xs sm:text-sm text-muted">
            ລະຫັດ: <span class="font-semibold text-foreground">{{ tenant.slug }}</span> ·
            ສູນບັນຊາການ ແລະ ພາບລວມທຸລະກິດ
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="w-36">
          <BaseSelect
            v-model="selectedPeriod"
            :options="periodOptions"
            aria-label="ເລືອກຊ່ວງເວລາ"
          />
        </div>
        <BaseButton
          variant="secondary"
          icon="refresh"
          :loading="pending"
          aria-label="ໂຫຼດໃໝ່"
          @click="refresh"
        />
        <BaseButton icon="add" @click="navigateTo('/policies/create')"> ເຮັດປະກັນໄພ </BaseButton>
      </div>
    </header>

    <ErrorState v-if="error" message="ກະລຸນາລອງໃໝ່" @retry="refresh" />

    <template v-else>
      <!-- 2. Urgent Action Center (Triage Strip) -->
      <section aria-labelledby="triage-heading">
        <h2 id="triage-heading" class="sr-only">ວຽກດ່ວນທີ່ຕ້ອງດຳເນີນການ</h2>
        <div class="grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
          <NuxtLink
            to="/policies?status=pending"
            class="group flex items-center gap-2.5 sm:gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 sm:p-3.5 shadow-sm transition-all duration-150 hover:bg-warning/10 hover:border-warning/50 active:scale-[0.99]"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning group-hover:scale-105 transition-transform"
            >
              <BaseIcon name="hourglass_top" size="md" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-muted">ລໍຖ້າອະນຸມັດກົມມະທັນ</p>
              <p class="text-base sm:text-lg font-bold text-foreground tabular-nums">
                {{ format.number(data?.triage?.pendingPolicies || 0) }}
                <span class="text-xs font-normal text-muted">ລາຍການ</span>
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/claims?status=pending"
            class="group flex items-center gap-2.5 sm:gap-3 rounded-xl border border-danger/30 bg-danger/5 p-3 sm:p-3.5 shadow-sm transition-all duration-150 hover:bg-danger/10 hover:border-danger/50 active:scale-[0.99]"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/20 text-danger group-hover:scale-105 transition-transform"
            >
              <BaseIcon name="report_problem" size="md" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-muted">ເຄມລໍຖ້າກວດສອບ</p>
              <p class="text-base sm:text-lg font-bold text-foreground tabular-nums">
                {{ format.number(data?.triage?.pendingClaims || 0) }}
                <span class="text-xs font-normal text-muted">ລາຍການ</span>
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/policies"
            class="group flex items-center gap-2.5 sm:gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-3.5 shadow-sm transition-all duration-150 hover:bg-primary/10 hover:border-primary/50 active:scale-[0.99]"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary-text group-hover:scale-105 transition-transform"
            >
              <BaseIcon name="event_repeat" size="md" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-muted">ໃກ້ໝົດອາຍຸ (30 ວັນ)</p>
              <p class="text-base sm:text-lg font-bold text-foreground tabular-nums">
                {{
                  format.number(data?.triage?.expiringCount || data?.expiringPolicies?.length || 0)
                }}
                <span class="text-xs font-normal text-muted">ລາຍການ</span>
              </p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/finance"
            class="group flex items-center gap-2.5 sm:gap-3 rounded-xl border border-line bg-surface-muted/60 p-3 sm:p-3.5 shadow-sm transition-all duration-150 hover:bg-surface-muted hover:border-neutral-400 active:scale-[0.99]"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-line text-muted group-hover:scale-105 transition-transform"
            >
              <BaseIcon name="pending_actions" size="md" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-muted">ໃບເກັບເງິນກາຍກຳນົດ</p>
              <p class="text-base sm:text-lg font-bold text-foreground tabular-nums">
                {{ format.number(data?.triage?.overdueInvoices || 0) }}
                <span class="text-xs font-normal text-muted">ລາຍການ</span>
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- 3. Key Financial & Operational KPIs -->
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" class="sr-only">ຕົວຊີ້ວັດຫຼັກ</h2>
        <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="ເບ້ຍປະກັນຮັບລວມ (GWP)"
            :value="format.currency(data?.kpis?.revenueThisMonth || 0)"
            icon="payments"
            :trend="`${(data?.kpis?.revenueTrend || 0) >= 0 ? '+' : ''}${data?.kpis?.revenueTrend || 0}%`"
            :trend-tone="(data?.kpis?.revenueTrend || 0) >= 0 ? 'success' : 'danger'"
            hint="ທຽບກັບງວດກ່ອນ"
            highlight
            :loading="pending"
          />
          <StatCard
            label="ຍອດເກັບເງິນແລ້ວ"
            :value="format.currency(data?.kpis?.collectedPremium || 0)"
            icon="account_balance_wallet"
            :trend="`ເກັບໄດ້ ${data?.kpis?.collectionRate || 92}%`"
            trend-tone="success"
            hint="ອັດຕາການເກັບເງິນ"
            :loading="pending"
          />
          <StatCard
            label="ປະກັນໄພມີຜົນ"
            :value="format.number(data?.kpis?.activePolicies || 0)"
            icon="verified_user"
            :trend="`Retention ${data?.kpis?.retentionRate || 88}%`"
            trend-tone="success"
            hint="ອັດຕາການຕໍ່ອາຍຸ"
            :loading="pending"
          />
          <StatCard
            label="ອັດຕາເຄມ (Loss Ratio)"
            :value="format.percent(data?.kpis?.claimsRatio || 0, 0)"
            icon="pie_chart"
            :trend="(data?.kpis?.claimsRatio || 0) > 60 ? 'ຄວາມສ່ຽງສູງ' : 'ຄວບຄຸມໄດ້ດີ'"
            :trend-tone="(data?.kpis?.claimsRatio || 0) > 60 ? 'danger' : 'success'"
            hint="ມາດຕະຖານ < 55%"
            :loading="pending"
          />
        </div>
      </section>

      <!-- 4. Deep Visual Analytics -->
      <section class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ແນວໂນ້ມເບ້ຍປະກັນ ແລະ ຄ່າສິນໄໝ</h2>
                <p class="mt-0.5 text-xs text-muted">ປຽບທຽບຍອດຂາຍ (GWP) ກັບຍອດເຄມຈ່າຍຈິງປະຈຳປີ</p>
              </div>
              <BaseBadge tone="neutral">2026</BaseBadge>
            </div>
          </template>
          <div v-if="pending" class="flex h-56 items-end gap-2">
            <BaseSkeleton v-for="index in 12" :key="index" class="flex-1" height="xl" />
          </div>
          <ApexChart
            v-else
            type="bar"
            :height="270"
            :options="monthlyChartOptions"
            :series="monthlyChartSeries"
          />
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ສັດສ່ວນຜະລິດຕະພັນ</h2>
              <BaseBadge tone="primary" size="sm">Portfolio</BaseBadge>
            </div>
          </template>
          <div v-if="pending" class="space-y-4">
            <BaseSkeleton v-for="index in 4" :key="index" height="lg" />
          </div>
          <ApexChart
            v-else
            type="donut"
            :height="270"
            :options="productMixOptions"
            :series="productMixSeries"
          />
        </BaseCard>
      </section>

      <!-- 5. Operational Modules: Expiring & Claims -->
      <section class="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ປະກັນໄພໃກ້ໝົດອາຍຸ</h2>
                <p class="mt-0.5 text-xs text-muted">ໂອກາດຕໍ່ອາຍຸສັນຍາພາຍໃນ 30 ວັນ</p>
              </div>
              <NuxtLink to="/policies" class="text-xs font-bold text-primary-text hover:underline">
                ເບິ່ງທັງໝົດ
              </NuxtLink>
            </div>
          </template>
          <div v-if="pending" class="space-y-3 p-4">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ul v-else class="divide-y divide-line">
            <li
              v-for="policy in data?.expiringPolicies || []"
              :key="policy.id"
              class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted/40 transition-colors"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-foreground">{{ policy.customerName }}</p>
                <p class="text-xs text-muted">
                  {{ policy.policyNumber }} · {{ policy.productName }}
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-xs font-bold text-warning">{{ format.date(policy.endDate) }}</p>
                <p class="text-xs text-muted">{{ format.phone(policy.phone) }}</p>
              </div>
            </li>
          </ul>
        </BaseCard>

        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ເຄມລ່າສຸດ</h2>
                <p class="mt-0.5 text-xs text-muted">ສະຖານະການດຳເນີນການຊົດເຊີຍ</p>
              </div>
              <NuxtLink to="/claims" class="text-xs font-bold text-primary-text hover:underline">
                ເບິ່ງທັງໝົດ
              </NuxtLink>
            </div>
          </template>
          <div v-if="pending" class="space-y-3 p-4">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ul v-else class="divide-y divide-line">
            <li
              v-for="claim in data?.recentClaims || []"
              :key="claim.id"
              class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted/40 transition-colors"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-foreground">{{ claim.claimant }}</p>
                <p class="text-xs text-muted">
                  {{ claim.claimNumber }} · {{ format.currency(claim.amount) }}
                </p>
              </div>
              <StatusBadge :status="claim.status" />
            </li>
          </ul>
        </BaseCard>
      </section>

      <!-- 6. Distribution Team & Financial Activity -->
      <section class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ຕົວແທນຍອດຂາຍດີເດັ່ນ</h2>
              <span class="text-xs text-muted">
                Active {{ data?.kpis?.activeAgents || 0 }}/{{ data?.kpis?.totalAgents || 0 }}
              </span>
            </div>
          </template>
          <div v-if="pending" class="space-y-3">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ol v-else class="space-y-4">
            <li
              v-for="(agent, index) in data?.topAgents || []"
              :key="agent.id"
              class="flex items-center gap-3"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-text"
              >
                #{{ index + 1 }}
              </span>
              <BaseAvatar :src="agent.avatar" :name="agent.name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-foreground">{{ agent.name }}</p>
                <p class="text-xs text-muted">{{ agent.teamName || 'ທີມງານທົ່ວໄປ' }}</p>
              </div>
              <p class="text-sm font-bold tabular-nums text-foreground">
                {{ format.currency(agent.sales) }}
              </p>
            </li>
          </ol>
        </BaseCard>

        <BaseCard class="lg:col-span-2" flush>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ລາຍການເຄື່ອນໄຫວການເງິນລ່າສຸດ</h2>
              <NuxtLink to="/finance" class="text-xs font-bold text-primary-text hover:underline">
                ຈັດການການເງິນ
              </NuxtLink>
            </div>
          </template>
          <DataTable
            :bordered="false"
            :columns="transactionColumns"
            :rows="data?.recentTransactions || []"
            :loading="pending"
            :total="data?.recentTransactions?.length || 0"
            :page-size="5"
            caption="ລາຍການເຄື່ອນໄຫວລ່າສຸດ"
          >
            <template #cell-amount="{ value }">
              <span class="font-bold tabular-nums text-foreground">{{
                format.currency(value)
              }}</span>
            </template>
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </DataTable>
        </BaseCard>
      </section>

      <!-- 7. Tenant SaaS Health & Quota Banner -->
      <footer
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
          >
            <BaseIcon name="verified" size="md" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-bold text-foreground">
                ສະຖານະລະບົບ ແລະ ຊັບພະຍາກອນ (Tenant Quota)
              </p>
              <BaseBadge tone="primary" size="sm">{{
                data?.quota?.planName || 'Enterprise'
              }}</BaseBadge>
            </div>
            <p class="text-xs text-muted">
              ຕໍ່ອາຍຸການໃຊ້ງານໃນອີກ
              <span class="font-bold text-foreground">{{ data?.quota?.daysLeft || 185 }}</span> ວັນ
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted">
          <div>
            ຜູ້ໃຊ້ງານ:
            <span class="font-bold text-foreground">
              {{ data?.quota?.userCount || 14 }}/{{ data?.quota?.maxUsers || 25 }} ບັນຊີ
            </span>
          </div>
          <div>
            ພື້ນທີ່ຈັດເກັບ:
            <span class="font-bold text-foreground">
              {{ data?.quota?.storageUsedGb || 1.8 }}/{{ data?.quota?.maxStorageGb || 5.0 }} GB
            </span>
          </div>
          <NuxtLink to="/settings" class="font-bold text-primary-text hover:underline">
            ຕັ້ງຄ່າລະບົບ
          </NuxtLink>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { useDashboard } from '~/composables/api/useDashboard'
import { useTenantStore } from '~/stores/tenant'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ພາບລວມຂອງ Tenant',
  permission: 'dashboard.view',
})

const tenant = useTenantStore()
const format = useFormat()

const selectedPeriod = ref('month')
const periodOptions = [
  { label: 'ເດືອນນີ້', value: 'month' },
  { label: 'ໄຕຣມາດນີ້', value: 'quarter' },
  { label: 'ປີນີ້', value: 'year' },
]

const { data, pending, error, refresh } = useDashboard({ period: selectedPeriod })

const monthlySales = computed(() => data.value?.monthlySales || [])
const monthlyChartSeries = computed(() => [
  {
    name: 'ເບ້ຍປະກັນ (GWP)',
    data: monthlySales.value.map((item) => item.value),
  },
  {
    name: 'ຄ່າສິນໄໝ (Claims)',
    data: monthlySales.value.map((item) => item.claimsValue || 0),
  },
])

const monthlyChartOptions = computed(() => ({
  xaxis: { categories: monthlySales.value.map((item) => item.label) },
  yaxis: {
    labels: { formatter: (value) => format.compact(value) },
  },
  tooltip: {
    y: { formatter: (value) => format.currency(value) },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '55%',
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
}))

const productMix = computed(() => data.value?.productMix || [])
const productMixSeries = computed(() => productMix.value.map((item) => item.value))
const productMixOptions = computed(() => ({
  labels: productMix.value.map((item) => item.label),
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: (value) => `${value}%` } },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: { show: true, label: 'ລວມ', formatter: () => '100%' },
        },
      },
    },
  },
}))

const transactionColumns = [
  { key: 'id', label: 'ເລກທີ' },
  { key: 'customerName', label: 'ລູກຄ້າ', hideOn: ['mobile'] },
  { key: 'type', label: 'ປະເພດ', hideOn: ['mobile'] },
  { key: 'date', label: 'ວັນທີ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right' },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
