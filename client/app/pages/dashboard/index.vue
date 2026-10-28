<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ພາບລວມທຸລະກິດ"
      description="ຍອດຂາຍສະສົມ, ເປົ້າໝາຍປີ, ຜົນງານ 11 ບໍລິສັດ ແລະ ສັນຍາໃກ້ໝົດອາຍຸ."
    >
      <template #actions>
        <BaseButton variant="secondary" icon="summarize" @click="navigateTo('/reports/underwriting/date-range')">
          ລາຍງານ Underwriting
        </BaseButton>
        <BaseButton icon="add" @click="navigateTo('/policies/create')">ເຮັດປະກັນໄພ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="ເປົ້າໝາຍປີ"
        :value="format.currency(data.target)"
        icon="flag"
        highlight
        hint="Target 2026"
      />
      <StatCard
        label="ຍອດຂາຍປີ 2021"
        :value="format.currency(data.ytdPrevious)"
        icon="history"
        hint="ປີຜ່ານມາ"
      />
      <StatCard
        label="ຍອດຂາຍປີ 2022"
        :value="format.currency(data.ytdCurrent)"
        icon="trending_up"
        :trend="`+${data.growthRate}%`"
      />
      <StatCard
        label="Variance"
        :value="format.currency(data.variance)"
        icon="difference"
        :trend="`ຄວາມຄືບໜ້າ ${data.achievementRate}%`"
        trend-tone="warning"
        hint="ຍັງຕ້ອງເຮັດໃຫ້ຮອດເປົ້າ"
      />
    </div>

    <section class="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <BaseCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold">ແນວໂນ້ມເບ້ຍປະກັນ ແລະ ຄ່າສິນໄໝ</h2>
              <p class="mt-0.5 text-xs text-muted">ປຽບທຽບ GWP ກັບຍອດເຄມຈ່າຍຈິງປະຈຳປີ</p>
            </div>
            <BaseBadge tone="neutral">2026</BaseBadge>
          </div>
        </template>
        <ApexChart
          type="bar"
          :height="280"
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
        <ApexChart
          type="donut"
          :height="280"
          :options="productMixOptions"
          :series="productMixSeries"
        />
      </BaseCard>
    </section>

    <BaseCard flush>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold">YTD Sales by Insurance Company</h2>
            <p class="mt-0.5 text-xs text-muted">ຍອດຂາຍສະສົມຕາມ 11 ບໍລິສັດປະກັນໄພ</p>
          </div>
          <BaseBadge tone="primary">{{ format.compact(totalYtd) }} LAK</BaseBadge>
        </div>
      </template>
      <div
        class="overflow-x-auto"
        tabindex="0"
        role="region"
        aria-label="ຍອດຂາຍສະສົມຕາມບໍລິສັດປະກັນໄພ"
      >
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="px-4 py-3 font-bold">#</th>
              <th class="px-4 py-3 font-bold">ບໍລິສັດປະກັນໄພ</th>
              <th class="px-4 py-3 font-bold">ສັດສ່ວນ</th>
              <th class="px-4 py-3 text-right font-bold">ສັນຍາ</th>
              <th class="px-4 py-3 text-right font-bold">ຍອດຂາຍສະສົມ (LAK)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="(row, index) in data.insurerYtd"
              :key="row.code"
              class="hover:bg-surface-muted/40"
            >
              <td class="px-4 py-3 text-xs font-bold text-muted">{{ index + 1 }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <img
                    v-if="row.logo"
                    :src="row.logo"
                    :alt="row.name"
                    class="h-8 w-8 shrink-0 rounded-lg bg-surface-muted object-contain p-0.5"
                  />
                  <span
                    v-else
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary-text"
                  >
                    {{ row.code }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold">{{ row.nameLao }}</p>
                    <p class="truncate text-[11px] text-muted">{{ row.name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-24 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      class="h-full rounded-full bg-primary"
                      :style="{ width: `${share(row.value)}%` }"
                    />
                  </div>
                  <span class="text-xs text-muted">{{ share(row.value) }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right tabular-nums">{{ row.policyCount }}</td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.currency(row.value) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-line bg-surface-muted/60">
              <td colspan="4" class="px-4 py-3 text-right text-sm font-bold">ລວມທັງໝົດ</td>
              <td class="px-4 py-3 text-right font-bold tabular-nums text-primary-text">
                {{ format.currency(totalYtd) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </BaseCard>

    <section class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <BaseCard flush>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold">ສັນຍາໃກ້ໝົດອາຍຸ</h2>
              <p class="mt-0.5 text-xs text-muted">ໂອກາດຕໍ່ອາຍຸພາຍໃນ 30 ວັນ</p>
            </div>
            <NuxtLink
              to="/reports/underwriting/expiration"
              class="text-xs font-bold text-primary-text hover:underline"
            >
              ເບິ່ງທັງໝົດ
            </NuxtLink>
          </div>
        </template>
        <ul class="divide-y divide-line">
          <li
            v-for="policy in data.expiringPolicies"
            :key="policy.id"
            class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted/40"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ policy.customerName }}</p>
              <p class="text-xs text-muted">
                {{ policy.policyNumber }} · {{ policy.companyCode }} · {{ policy.productName }}
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
              <h2 class="text-sm font-bold">ຕົວແທນຍອດຂາຍດີເດັ່ນ</h2>
              <p class="mt-0.5 text-xs text-muted">Top 5 ຕາມຍອດຂາຍສະສົມ</p>
            </div>
            <NuxtLink to="/agents" class="text-xs font-bold text-primary-text hover:underline">
              ຈັດການ
            </NuxtLink>
          </div>
        </template>
        <ol class="divide-y divide-line">
          <li
            v-for="(agent, index) in data.topAgents"
            :key="agent.id"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-text"
            >
              #{{ index + 1 }}
            </span>
            <BaseAvatar :name="agent.name" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">{{ agent.name }}</p>
              <p class="text-xs text-muted">{{ agent.teamName }}</p>
            </div>
            <p class="text-sm font-bold tabular-nums">{{ format.currency(agent.salesYtd) }}</p>
          </li>
        </ol>
      </BaseCard>
    </section>

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold">ແຈ້ງເຕືອນວັນເກີດ</h2>
            <p class="mt-0.5 text-xs text-muted">ລູກຄ້າ ແລະ ຕົວແທນທີ່ມີວັນເກີດໃນ 7 ວັນຂ້າງໜ້າ</p>
          </div>
          <BaseBadge tone="warning">{{ data.birthdayPreview.length }} ຄົນ</BaseBadge>
        </div>
      </template>
      <div class="grid gap-3 sm:grid-cols-3">
        <div
          v-for="item in data.birthdayPreview"
          :key="item.name"
          class="rounded-xl border border-warning/30 bg-warning/5 p-3"
        >
          <div class="flex items-center gap-2">
            <BaseIcon name="cake" class="text-warning" />
            <p class="text-sm font-bold">{{ item.name }}</p>
          </div>
          <p class="mt-1 text-xs text-muted">
            {{ item.type === 'agent' ? 'ຕົວແທນ' : 'ລູກຄ້າ' }} · {{ format.date(item.date) }}
          </p>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { dashboard as data } from '~/mocks/dashboard'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ພາບລວມທຸລະກິດ',
  permission: 'dashboard.view',
})

const format = useFormat()

const totalYtd = data.ytdCurrent
const share = (value) => Math.round((value / totalYtd) * 1000) / 10

const monthlyChartSeries = computed(() => [
  { name: 'ເບ້ຍປະກັນ (GWP)', data: data.monthly.map((item) => item.value) },
  { name: 'ຄ່າສິນໄໝ (Claims)', data: data.monthly.map((item) => item.claimsValue || 0) },
])

const monthlyChartOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: data.monthly.map((item) => item.label) },
  yaxis: { labels: { formatter: (value) => format.compact(value) } },
  tooltip: { y: { formatter: (value) => format.currency(value) } },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  legend: { position: 'top', horizontalAlign: 'right' },
  colors: ['#047857', '#f59e0b'],
}))

const productMixSeries = data.productMix.map((item) => item.value)
const productMixOptions = computed(() => ({
  labels: data.productMix.map((item) => item.label),
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: (value) => `${value}%` } },
  colors: ['#047857', '#ef4444', '#f59e0b', '#9ca3af'],
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
</script>
