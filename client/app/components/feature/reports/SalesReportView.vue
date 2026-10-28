<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader :title="title" :description="description">
      <template #actions>
        <BaseButton variant="secondary" icon="table_view" @click="exportReport('xlsx')">
          Excel
        </BaseButton>
        <BaseButton variant="secondary" icon="picture_as_pdf" @click="exportReport('pdf')">
          PDF
        </BaseButton>
        <BaseButton icon="download" @click="exportReport('csv')">CSV</BaseButton>
      </template>
    </PageHeader>

    <BaseCard>
      <div class="space-y-4">
        <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div class="flex flex-wrap items-end gap-2">
            <div class="w-full sm:w-72">
              <DateRangePicker v-model:from="range.from" v-model:to="range.to" label="ໄລຍະລາຍງານ" />
            </div>
            <div class="w-48">
              <BaseSelect v-model="agentId" label="ຢູ່ເຊີ" :options="agentOptions" />
            </div>
            <div class="w-48">
              <BaseSelect v-model="companyCode" label="ບໍລິສັດ" :options="companyOptions" />
            </div>
            <div class="w-48">
              <BaseSelect v-model="productType" label="ປະເພດ" :options="productOptions" />
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <BaseButton
              v-for="preset in presets"
              :key="preset.key"
              size="sm"
              :variant="activePreset === preset.key ? 'primary' : 'secondary'"
              @click="applyPreset(preset.key)"
            >
              {{ preset.label }}
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="ເບ້ຍປະກັນລວມ"
        :value="format.currency(report.totals.totalPremium)"
        icon="payments"
        highlight
      />
      <StatCard
        label="ເບ້ຍສຸດທິ"
        :value="format.currency(report.totals.netPremium)"
        icon="account_balance"
      />
      <StatCard label="VAT 7%" :value="format.currency(report.totals.vatAmount)" icon="receipt" />
      <StatCard
        label="ຈຳນວນສັນຍາ"
        :value="format.number(report.totals.policyCount)"
        icon="description"
      />
    </div>

    <BaseCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold">
              {{ groupBy === 'user' ? 'ແນວໂນ້ມຍອດຂາຍແຍກຢູ່ເຊີ' : 'ແນວໂນ້ມຍອດຂາຍລວມ' }}
            </h2>
            <p class="mt-0.5 text-xs text-muted">
              {{ range.from }} ຫາ {{ range.to }} · {{ activeGranularityLabel }}
            </p>
          </div>
          <BaseBadge tone="primary">{{ format.compact(report.totals.totalPremium) }} LAK</BaseBadge>
        </div>
      </template>
      <ApexChart
        type="bar"
        :height="300"
        :options="chartOptions"
        :series="chartSeries"
      />
    </BaseCard>

    <BaseCard flush>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold">
              {{ groupBy === 'user' ? 'ຕາຕະລາງແຍກຢູ່ເຊີ' : 'ຕາຕະລາງຍອດຂາຍລວມ' }}
            </h2>
            <p class="mt-0.5 text-xs text-muted">
              {{ report.periods.length }} ງວດ · {{ report.totals.policyCount }} ສັນຍາ
            </p>
          </div>
          <BaseBadge tone="neutral">{{ activeGranularityLabel }}</BaseBadge>
        </div>
      </template>

      <div
        v-if="groupBy === 'total'"
        class="overflow-x-auto"
        tabindex="0"
        role="region"
        aria-label="ຕາຕະລາງຍອດຂາຍລວມ"
      >
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="px-4 py-3 font-bold">ງວດ</th>
              <th class="px-4 py-3 text-right font-bold">ສັນຍາ</th>
              <th class="px-4 py-3 text-right font-bold">ເບ້ຍສຸດທິ</th>
              <th class="px-4 py-3 text-right font-bold">VAT</th>
              <th class="px-4 py-3 text-right font-bold">ຄ່າທະບຽນ</th>
              <th class="px-4 py-3 text-right font-bold">ລວມສຸດທິ</th>
              <th class="px-4 py-3 text-right font-bold">ສ່ວນແບ່ງ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="row in report.periods" :key="row.key" class="hover:bg-surface-muted/40">
              <td class="px-4 py-3 font-bold">{{ row.label }}</td>
              <td class="px-4 py-3 text-right tabular-nums">{{ format.number(row.policyCount) }}</td>
              <td class="px-4 py-3 text-right tabular-nums">{{ format.currency(row.netPremium) }}</td>
              <td class="px-4 py-3 text-right tabular-nums">{{ format.currency(row.vatAmount) }}</td>
              <td class="px-4 py-3 text-right tabular-nums">
                {{ format.currency(row.registrationFee) }}
              </td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.currency(row.totalPremium) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums">{{ row.share }}%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-line bg-surface-muted/60">
              <td class="px-4 py-3 font-bold">ລວມທັງໝົດ</td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.number(report.totals.policyCount) }}
              </td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.currency(report.totals.netPremium) }}
              </td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.currency(report.totals.vatAmount) }}
              </td>
              <td class="px-4 py-3 text-right font-bold tabular-nums">
                {{ format.currency(report.totals.registrationFee) }}
              </td>
              <td class="px-4 py-3 text-right font-bold tabular-nums text-primary-text">
                {{ format.currency(report.totals.totalPremium) }}
              </td>
              <td class="px-4 py-3 text-right font-bold">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div
        v-else
        class="overflow-x-auto"
        tabindex="0"
        role="region"
        aria-label="ຕາຕະລາງຍອດຂາຍແຍກຢູ່ເຊີ"
      >
        <table class="w-full min-w-[860px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="px-4 py-3 font-bold">ຢູ່ເຊີ</th>
              <th class="px-4 py-3 font-bold">ລະຫັດ</th>
              <th class="px-4 py-3 text-right font-bold">ສັນຍາ</th>
              <th class="px-4 py-3 text-right font-bold">ເບ້ຍສຸດທິ</th>
              <th class="px-4 py-3 text-right font-bold">VAT</th>
              <th class="px-4 py-3 text-right font-bold">ລວມສຸດທິ</th>
              <th class="px-4 py-3 text-right font-bold">ສ່ວນແບ່ງ</th>
            </tr>
          </thead>
          <tbody
            v-for="period in report.periods.filter((item) => item.users.length)"
            :key="period.key"
            class="divide-y divide-line"
          >
            <tr class="bg-surface-muted/60">
              <td colspan="2" class="px-4 py-2.5 text-xs font-bold text-primary-text">
                {{ period.label }}
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold tabular-nums">
                {{ format.number(period.policyCount) }}
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold tabular-nums">
                {{ format.currency(period.netPremium) }}
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold tabular-nums">
                {{ format.currency(period.vatAmount) }}
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-primary-text">
                {{ format.currency(period.totalPremium) }}
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold">100%</td>
            </tr>
            <tr
              v-for="user in period.users"
              :key="`${period.key}-${user.id}`"
              class="hover:bg-surface-muted/40"
            >
              <td class="px-4 py-2.5 font-bold">{{ user.name }}</td>
              <td class="px-4 py-2.5 text-xs text-muted">{{ user.code }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums">{{ format.number(user.policyCount) }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums">{{ format.currency(user.netPremium) }}</td>
              <td class="px-4 py-2.5 text-right tabular-nums">{{ format.currency(user.vatAmount) }}</td>
              <td class="px-4 py-2.5 text-right font-bold tabular-nums">
                {{ format.currency(user.totalPremium) }}
              </td>
              <td class="px-4 py-2.5 text-right tabular-nums">{{ user.share }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-if="!report.periods.length" title="ບໍ່ມີຂໍ້ມູນໃນໄລຍະນີ້" />
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { policies } from '~/mocks/policies'
import { agents } from '~/mocks/agents'
import { insurers } from '~/mocks/insurers'
import { PRODUCT_TYPES } from '~/utils/constants'
import {
  SALES_GRANULARITIES,
  buildSalesReport,
} from '~/utils/salesReport'
import { useExport } from '~/composables/useExport'
import { useFormat } from '~/utils/format'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  granularity: { type: String, default: 'monthly' },
  groupBy: { type: String, default: 'total' },
})

