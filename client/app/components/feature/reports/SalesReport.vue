<template>
  <div class="space-y-4 sm:space-y-6">
    <template v-if="sales.data.value">
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="ເບ້ຍປະກັນລວມ"
          :value="format.currency(sales.data.value.totals.totalPremium)"
          icon="payments"
          highlight
        />
        <StatCard
          label="ເບ້ຍສຸດທິ"
          :value="format.currency(sales.data.value.totals.netPremium)"
          icon="account_balance"
        />
        <StatCard
          label="VAT 7%"
          :value="format.currency(sales.data.value.totals.vatAmount)"
          icon="receipt"
        />
        <StatCard
          label="ຈຳນວນສັນຍາ"
          :value="format.number(sales.data.value.totals.policyCount)"
          icon="description"
        />
      </div>
    </template>
    <div v-else-if="sales.pending.value" class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <BaseSkeleton v-for="index in 4" :key="index" height="lg" />
    </div>

    <ReportSection
      title="ຍອດຂາຍຕາມເດືອນ"
      description="ເບ້ຍປະກັນທີ່ເລີ່ມມີຜົນໃນແຕ່ລະເດືອນ"
      :loading="sales.pending.value"
      :error="sales.error.value"
      :skeleton-rows="1"
      @retry="sales.refresh"
    >
      <ApexChart
        type="bar"
        :height="260"
        :options="monthlyChartOptions"
        :series="monthlyChartSeries"
      />
    </ReportSection>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection
        title="ຕາມປະເພດປະກັນໄພ"
        :loading="sales.pending.value"
        :error="sales.error.value"
        :skeleton-rows="4"
        @retry="sales.refresh"
      >
        <ApexChart
          type="bar"
          :height="260"
          :options="productChartOptions"
          :series="productChartSeries"
        />
      </ReportSection>

      <ReportSection
        title="ຕາມບໍລິສັດປະກັນໄພ"
        :loading="sales.pending.value"
        :error="sales.error.value"
        :skeleton-rows="4"
        @retry="sales.refresh"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-line text-left text-xs uppercase tracking-wider text-muted"
              >
                <th class="pb-2 pr-3 font-bold">ບໍລິສັດ</th>
                <th class="pb-2 pr-3 text-right font-bold">ສັນຍາ</th>
                <th class="pb-2 text-right font-bold">ເບ້ຍປະກັນ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="item in sales.data.value?.byCompany || []" :key="item.key">
                <td class="py-2 pr-3">
                  <p class="font-bold">{{ item.label }}</p>
                  <p class="text-xs text-muted">{{ format.percent(item.percentage, 1) }}</p>
                </td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ format.number(item.count) }}</td>
                <td class="py-2 text-right font-bold tabular-nums">
                  {{ format.currency(item.value) }}
                </td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-if="!sales.data.value?.byCompany?.length" title="ບໍ່ມີຂໍ້ມູນ" />
        </div>
      </ReportSection>
    </div>

    <ReportSection
      title="ຜົນງານຕົວແທນ"
      description="ຈັດອັນດັບຕາມເບ້ຍປະກັນໃນໄລຍະ"
      :loading="sales.pending.value"
      :error="sales.error.value"
      @retry="sales.refresh"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">#</th>
              <th class="pb-2 pr-3 font-bold">ຕົວແທນ</th>
              <th class="pb-2 pr-3 text-right font-bold">ສັນຍາ</th>
              <th class="pb-2 text-right font-bold">ເບ້ຍປະກັນ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="(item, index) in sales.data.value?.byAgent?.slice(0, 10) || []"
              :key="item.id"
            >
              <td class="py-2 pr-3 text-xs font-bold text-muted">#{{ index + 1 }}</td>
              <td class="py-2 pr-3 font-bold">{{ item.label }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.number(item.count) }}</td>
              <td class="py-2 text-right font-bold tabular-nums">
                {{ format.currency(item.value) }}
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!sales.data.value?.byAgent?.length" title="ບໍ່ມີຂໍ້ມູນ" />
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
const sales = useReport('sales', props.range)

const monthly = computed(() => sales.data.value?.monthly || [])
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

const byProduct = computed(() => sales.data.value?.byProduct || [])
const productChartSeries = computed(() => [
  { name: 'ເບ້ຍປະກັນ', data: byProduct.value.map((item) => item.value) },
])
const productChartOptions = computed(() =>
  barChartOptions({
    categories: byProduct.value.map((item) => item.label),
    horizontal: true,
    axisFormatter: (value) => format.compact(value),
    tooltipFormatter: (value) => format.currency(value),
  }),
)
</script>
