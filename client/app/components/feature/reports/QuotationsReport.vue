<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ສະເໜີລາຄາທັງໝົດ" :value="format.number(data?.total)" icon="request_quote" />
      <StatCard label="ສົ່ງແລ້ວ" :value="format.number(data?.sent)" icon="send" />
      <StatCard label="ຍອມຮັບ" :value="format.number(data?.accepted)" icon="task_alt" />
      <StatCard
        label="ອັດຕາແປງເປັນສັນຍາ"
        :value="format.percent(data?.conversionRate, 1)"
        icon="percent"
        highlight
      />
    </div>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection
        title="ສະຖານະໃບສະເໜີລາຄາ"
        :description="`ມູນຄ່າລວມ ${format.currency(data?.totalValue)}`"
        :loading="pending"
        :error="error"
        @retry="refresh"
      >
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
          <div class="flex items-center justify-between border-t border-line pt-3 text-sm">
            <span class="font-bold text-muted">ມູນຄ່າລໍຖ້າປິດ (Draft + Sent)</span>
            <span class="font-bold tabular-nums">{{ format.currency(data?.pipelineValue) }}</span>
          </div>
          <EmptyState v-if="!data?.byStatus?.length" title="ບໍ່ມີໃບສະເໜີລາຄາໃນໄລຍະນີ້" />
        </div>
      </ReportSection>

      <ReportSection
        title="ຈຳນວນສະເໜີລາຄາຕາມເດືອນ"
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

    <ReportSection title="ສະເໜີລາຄາລ່າສຸດ" :loading="pending" :error="error" @retry="refresh">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ເລກອ້າງອີງ</th>
              <th class="pb-2 pr-3 font-bold">ລູກຄ້າ</th>
              <th class="pb-2 pr-3 text-right font-bold">ເບ້ຍ</th>
              <th class="pb-2 pr-3 text-right font-bold">ໃຊ້ໄດ້ເຖິງ</th>
              <th class="pb-2 text-right font-bold">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.recent || []" :key="item.id">
              <td class="py-2 pr-3 font-bold">{{ item.reference }}</td>
              <td class="py-2 pr-3">{{ item.customerName }}</td>
              <td class="py-2 pr-3 text-right font-bold tabular-nums">
                {{ format.currency(item.premium) }}
              </td>
              <td class="py-2 pr-3 text-right text-xs">{{ format.date(item.validUntil) }}</td>
              <td class="py-2 text-right"><StatusBadge :status="item.status" /></td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.recent?.length" title="ບໍ່ມີໃບສະເໜີລາຄາ" />
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
const { data, pending, error, refresh } = useReport('quotations', props.range)

const monthly = computed(() => data.value?.monthly || [])
const monthlyChartSeries = computed(() => [
  { name: 'ສະເໜີລາຄາ', data: monthly.value.map((item) => item.value) },
])
const monthlyChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.number(value),
    tooltipFormatter: (value) => `${format.number(value)} ສະເໜີ`,
  }),
)
</script>
