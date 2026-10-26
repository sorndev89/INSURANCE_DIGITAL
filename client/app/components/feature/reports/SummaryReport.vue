<template>
  <div class="space-y-4 sm:space-y-6">
    <ErrorState v-if="error" :message="error" @retry="refresh" />

    <template v-else>
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="ຍອດຂາຍໃນໄລຍະ"
          :value="format.currency(kpis.revenue)"
          icon="payments"
          :trend="revenueTrend"
          hint="ທຽບກັບໄລຍະກ່ອນ"
          highlight
          :loading="pending"
        />
        <StatCard
          label="ຮັບເງິນແລ້ວ"
          :value="format.currency(kpis.collected)"
          icon="account_balance_wallet"
          :loading="pending"
        />
        <StatCard
          label="ປະກັນໄພມີຜົນ"
          :value="format.number(kpis.activePolicies)"
          icon="verified_user"
          :trend="activeTrend"
          :loading="pending"
        />
        <StatCard
          label="ອັດຕາເຄມ"
          :value="format.percent(kpis.claimsRatio, 1)"
          icon="pie_chart"
          trend-tone="danger"
          :loading="pending"
        />
      </div>

      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="ລໍຖ້າອະນຸມັດເຄມ"
          :value="format.number(kpis.pendingApprovals)"
          icon="assignment"
          :loading="pending"
        />
        <StatCard
          label="ໝົດອາຍຸໃນ 30 ວັນ"
          :value="format.number(kpis.expiring30)"
          icon="schedule"
          trend-tone="warning"
          :loading="pending"
        />
        <StatCard
          label="ໜີ້ຄ້າງຊຳລະ"
          :value="format.currency(kpis.outstanding)"
          icon="receipt_long"
          :loading="pending"
        />
        <StatCard
          label="ລູກຄ້າໃໝ່"
          :value="format.number(kpis.newCustomers)"
          icon="person_add"
          :loading="pending"
        />
      </div>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <ReportSection
          title="ຍອດຂາຍ 12 ເດືອນ"
          description="ຍອດເບ້ຍປະກັນຕາມເດືອນ"
          :loading="pending"
          :error="error"
          :skeleton-rows="1"
          @retry="refresh"
        >
          <ApexChart
            type="bar"
            :height="260"
            :options="monthlyChartOptions"
            :series="monthlyChartSeries"
          />
        </ReportSection>

        <ReportSection
          title="ສັດສ່ວນປະເພດປະກັນໄພ"
          description="ອີງໃສ່ເບ້ຍປະກັນໃນໄລຍະ"
          :loading="pending"
          :error="error"
          :skeleton-rows="4"
          @retry="refresh"
        >
          <ApexChart
            type="donut"
            :height="280"
            :options="productMixOptions"
            :series="productMixSeries"
          />
        </ReportSection>
      </div>

      <BaseCard>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p class="text-xs text-muted">ຈຳນວນສັນຍາໃນໄລຍະ</p>
            <p class="mt-1 text-lg font-bold tabular-nums">{{ format.number(kpis.policyCount) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຈຳນວນເຄມໃນໄລຍະ</p>
            <p class="mt-1 text-lg font-bold tabular-nums">{{ format.number(kpis.claimCount) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຍອດເບ້ຍປະກັນລວມ</p>
            <p class="mt-1 text-lg font-bold tabular-nums">{{ format.currency(kpis.revenue) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ໄລຍະລາຍງານ</p>
            <p class="mt-1 text-sm font-bold">
              {{ format.date(range.from) }} – {{ format.date(range.to) }}
            </p>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useReport } from '~/composables/api/useReports'
import { barChartOptions, donutChartOptions } from '~/utils/chartOptions'
import { useFormat } from '~/utils/format'
import ReportSection from './ReportSection.vue'

const props = defineProps({
  range: { type: Object, required: true },
})

const format = useFormat()
const { data, pending, error, refresh } = useReport('summary', props.range)

const kpis = computed(() => data.value?.kpis || {})
const revenueTrend = computed(() => {
  const value = Number(kpis.value.revenueTrend) || 0
  return `${value >= 0 ? '+' : ''}${value}%`
})
const activeTrend = computed(() => {
  const value = Number(kpis.value.activePoliciesTrend) || 0
  return `${value >= 0 ? '+' : ''}${value}%`
})

const monthly = computed(() => data.value?.monthlySales || [])
const monthlyChartSeries = computed(() => [
  { name: 'ຍອດຂາຍ', data: monthly.value.map((item) => item.value) },
])
const monthlyChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
  }),
)

const productMix = computed(() => data.value?.productMix || [])
const productMixSeries = computed(() => productMix.value.map((item) => item.value))
const productMixOptions = computed(() =>
  donutChartOptions({
    labels: productMix.value.map((item) => item.label),
    tooltipFormatter: (value) => format.percent(value, 1),
    totalLabel: 'ລວມ',
    totalFormatter: () => '100%',
  }),
)
</script>
