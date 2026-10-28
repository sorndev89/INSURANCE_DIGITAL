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
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex flex-wrap gap-2">
            <div class="w-40">
              <BaseInput v-model="range.from" type="date" label="ຈາກວັນທີ" />
            </div>
            <div class="w-40">
              <BaseInput v-model="range.to" type="date" label="ຮອດວັນທີ" />
            </div>
            <div v-if="mode === 'company'" class="w-56">
              <BaseSelect v-model="companyCode" label="ບໍລິສັດ" :options="companyOptions" />
            </div>
            <div v-if="mode === 'agentExpiry'" class="w-56">
              <BaseSelect v-model="agentId" label="ຕົວແທນ" :options="agentOptions" />
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
      <StatCard label="ຈຳນວນສັນຍາ" :value="format.number(rows.length)" icon="description" />
      <StatCard
        label="ເບ້ຍປະກັນລວມ"
        :value="format.currency(totalPremium)"
        icon="payments"
        highlight
      />
      <StatCard
        label="ເບ້ຍສຸດທິ"
        :value="format.currency(totalNetPremium)"
        icon="account_balance"
      />
      <StatCard label="VAT 7%" :value="format.currency(totalVat)" icon="receipt" />
    </div>

    <BaseCard flush>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold">{{ title }}</h2>
            <p class="mt-0.5 text-xs text-muted">
              {{ range.from }} ຫາ {{ range.to }} · {{ rows.length }} ລາຍການ
            </p>
          </div>
          <BaseBadge tone="primary">{{ format.compact(totalPremium) }} LAK</BaseBadge>
        </div>
      </template>

      <div class="overflow-x-auto" tabindex="0" role="region" aria-label="ຕາຕະລາງລາຍງານ Underwriting">
        <table class="w-full min-w-[980px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="px-3 py-3 font-bold">ສັນຍາ</th>
              <th class="px-3 py-3 font-bold">ລູກຄ້າ</th>
              <th class="px-3 py-3 font-bold">ບໍລິສັດ</th>
              <th class="px-3 py-3 font-bold">ຜະລິດຕະພັນ</th>
              <th class="px-3 py-3 font-bold">ຕົວແທນ</th>
              <th class="px-3 py-3 font-bold">ໄລຍະ</th>
              <th class="px-3 py-3 text-right font-bold">ເບ້ຍສຸດທິ</th>
              <th class="px-3 py-3 text-right font-bold">ລວມສຸດທິ</th>
              <th v-if="mode === 'expiration' || mode === 'agentExpiry'" class="px-3 py-3 text-right font-bold">
                ເຫຼືອວັນ
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="policy in rows" :key="policy.id" class="hover:bg-surface-muted/40">
              <td class="px-3 py-3">
                <NuxtLink
                  :to="`/policies/${policy.id}`"
                  class="font-mono text-xs font-bold text-primary-text hover:underline"
                >
                  {{ policy.policyNumber }}
                </NuxtLink>
                <p class="text-[11px] text-muted">{{ policy.status }}</p>
              </td>
              <td class="px-3 py-3">
                <p class="font-bold">{{ policy.customerName }}</p>
                <p class="text-xs text-muted">{{ format.phone(policy.customerPhone) }}</p>
              </td>
              <td class="px-3 py-3">
                <p class="text-xs font-bold">{{ policy.companyCode }}</p>
                <p class="text-[11px] text-muted">{{ policy.companyName }}</p>
              </td>
              <td class="px-3 py-3">
                <p class="text-xs font-bold">{{ policy.productName }}</p>
                <p class="text-[11px] text-muted">{{ policy.productType }}</p>
              </td>
              <td class="px-3 py-3 text-xs">{{ policy.agentName }}</td>
              <td class="px-3 py-3 text-xs">
                {{ format.date(policy.startDate) }} – {{ format.date(policy.endDate) }}
              </td>
              <td class="px-3 py-3 text-right tabular-nums">{{ format.currency(policy.netPremium) }}</td>
              <td class="px-3 py-3 text-right font-bold tabular-nums">
                {{ format.currency(policy.totalPremium) }}
              </td>
              <td
                v-if="mode === 'expiration' || mode === 'agentExpiry'"
                class="px-3 py-3 text-right text-xs font-bold text-warning"
              >
                {{ daysLeft(policy.endDate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-if="!rows.length" title="ບໍ່ມີຂໍ້ມູນໃນໄລຍະນີ້" />
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { policies } from '~/mocks/policies'
import { insurers } from '~/mocks/insurers'
import { agents } from '~/mocks/agents'
import { useExport } from '~/composables/useExport'
import { useFormat } from '~/utils/format'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mode: { type: String, default: 'dateRange' },
})

const format = useFormat()
const { exportData } = useExport()

const companyCode = ref('ALL')
const agentId = ref('ALL')

const pad = (value) => String(value).padStart(2, '0')
const toDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const today = new Date()
const range = reactive({
  from: toDate(new Date(today.getFullYear(), 0, 1)),
  to: toDate(new Date(today.getFullYear(), 11, 31)),
})

const presets = [
  { key: 'month', label: 'ເດືອນນີ້' },
  { key: 'quarter', label: 'ໄຕມາດນີ້' },
  { key: 'year', label: 'ປີນີ້' },
  { key: 'next30', label: '30 ວັນ' },
]
const activePreset = ref('year')

const applyPreset = (key) => {
  const now = new Date()
  activePreset.value = key
  if (key === 'month') {
    range.from = toDate(new Date(now.getFullYear(), now.getMonth(), 1))
    range.to = toDate(now)
    return
  }
  if (key === 'quarter') {
    const quarter = Math.floor(now.getMonth() / 3) * 3
    range.from = toDate(new Date(now.getFullYear(), quarter, 1))
    range.to = toDate(now)
    return
  }
  if (key === 'next30') {
    const end = new Date(now)
    end.setDate(end.getDate() + 30)
    range.from = toDate(now)
    range.to = toDate(end)
    return
  }
  range.from = toDate(new Date(now.getFullYear(), 0, 1))
  range.to = toDate(new Date(now.getFullYear(), 11, 31))
}

const companyOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກບໍລິສັດ' },
  ...insurers.map((insurer) => ({ value: insurer.code, label: `${insurer.code} - ${insurer.shortName}` })),
])
const agentOptions = computed(() => [
  { value: 'ALL', label: 'ທຸກຕົວແທນ' },
  ...agents.map((agent) => ({ value: agent.id, label: `${agent.code} - ${agent.name}` })),
])

