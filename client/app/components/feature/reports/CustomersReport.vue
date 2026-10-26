<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ລູກຄ້າທັງໝົດ" :value="format.number(data?.total)" icon="people_alt" />
      <StatCard label="ມີຜົນ" :value="format.number(data?.active)" icon="person_check" />
      <StatCard label="ໃໝ່ໃນໄລຍະ" :value="format.number(data?.newInPeriod)" icon="person_add" />
      <StatCard
        label="ປະກັນໄພ/ລູກຄ້າ"
        :value="format.number(data?.policiesPerCustomer)"
        icon="description"
      />
    </div>

    <ReportSection
      title="ລູກຄ້າໃໝ່ຕາມເດືອນ"
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
      title="ລູກຄ້າຍອດສູງ"
      description="ຈັດອັນດັບຕາມເບ້ຍປະກັນໃນໄລຍະ"
      :loading="pending"
      :error="error"
      @retry="refresh"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">#</th>
              <th class="pb-2 pr-3 font-bold">ລູກຄ້າ</th>
              <th class="pb-2 pr-3 text-right font-bold">ສັນຍາ</th>
              <th class="pb-2 text-right font-bold">ເບ້ຍປະກັນ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="(item, index) in data?.topCustomers || []" :key="item.id">
              <td class="py-2 pr-3 text-xs font-bold text-muted">#{{ index + 1 }}</td>
              <td class="py-2 pr-3">
                <p class="font-bold">{{ item.name }}</p>
                <p class="text-xs text-muted">{{ format.phone(item.phone) }}</p>
              </td>
              <td class="py-2 pr-3 text-right tabular-nums">
                {{ format.number(item.policyCount) }}
              </td>
              <td class="py-2 text-right font-bold tabular-nums">
                {{ format.currency(item.value) }}
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.topCustomers?.length" title="ບໍ່ມີຂໍ້ມູນ" />
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
const { data, pending, error, refresh } = useReport('customers', props.range)

const monthly = computed(() => data.value?.newByMonth || [])
const monthlyChartSeries = computed(() => [
  { name: 'ລູກຄ້າໃໝ່', data: monthly.value.map((item) => item.value) },
])
const monthlyChartOptions = computed(() =>
  barChartOptions({
    categories: monthly.value.map((item) => item.label),
    axisFormatter: (value) => format.number(value),
    tooltipFormatter: (value) => `${format.number(value)} ຄົນ`,
  }),
)
</script>
