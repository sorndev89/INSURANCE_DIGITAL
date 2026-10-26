<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader title="ລາຍການເຄມ" description="ຕິດຕາມສະຖານະການແຈ້ງເຄມ ແລະ ການອະນຸມັດ.">
      <template #actions>
        <BaseButton variant="secondary" icon="warning" @click="toast.info('ແຈ້ງເຫດດ່ວນ')"
          >ແຈ້ງເຫດດ່ວນ</BaseButton
        >
        <BaseButton icon="add_circle" @click="navigateTo('/claims/create')">ແຈ້ງເຄມໃໝ່</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ເຄມທັງໝົດ" :value="format.number(stats.total)" icon="assignment" />
      <StatCard
        label="ລໍຖ້າກວດສອບ"
        :value="format.number(stats.pending)"
        icon="hourglass_empty"
        trend="ດ່ວນ"
        trend-tone="warning"
      />
      <StatCard
        label="ອະນຸມັດແລ້ວ"
        :value="format.number(stats.approved)"
        icon="check_circle"
        trend="+8%"
      />
      <StatCard
        label="ປະຕິເສດ"
        :value="format.number(stats.rejected)"
        icon="cancel"
        trend-tone="danger"
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
            label="ຄົ້ນຫາເຄມ"
            placeholder="ເລກເຄມ, ປະກັນໄພ, ຊື່..."
          />
        </div>
        <div class="w-full sm:w-44">
          <BaseSelect
            v-model="filters.type"
            :options="typeOptions"
            placeholder="ທຸກປະເພດ"
            aria-label="ປະເພດເຄມ"
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
      caption="ຕາຕະລາງເຄມ"
      empty-title="ບໍ່ພົບເຄມ"
      empty-description="ລອງປ່ຽນຕົວກອງ ຫຼື ແຈ້ງເຄມໃໝ່."
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-claimNumber="{ row }">
        <NuxtLink :to="`/claims/${row.id}`" class="font-bold text-primary-text hover:underline">{{
          row.claimNumber
        }}</NuxtLink>
        <p class="mt-0.5 text-xs text-muted">{{ row.type }}</p>
      </template>
      <template #cell-claimant="{ row }">
        <p class="font-bold">{{ row.claimant }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.policyNumber }}</p>
      </template>
      <template #cell-amount="{ value }">
        <span class="font-bold tabular-nums text-danger">{{ format.currency(value) }}</span>
      </template>
      <template #cell-incidentDate="{ value }">
        {{ format.date(value) }}
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="value" />
      </template>
      <template #actions="{ row }">
        <BaseButton
          variant="ghost"
          size="sm"
          icon-only
          label="ເບິ່ງ"
          icon="visibility"
          @click="navigateTo(`/claims/${row.id}`)"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useClaims } from '~/composables/api/useClaims'
import { useToast } from '~/composables/useToast'
import { PRODUCT_TYPES } from '~/utils/constants'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍການເຄມ',
  permission: 'claim.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useClaims()

const localStats = computed(() => ({
  total: total.value,
  pending: items.value.filter((claim) => claim.status === 'pending').length,
  approved: items.value.filter((claim) => claim.status === 'approved').length,
  rejected: items.value.filter((claim) => claim.status === 'rejected').length,
}))

const { remoteStats } = useRemoteStats('/claims')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'pending', label: 'ລໍຖ້າ' },
  { key: 'reviewing', label: 'ກວດສອບ' },
  { key: 'approved', label: 'ອະນຸມັດ' },
  { key: 'rejected', label: 'ປະຕິເສດ' },
])

const typeOptions = PRODUCT_TYPES

const columns = [
  { key: 'claimNumber', label: 'ເຄມ', sortable: true },
  { key: 'claimant', label: 'ຜູ້ແຈ້ງ' },
  { key: 'incidentDate', label: 'ວັນທີ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ມູນຄ່າ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