const inRange = (date) => date >= range.from && date <= range.to

const rows = computed(() => {
  if (props.mode === 'expiration') {
    return policies
      .filter((policy) => policy.status === 'active' && inRange(policy.endDate))
      .sort((left, right) => String(left.endDate).localeCompare(String(right.endDate)))
  }
  if (props.mode === 'agentExpiry') {
    return policies
      .filter((policy) => policy.status === 'active')
      .filter((policy) => agentId.value === 'ALL' || String(policy.agentId) === String(agentId.value))
      .filter((policy) => inRange(policy.endDate))
      .sort((left, right) => String(left.endDate).localeCompare(String(right.endDate)))
  }
  if (props.mode === 'company') {
    return policies
      .filter((policy) => inRange(policy.startDate))
      .filter((policy) => companyCode.value === 'ALL' || policy.companyCode === companyCode.value)
  }
  return policies.filter((policy) => inRange(policy.startDate))
})

const totalPremium = computed(() =>
  rows.value.reduce((sum, policy) => sum + (policy.totalPremium || 0), 0),
)
const totalNetPremium = computed(() =>
  rows.value.reduce((sum, policy) => sum + (policy.netPremium || 0), 0),
)
const totalVat = computed(() => rows.value.reduce((sum, policy) => sum + (policy.vatAmount || 0), 0))

const daysLeft = (date) => {
  const diff = new Date(`${date}T12:00:00`) - new Date()
  return Math.max(0, Math.ceil(diff / (24 * 3600 * 1000)))
}

const exportReport = (formatType) => {
  exportData(
    {
      title: `${props.title} (${range.from} - ${range.to})`,
      filename: `underwriting-${props.mode}-${range.from}-${range.to}`,
      columns: [
        { key: 'policyNumber', label: 'ເລກສັນຍາ' },
        { key: 'customerName', label: 'ລູກຄ້າ' },
        { key: 'companyCode', label: 'ບໍລິສັດ' },
        { key: 'productName', label: 'ຜະລິດຕະພັນ' },
        { key: 'agentName', label: 'ຕົວແທນ' },
        { key: 'startDate', label: 'ເລີ່ມ' },
        { key: 'endDate', label: 'ໝົດ' },
        { key: 'netPremium', label: 'ເບ້ຍສຸດທິ' },
        { key: 'totalPremium', label: 'ລວມສຸດທິ' },
      ],
      rows: rows.value,
    },
    formatType,
  )
}
</script>
