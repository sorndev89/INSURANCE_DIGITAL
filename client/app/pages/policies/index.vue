<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader title="ຈັດການປະກັນໄພ" description="ລາຍການປະກັນໄພທັງໝົດ ພ້ອມສະຖານະ ແລະ ການຕໍ່ອາຍຸ.">
      <template #actions>
        <BaseButton variant="secondary" icon="file_download" @click="exportList">Export</BaseButton>
        <BaseButton icon="add_circle" @click="navigateTo('/policies/create')"
          >ເຮັດປະກັນໄພໃໝ່</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ປະກັນໄພທັງໝົດ" :value="format.number(stats.total)" icon="description" />
      <StatCard
        label="ປະກັນໄພມີຜົນ"
        :value="format.number(stats.active)"
        icon="verified_user"
        trend="+5.2%"
      />
      <StatCard
        label="ໝົດອາຍຸໃນ 30 ວັນ"
        :value="format.number(stats.expiring)"
        icon="schedule"
        trend="ຕ້ອງຕໍ່ອາຍຸ"
        trend-tone="warning"
      />
      <StatCard
        label="ເບ້ຍປະກັນລວມ"
        :value="format.currency(stats.premium)"
        icon="payments"
        highlight
      />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-64">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາປະກັນໄພ"
            placeholder="ເລກປະກັນໄພ, ຊື່, ທະບຽນ..."
          />
        </div>
        <div class="w-full sm:w-48">
          <BaseSelect
            v-model="filters.productType"
            :options="productOptions"
            placeholder="ທຸກປະເພດ"
            aria-label="ປະເພດປະກັນໄພ"
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
      caption="ຕາຕະລາງປະກັນໄພ"
      empty-title="ບໍ່ພົບປະກັນໄພ"
      empty-description="ລອງປ່ຽນຕົວກອງ ຫຼື ສ້າງປະກັນໄພໃໝ່."
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-policyNumber="{ row }">
        <NuxtLink
          :to="`/policies/${row.id}`"
          class="whitespace-nowrap font-bold text-primary-text hover:underline"
        >
          {{ row.policyNumber }}
        </NuxtLink>
        <p class="mt-0.5 text-xs text-muted">{{ row.productName }}</p>
      </template>
      <template #cell-customer="{ row }">
        <p class="font-bold text-foreground">{{ row.customerName }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ format.phone(row.customerPhone) }}</p>
      </template>
      <template #cell-company="{ row }">
        <p class="text-sm font-medium">{{ row.companyCode }}</p>
        <p class="text-xs text-muted">{{ row.companyName }}</p>
      </template>
      <template #cell-period="{ row }">
        <p class="text-sm">{{ format.date(row.startDate) }} – {{ format.date(row.endDate) }}</p>
      </template>
      <template #cell-totalPremium="{ value }">
        <p class="font-bold tabular-nums">{{ format.currency(value) }}</p>
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ເບິ່ງລາຍລະອຽດ"
            icon="visibility"
            @click="navigateTo(`/policies/${row.id}`)"
          />
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ຕໍ່ອາຍຸ"
            icon="autorenew"
            @click="renew(row)"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { usePolicies } from '~/composables/api/usePolicies'
import { useToast } from '~/composables/useToast'
import { PRODUCT_TYPES } from '~/utils/constants'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການປະກັນໄພ',
  permission: 'policy.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, stats, refresh, setPage } =
  usePolicies()

const productOptions = PRODUCT_TYPES

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'active', label: 'ມີຜົນ', count: stats.value.active },
  { key: 'pending', label: 'ລໍຖ້າ' },
  { key: 'expired', label: 'ໝົດອາຍຸ' },
])

const columns = [
  { key: 'policyNumber', label: 'ປະກັນໄພ', sortable: true },
  { key: 'customer', label: 'ຜູ້ເອົາປະກັນ' },
  { key: 'company', label: 'ບໍລິສັດ', hideOn: ['mobile'] },
  { key: 'period', label: 'ໄລຍະຄຸ້ມຄອງ', hideOn: ['mobile'] },
  { key: 'totalPremium', label: 'ເບ້ຍປະກັນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const exportList = () => {
  toast.success('ກຳລັງກະກຽມໄຟລ໌ Export (mock)')
}

const renew = (policy) => {
  toast.info(`ເລີ່ມການຕໍ່ອາຍຸ ${policy.policyNumber}`)
}
</script>
