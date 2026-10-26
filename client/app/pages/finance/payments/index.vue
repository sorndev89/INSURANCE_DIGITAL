<template>
  <div class="space-y-6">
    <PageHeader title="ການຊຳລະເງິນ" description="ລາຍການຮັບຊຳລະເງິນ ແລະ ໃບຮັບເງິນ.">
      <template #actions>
        <BaseButton icon="add" @click="toast.info('ຟອມຮັບຊຳລະຈະມາໃນໄວໆນີ້')">ຮັບຊຳລະໃໝ່</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຮັບມື້ນີ້" :value="format.currency(stats.today)" icon="today" />
      <StatCard
        label="ຮັບເດືອນນີ້"
        :value="format.currency(stats.month)"
        icon="date_range"
        highlight
      />
      <StatCard label="ລາຍການທັງໝົດ" :value="format.number(stats.total)" icon="receipt_long" />
      <StatCard
        label="ລໍຖ້າດຳເນີນການ"
        :value="format.number(stats.pending)"
        icon="pending"
        trend-tone="warning"
      />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາການຊຳລະ"
            placeholder="ເລກໃບຮັບ, ລູກຄ້າ..."
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
      caption="ຕາຕະລາງການຊຳລະ"
      empty-title="ບໍ່ພົບການຊຳລະ"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-receiptNumber="{ row }">
        <p class="font-bold text-primary-text">{{ row.receiptNumber }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.invoiceNumber }}</p>
      </template>
      <template #cell-customerName="{ row }">
        <p class="font-bold">{{ row.customerName }}</p>
      </template>
      <template #cell-method="{ value }">{{ methodLabel(value) }}</template>
      <template #cell-paidAt="{ value }">{{ value ? format.date(value) : '—' }}</template>
      <template #cell-amount="{ value }"
        ><span class="font-bold tabular-nums">{{ format.currency(value) }}</span></template
      >
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { usePayments } from '~/composables/api/usePayments'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ການຊຳລະເງິນ',
  permission: 'finance.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = usePayments()

const today = new Date().toISOString().slice(0, 10)
const monthPrefix = today.slice(0, 7)

const localStats = computed(() => ({
  total: total.value,
  today: items.value
    .filter((item) => item.paidAt === today)
    .reduce((sum, item) => sum + Number(item.amount), 0),
  month: items.value
    .filter((item) => item.paidAt?.startsWith(monthPrefix))
    .reduce((sum, item) => sum + Number(item.amount), 0),
  pending: items.value.filter((item) => item.status === 'pending').length,
}))

const { remoteStats } = useRemoteStats('/payments')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'completed', label: 'ສຳເລັດ' },
  { key: 'pending', label: 'ລໍຖ້າ' },
  { key: 'failed', label: 'ລົ້ມເຫຼວ' },
])

const columns = [
  { key: 'receiptNumber', label: 'ໃບຮັບເງິນ', sortable: true },
  { key: 'customerName', label: 'ລູກຄ້າ' },
  { key: 'method', label: 'ວິທີ', hideOn: ['mobile'] },
  { key: 'paidAt', label: 'ວັນທີ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const methodLabel = (method) => {
  if (method === 'bcel') return 'BCEL One'
  if (method === 'bank') return 'ໂອນທະນາຄານ'
  return 'ເງິນສົດ'
}
</script>
