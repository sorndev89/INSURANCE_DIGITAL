<template>
  <div class="space-y-6">
    <PageHeader title="ຄ່າຄອມມິດຊັ່ນ" description="ສະຫຼຸບຍອດຄອມມິດຊັ່ນ ແລະ ການຈ່າຍເງິນ.">
      <template #actions>
        <BaseButton icon="payments" @click="toast.info('ຈ່າຍຄອມມິດຊັ່ນທັງໝົດ')"
          >ຈ່າຍຄ່າຄອມ</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="ລໍຖ້າຈ່າຍ"
        :value="format.currency(stats.pending)"
        icon="pending"
        trend="ຕ້ອງຈ່າຍ"
        trend-tone="warning"
        highlight
      />
      <StatCard
        label="ຈ່າຍແລ້ວ"
        :value="format.currency(stats.paid)"
        icon="check_circle"
        trend="+12%"
      />
      <StatCard label="ລາຍການທັງໝົດ" :value="format.number(stats.total)" icon="payments" />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາຄອມມິດຊັ່ນ"
            placeholder="ຊື່ຕົວແທນ, ເລກປະກັນໄພ..."
          />
        </div>
      </template>
    </FilterBar>

    <DataTable
      :columns="columns"
      :rows="items"
      :loading="pending"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      caption="ຕາຕະລາງຄອມມິດຊັ່ນ"
      empty-title="ບໍ່ພົບຄອມມິດຊັ່ນ"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-agentName="{ row }">
        <p class="font-bold">{{ row.agentName }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.policyNumber }}</p>
      </template>
      <template #cell-rate="{ value }">{{ value }}%</template>
      <template #cell-amount="{ value }">
        <span class="font-bold tabular-nums">{{ format.currency(value) }}</span>
      </template>
      <template #cell-paidAt="{ value }">{{ value ? format.date(value) : '—' }}</template>
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
      <template #actions="{ row }">
        <BaseButton
          v-if="row.status === 'pending'"
          size="sm"
          variant="secondary"
          icon="payments"
          @click="payCommission(row)"
        >
          ຈ່າຍ
        </BaseButton>
        <span v-else class="text-xs text-muted">—</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { useCommissions } from '~/composables/api/useCommissions'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຄ່າຄອມມິດຊັ່ນ',
  permission: 'commission.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, pay } =
  useCommissions()

const localStats = computed(() => ({
  total: total.value,
  pending: items.value
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + Number(item.amount), 0),
  paid: items.value
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.amount), 0),
}))

const { remoteStats } = useRemoteStats('/commissions')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'pending', label: 'ລໍຖ້າຈ່າຍ' },
  { key: 'paid', label: 'ຈ່າຍແລ້ວ' },
])

const columns = [
  { key: 'agentName', label: 'ຕົວແທນ' },
  { key: 'rate', label: 'ອັດຕາ', align: 'center', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right', sortable: true },
  { key: 'paidAt', label: 'ຈ່າຍເມື່ອ', hideOn: ['mobile'] },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const payCommission = async (row) => {
  await pay(row.id)
  toast.success(`ຈ່າຍຄອມມິດຊັ່ນ ${row.agentName} ສຳເລັດ`)
  refresh()
}
</script>
