<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="ລໍຖ້າຈ່າຍ"
        :value="format.currency(data?.pendingAmount)"
        icon="pending"
        trend-tone="warning"
      />
      <StatCard label="ຈ່າຍແລ້ວ" :value="format.currency(data?.paidAmount)" icon="task_alt" />
      <StatCard
        label="ລວມຄອມມິດຊັ່ນ"
        :value="format.currency(data?.totalAmount)"
        icon="payments"
        highlight
      />
      <StatCard label="ລາຍການ" :value="format.number(data?.total)" icon="receipt_long" />
    </div>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection title="ຕາມສະຖານະ" :loading="pending" :error="error" @retry="refresh">
        <div class="space-y-3">
          <div
            v-for="item in data?.byStatus || []"
            :key="item.key"
            class="flex items-center justify-between gap-3"
          >
            <StatusBadge :status="item.key" />
            <span class="flex-1 text-right text-sm tabular-nums">{{
              format.number(item.count)
            }}</span>
            <span class="w-28 text-right text-sm font-bold tabular-nums">
              {{ format.currency(item.value) }}
            </span>
          </div>
          <EmptyState v-if="!data?.byStatus?.length" title="ບໍ່ມີຄອມມິດຊັ່ນໃນໄລຍະນີ້" />
        </div>
      </ReportSection>

      <ReportSection
        title="ຄອມມິດຊັ່ນຕາມເດືອນ"
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
    </div>

    <ReportSection title="ຄອມມິດຊັ່ນຕາມຕົວແທນ" :loading="pending" :error="error" @retry="refresh">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ຕົວແທນ</th>
              <th class="pb-2 pr-3 text-right font-bold">ລາຍການ</th>
              <th class="pb-2 pr-3 text-right font-bold">ລໍຖ້າ</th>
              <th class="pb-2 pr-3 text-right font-bold">ຈ່າຍແລ້ວ</th>
              <th class="pb-2 text-right font-bold">ລວມ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.byAgent || []" :key="item.id">
              <td class="py-2 pr-3">
                <p class="font-bold">{{ item.name }}</p>
                <p class="text-xs text-muted">{{ item.teamName }}</p>
              </td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.number(item.count) }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.currency(item.pending) }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.currency(item.paid) }}</td>
              <td class="py-2 text-right font-bold tabular-nums">
                {{ format.currency(item.value) }}
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.byAgent?.length" title="ບໍ່ມີຄອມມິດຊັ່ນ" />
      </div>
    </ReportSection>

    <ReportSection title="ລາຍການລ່າສຸດ" :loading="pending" :error="error" @retry="refresh">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ຕົວແທນ</th>
              <th class="pb-2 pr-3 font-bold">ປະກັນໄພ</th>
              <th class="pb-2 pr-3 text-right font-bold">ອັດຕາ</th>
              <th class="pb-2 pr-3 text-right font-bold">ຈຳນວນ</th>
              <th class="pb-2 text-right font-bold">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.recent || []" :key="item.id">
              <td class="py-2 pr-3 font-bold">{{ item.agentName }}</td>
              <td class="py-2 pr-3">{{ item.policyNumber }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.percent(item.rate, 1) }}</td>
              <td class="py-2 pr-3 text-right font-bold tabular-nums">
                {{ format.currency(item.amount) }}
              </td>
              <td class="py-2 text-right"><StatusBadge :status="item.status" /></td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.recent?.length" title="ບໍ່ມີລາຍການ" />
      </div>
    </ReportSection>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useReport } from '~/composables/api/useReports'
import { barChartOptions } from '~/utils/chartOptions'
import { useFormat } from '~/utils/format'
import ReportSection from './ReportSection.vue'

const props = defineProps({
  range: { type: Object, required: true },
})

const format = useFormat()
const { data, pending, error, refresh } = useReport('commissions', props.range)

const monthly = computed(() => data.value?.monthly || [])
const monthlyChartSeries = computed(() => [
  { name: 'ຄອມມິດຊັ່ນ', data: monthly.value.map((item) => item.value) },
])
const monthlyChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
  }),
)
</script>
