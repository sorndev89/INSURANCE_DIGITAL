<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="ອອກໃບແຈ້ງໜີ້"
        :value="format.currency(data?.invoices?.amount)"
        icon="receipt_long"
      />
      <StatCard
        label="ຮັບເງິນໄດ້"
        :value="format.currency(data?.payments?.collected)"
        icon="account_balance_wallet"
        highlight
      />
      <StatCard
        label="ອັດຕາເກັບເງິນ"
        :value="format.percent(data?.collectionRate, 1)"
        icon="percent"
      />
      <StatCard
        label="ໜີ້ເກີນກຳນົດ"
        :value="format.currency(data?.invoices?.overdueAmount)"
        icon="warning"
        trend-tone="danger"
      />
    </div>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection title="ອາຍຸໜີ້ຄ້າງ" :loading="pending" :error="error" @retry="refresh">
        <ApexChart
          type="bar"
          :height="260"
          :options="agingChartOptions"
          :series="agingChartSeries"
        />
      </ReportSection>

      <ReportSection title="ຊ່ອງທາງຮັບເງິນ" :loading="pending" :error="error" @retry="refresh">
        <ul class="divide-y divide-line">
          <li
            v-for="item in data?.payments?.byMethod || []"
            :key="item.key"
            class="flex items-center justify-between gap-3 py-2 text-sm"
          >
            <span class="font-bold">{{ item.label }}</span>
            <span class="text-xs text-muted">{{ format.number(item.count) }} ລາຍການ</span>
            <span class="font-bold tabular-nums">{{ format.currency(item.value) }}</span>
          </li>
        </ul>
        <EmptyState v-if="!data?.payments?.byMethod?.length" title="ບໍ່ມີການຮັບເງິນ" />
      </ReportSection>
    </div>

    <ReportSection title="ຮັບ-ຈ່າຍຕາມເດືອນ" :loading="pending" :error="error" @retry="refresh">
      <ApexChart type="bar" :height="280" :options="cashChartOptions" :series="cashChartSeries" />
    </ReportSection>

    <ReportSection
      title="ໃບແຈ້ງໜີ້ຄ້າງ / ເກີນກຳນົດ"
      :loading="pending"
      :error="error"
      @retry="refresh"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ໃບແຈ້ງໜີ້</th>
              <th class="pb-2 pr-3 font-bold">ລູກຄ້າ</th>
              <th class="pb-2 pr-3 text-right font-bold">ກຳນົດ</th>
              <th class="pb-2 pr-3 text-right font-bold">ມູນຄ່າ</th>
              <th class="pb-2 text-right font-bold">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.overdueList || []" :key="item.id">
              <td class="py-2 pr-3 font-bold">{{ item.invoiceNumber }}</td>
              <td class="py-2 pr-3">{{ item.customerName }}</td>
              <td class="py-2 pr-3 text-right text-xs">{{ format.date(item.dueDate) }}</td>
              <td class="py-2 pr-3 text-right font-bold tabular-nums">
                {{ format.currency(item.amount) }}
              </td>
              <td class="py-2 text-right"><StatusBadge :status="item.status" /></td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.overdueList?.length" title="ບໍ່ມີໜີ້ຄ້າງ" />
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
const { data, pending, error, refresh } = useReport('finance', props.range)

const agingRows = computed(() => [
  { key: 'current', label: 'ຍັງບໍ່ຮອດກຳນົດ', value: data.value?.aging?.current || 0 },
  { key: '1-30', label: '1–30 ວັນ', value: data.value?.aging?.days1to30 || 0 },
  { key: '31-60', label: '31–60 ວັນ', value: data.value?.aging?.days31to60 || 0 },
  { key: '61-90', label: '61–90 ວັນ', value: data.value?.aging?.days61to90 || 0 },
  { key: '90+', label: 'ເກີນ 90 ວັນ', value: data.value?.aging?.days90plus || 0 },
])

const agingChartSeries = computed(() => [
  { name: 'ໜີ້ຄ້າງ', data: agingRows.value.map((item) => item.value) },
])
const agingChartOptions = computed(() =>
  barChartOptions({
    categories: agingRows.value.map((item) => item.label),
    horizontal: true,
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
    columnWidth: '52%',
  }),
)

const monthly = computed(() => data.value?.monthly || [])
const cashChartSeries = computed(() => [
  { name: 'ອອກໃບແຈ້ງໜີ້', data: monthly.value.map((item) => item.invoiced) },
  { name: 'ຮັບເງິນ', data: monthly.value.map((item) => item.collected) },
])
const cashChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
  }),
)
</script>
