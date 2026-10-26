<template>
  <div class="space-y-6">
    <PageHeader title="ສະເໜີລາຄາ" description="ສ້າງ ແລະ ຈັດການໃບສະເໜີລາຄາໃຫ້ລູກຄ້າ.">
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="file_download"
          @click="toast.info('ກຳລັງກະກຽມ Export (mock)')"
          >Export</BaseButton
        >
        <BaseButton icon="post_add" @click="navigateTo('/quotations/create')"
          >ສ້າງສະເໜີລາຄາ</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="ສະເໜີລາຄາທັງໝົດ" :value="format.number(stats.total)" icon="request_quote" />
      <StatCard
        label="ລໍຖ້າຕອບຮັບ"
        :value="format.number(stats.sent)"
        icon="schedule"
        trend="ຕິດຕາມ"
        trend-tone="warning"
      />
      <StatCard
        label="ຍອມຮັບແລ້ວ"
        :value="format.number(stats.accepted)"
        icon="check_circle"
        trend="+10%"
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
            label="ຄົ້ນຫາສະເໜີລາຄາ"
            placeholder="ເລກທີ, ຊື່ລູກຄ້າ..."
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
      caption="ຕາຕະລາງສະເໜີລາຄາ"
      empty-title="ບໍ່ພົບສະເໜີລາຄາ"
      empty-description="ລອງປ່ຽນຕົວກອງ ຫຼື ສ້າງໃໝ່."
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-reference="{ row }">
        <NuxtLink
          :to="`/quotations/${row.id}`"
          class="font-bold text-primary-text hover:underline"
          >{{ row.reference }}</NuxtLink
        >
        <p class="mt-0.5 text-xs text-muted">{{ row.productName }}</p>
      </template>
      <template #cell-validUntil="{ value }">
        {{ format.date(value) }}
      </template>
      <template #cell-premium="{ value }">
        <span class="font-bold tabular-nums">{{ format.currency(value) }}</span>
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <div class="flex justify-end gap-1">
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ເບິ່ງ"
            icon="visibility"
            @click="navigateTo(`/quotations/${row.id}`)"
          />
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ພິມ"
            icon="print"
            @click="toast.info('ພິມ (mock)')"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useQuotations } from '~/composables/api/useQuotations'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ສະເໜີລາຄາ',
  permission: 'quotation.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useQuotations()

const localStats = computed(() => ({
  total: total.value,
  sent: items.value.filter((quotation) => quotation.status === 'sent').length,
  accepted: items.value.filter((quotation) => quotation.status === 'accepted').length,
}))

const { remoteStats } = useRemoteStats('/quotations')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'draft', label: 'ຮ່າງ' },
  { key: 'sent', label: 'ສົ່ງແລ້ວ' },
  { key: 'accepted', label: 'ຍອມຮັບ' },
  { key: 'expired', label: 'ໝົດອາຍຸ' },
])

const columns = [
  { key: 'reference', label: 'ເລກທີ', sortable: true },
  { key: 'customerName', label: 'ລູກຄ້າ' },
  { key: 'productType', label: 'ປະເພດ', hideOn: ['mobile'] },
  { key: 'validUntil', label: 'ໃຊ້ໄດ້ຮອດ', hideOn: ['mobile'] },
  { key: 'premium', label: 'ມູນຄ່າ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
