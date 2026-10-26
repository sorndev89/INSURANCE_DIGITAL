<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ເຄມທັງໝົດ" :value="format.number(data?.total)" icon="assignment" />
      <StatCard
        label="ລໍຖ້າ/ກວດສອບ"
        :value="format.number((data?.pending || 0) + (data?.reviewing || 0))"
        icon="pending_actions"
        trend-tone="warning"
      />
      <StatCard label="ຍອດເຄມ" :value="format.currency(data?.amount)" icon="payments" highlight />
      <StatCard
        label="ອັດຕາເຄມ"
        :value="format.percent(data?.ratio, 1)"
        icon="pie_chart"
        trend-tone="danger"
      />
    </div>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection title="ສະຖານະເຄມ" :loading="pending" :error="error" @retry="refresh">
        <ApexChart
          type="donut"
          :height="280"
          :options="statusChartOptions"
          :series="statusChartSeries"
        />
      </ReportSection>

      <ReportSection title="ເຄມຕາມປະເພດ" :loading="pending" :error="error" @retry="refresh">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-line text-left text-xs uppercase tracking-wider text-muted"
              >
                <th class="pb-2 pr-3 font-bold">ປະເພດ</th>
                <th class="pb-2 pr-3 text-right font-bold">ຈຳນວນ</th>
                <th class="pb-2 text-right font-bold">ມູນຄ່າ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="item in data?.byType || []" :key="item.key">
                <td class="py-2 pr-3 font-bold">{{ item.label }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ format.number(item.count) }}</td>
                <td class="py-2 text-right font-bold tabular-nums">
                  {{ format.currency(item.value) }}
                </td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-if="!data?.byType?.length" title="ບໍ່ມີຂໍ້ມູນ" />
        </div>
      </ReportSection>
    </div>

    <ReportSection
      title="ມູນຄ່າເຄມຕາມເດືອນ"
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

    <ReportSection title="ເຄມລ່າສຸດ" :loading="pending" :error="error" @retry="refresh">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ເລກເຄມ</th>
              <th class="pb-2 pr-3 font-bold">ລູກຄ້າ</th>
              <th class="pb-2 pr-3 font-bold">ປະເພດ</th>
              <th class="pb-2 pr-3 text-right font-bold">ມູນຄ່າ</th>
              <th class="pb-2 text-right font-bold">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.recent || []" :key="item.id">
              <td class="py-2 pr-3 font-bold">{{ item.claimNumber }}</td>
              <td class="py-2 pr-3">{{ item.customerName }}</td>
              <td class="py-2 pr-3">{{ item.type }}</td>
              <td class="py-2 pr-3 text-right font-bold tabular-nums">
                {{ format.currency(item.amount) }}
              </td>
              <td class="py-2 text-right"><StatusBadge :status="item.status" /></td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.recent?.length" title="ບໍ່ມີເຄມ" />
      </div>
    </ReportSection>
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
const { data, pending, error, refresh } = useReport('claims', props.range)

const byStatus = computed(() => data.value?.byStatus || [])
const statusChartSeries = computed(() => byStatus.value.map((item) => item.count))
const statusChartOptions = computed(() =>
  donutChartOptions({
    labels: byStatus.value.map((item) => item.label),
    tooltipFormatter: (value) => `${format.number(value)} ເຄມ`,
    totalLabel: 'ລວມເຄມ',
    totalFormatter: () => format.number(data.value?.total),
  }),
)

const monthly = computed(() => data.value?.monthly || [])
const monthlyChartSeries = computed(() => [
  { name: 'ມູນຄ່າເຄມ', data: monthly.value.map((item) => item.value) },
])
const monthlyChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
  }),
)
</script>