const format = useFormat()
const { exportData } = useExport()

const pad = (value) => String(value).padStart(2, '0')
const toDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const startOfYear = (date) => new Date(date.getFullYear(), 0, 1)
const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
const addMonths = (date, months) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

const today = new Date()
const agentId = ref('ALL')
const companyCode = ref('ALL')
const productType = ref('ALL')
const activePreset = ref('year')

const range = reactive({
  from: toDate(startOfYear(today)),
  to: toDate(today),
})

const activeGranularityLabel = computed(
  () => SALES_GRANULARITIES.find((item) => item.value === props.granularity)?.label || '',
)

const agentOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກຢູ່ເຊີ' },
  ...agents.map((agent) => ({
    value: String(agent.id),
    label: `${agent.code || agent.agentCode} - ${agent.name}`,
  })),
])

const companyOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກບໍລິສັດ' },
  ...insurers.map((insurer) => ({
    value: insurer.code,
    label: `${insurer.code} - ${insurer.shortName}`,
  })),
])

const productOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກປະເພດ' },
  ...PRODUCT_TYPES.map((item) => ({ value: item.value, label: item.label })),
])

const presets = computed(() => {
  if (props.granularity === 'daily') {
    return [
      { key: '7d', label: '7 ວັນ' },
      { key: 'month', label: 'ເດືອນນີ້' },
      { key: 'prevMonth', label: 'ເດືອນກ່ອນ' },
    ]
  }
  if (props.granularity === 'monthly') {
    return [
      { key: '6m', label: '6 ເດືອນ' },
      { key: 'year', label: 'ປີນີ້' },
      { key: 'prevYear', label: 'ປີກ່ອນ' },
    ]
  }
  if (props.granularity === 'quarterly') {
    return [
      { key: 'year', label: 'ປີນີ້' },
      { key: 'prevYear', label: 'ປີກ່ອນ' },
      { key: '2y', label: '2 ປີ' },
    ]
  }
  return [
    { key: '3y', label: '3 ປີ' },
    { key: '5y', label: '5 ປີ' },
  ]
})

