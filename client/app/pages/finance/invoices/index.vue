<template>
  <div class="space-y-6">
    <PageHeader title="ໃບແຈ້ງໜີ້" description="ຕິດຕາມ ແລະ ອອກໃບແຈ້ງໜີ້ (Invoice).">
      <template #actions>
        <BaseButton variant="secondary" icon="file_download" @click="toast.info('Export (mock)')"
          >Export</BaseButton
        >
        <BaseButton icon="add_circle" @click="toast.info('ຟອມສ້າງໃບແຈ້ງໜີ້ຈະມາໃນໄວໆນີ້')"
          >ສ້າງ Invoice</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ໃບແຈ້ງໜີ້ທັງໝົດ" :value="format.number(stats.total)" icon="receipt_long" />
      <StatCard
        label="ຍັງບໍ່ຈ່າຍ"
        :value="format.number(stats.unpaid)"
        icon="pending"
        trend-tone="warning"
      />
      <StatCard
        label="ເກີນກຳນົດ"
        :value="format.number(stats.overdue)"
        icon="warning"
        trend-tone="danger"
      />
      <StatCard label="ຍອດລວມ" :value="format.currency(stats.amount)" icon="payments" highlight />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາໃບແຈ້ງໜີ້"
            placeholder="ເລກ invoice, ປະກັນໄພ, ຊື່..."
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
      caption="ຕາຕະລາງໃບແຈ້ງໜີ້"
      empty-title="ບໍ່ພົບໃບແຈ້ງໜີ້"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-invoiceNumber="{ row }">
        <p class="font-bold text-primary-text">{{ row.invoiceNumber }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.policyNumber }}</p>
      </template>
      <template #cell-customerName="{ row }">
        <p class="font-bold">{{ row.customerName }}</p>
      </template>
      <template #cell-dueDate="{ value }">{{ format.date(value) }}</template>
      <template #cell-amount="{ value }"
        ><span class="font-bold tabular-nums">{{ format.currency(value) }}</span></template
      >
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
      <template #actions="{ row }">
        <BaseButton
          variant="ghost"
          size="sm"
          icon-only
          label="ພິມ"
          icon="print"
          @click="toast.info(`ພິມ ${row.invoiceNumber} (mock)`)"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { useInvoices } from '~/composables/api/useInvoices'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ໃບແຈ້ງໜີ້',
  permission: 'finance.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useInvoices()

const localStats = computed(() => ({
  total: total.value,
  unpaid: items.value.filter((item) => item.status === 'unpaid').length,
  overdue: items.value.filter((item) => item.status === 'overdue').length,
  amount: items.value.reduce((sum, item) => sum + Number(item.amount), 0),
}))

const { remoteStats } = useRemoteStats('/invoices')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'unpaid', label: 'ຍັງບໍ່ຈ່າຍ' },
  { key: 'overdue', label: 'ເກີນກຳນົດ' },
  { key: 'paid', label: 'ຈ່າຍແລ້ວ' },
])

const columns = [
  { key: 'invoiceNumber', label: 'ໃບແຈ້ງໜີ້', sortable: true },
  { key: 'customerName', label: 'ລູກຄ້າ' },
  { key: 'dueDate', label: 'ກຳນົດຊຳລະ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