const applyPreset = (key) => {
  const now = new Date()
  activePreset.value = key
  if (key === '7d') {
    range.from = toDate(addDays(now, -6))
    range.to = toDate(now)
    return
  }
  if (key === 'month') {
    range.from = toDate(startOfMonth(now))
    range.to = toDate(now)
    return
  }
  if (key === 'prevMonth') {
    const previous = addMonths(now, -1)
    range.from = toDate(startOfMonth(previous))
    range.to = toDate(new Date(previous.getFullYear(), previous.getMonth() + 1, 0))
    return
  }
  if (key === '6m') {
    range.from = toDate(startOfMonth(addMonths(now, -5)))
    range.to = toDate(now)
    return
  }
  if (key === 'year') {
    range.from = toDate(startOfYear(now))
    range.to = toDate(now)
    return
  }
  if (key === 'prevYear') {
    range.from = toDate(new Date(now.getFullYear() - 1, 0, 1))
    range.to = toDate(new Date(now.getFullYear() - 1, 11, 31))
    return
  }
  if (key === '2y') {
    range.from = toDate(new Date(now.getFullYear() - 1, 0, 1))
    range.to = toDate(now)
    return
  }
  const years = key === '3y' ? 2 : 4
  range.from = toDate(new Date(now.getFullYear() - years, 0, 1))
  range.to = toDate(now)
}

const presetForGranularity = (value) => {
  if (value === 'daily') return 'month'
  if (value === 'annual') return '5y'
  return 'year'
}

applyPreset(presetForGranularity(props.granularity))

const report = computed(() =>
  buildSalesReport({
    policies,
    agents,
    from: range.from,
    to: range.to,
    granularity: props.granularity,
    groupBy: props.groupBy,
    agentId: agentId.value,
    companyCode: companyCode.value,
    productType: productType.value,
  }),
)

const chartSeries = computed(() => {
  if (props.groupBy === 'total') {
    return [
      {
        name: 'ຍອດຂາຍ',
        data: report.value.periods.map((period) => period.totalPremium),
      },
    ]
  }
  return report.value.topUsers.map((user) => ({
    name: user.name,
    data: report.value.periods.map(
      (period) => period.users.find((item) => String(item.id) === String(user.id))?.totalPremium || 0,
    ),
  }))
})

const chartOptions = computed(() => ({
  chart: {
    stacked: props.groupBy === 'user',
    toolbar: { show: false },
  },
  xaxis: { categories: report.value.periods.map((period) => period.label) },
  yaxis: { labels: { formatter: (value) => format.compact(value) } },
  tooltip: { y: { formatter: (value) => format.currency(value) } },
  plotOptions: { bar: { borderRadius: 4, columnWidth: props.groupBy === 'user' ? '70%' : '55%' } },
  legend: { show: props.groupBy === 'user', position: 'bottom' },
  colors: ['#047857', '#1d4ed8', '#f59e0b', '#be123c', '#7c3aed', '#0e7490'],
}))

const exportReport = (formatType) => {
  const columns =
    props.groupBy === 'user'
      ? [
          { key: 'period', label: 'ງວດ' },
          { key: 'userName', label: 'ຢູ່ເຊີ' },
          { key: 'userCode', label: 'ລະຫັດ' },
          { key: 'policyCount', label: 'ສັນຍາ' },
          { key: 'netPremium', label: 'ເບ້ຍສຸດທິ' },
          { key: 'vatAmount', label: 'VAT' },
          { key: 'registrationFee', label: 'ຄ່າທະບຽນ' },
          { key: 'totalPremium', label: 'ລວມສຸດທິ' },
          { key: 'share', label: 'ສ່ວນແບ່ງ %' },
        ]
      : [
          { key: 'period', label: 'ງວດ' },
          { key: 'policyCount', label: 'ສັນຍາ' },
          { key: 'netPremium', label: 'ເບ້ຍສຸດທິ' },
          { key: 'vatAmount', label: 'VAT' },
          { key: 'registrationFee', label: 'ຄ່າທະບຽນ' },
          { key: 'totalPremium', label: 'ລວມສຸດທິ' },
          { key: 'share', label: 'ສ່ວນແບ່ງ %' },
        ]

  exportData(
    {
      title: `ລາຍງານຍອດຂາຍ ${activeGranularityLabel.value} ${
        props.groupBy === 'user' ? '(ແຍກຢູ່ເຊີ)' : '(ລວມ)'
      }`,
      filename: `sales-${props.granularity}-${props.groupBy}-${range.from}-${range.to}`,
      columns,
      rows: report.value.tableRows,
    },
    formatType,
  )
}
</script>
