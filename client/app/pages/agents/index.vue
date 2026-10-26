<template>
  <div class="space-y-6">
    <PageHeader title="ຈັດການຕົວແທນ" description="ຕິດຕາມຜົນງານ ແລະ ຈັດການຕົວແທນຂາຍ.">
      <template #actions>
        <BaseButton variant="secondary" icon="star" @click="toast.info('Top Performers (mock)')"
          >Top Performers</BaseButton
        >
        <BaseButton icon="person_add" @click="toast.info('ຟອມເພີ່ມຕົວແທນຈະມາໃນໄວໆນີ້')"
          >ເພີ່ມຕົວແທນ</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="ຕົວແທນທັງໝົດ" :value="format.number(stats.total)" icon="badge" />
      <StatCard label="ຍອດຂາຍລວມ" :value="format.currency(stats.sales)" icon="payments" highlight />
      <StatCard label="ຄອມມິດຊັ່ນສະເລ່ຍ" :value="format.percent(stats.commission)" icon="percent" />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາຕົວແທນ"
            placeholder="ຊື່, ລະຫັດ, ທີມ..."
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
      caption="ຕາຕະລາງຕົວແທນ"
      empty-title="ບໍ່ພົບຕົວແທນ"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <BaseAvatar :name="row.name" size="sm" />
          <div>
            <p class="font-bold">{{ row.name }}</p>
            <p class="mt-0.5 text-xs text-muted">{{ row.email }}</p>
          </div>
        </div>
      </template>
      <template #cell-teamName="{ row }">
        <p class="font-medium">{{ row.code }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.teamName }}</p>
      </template>
      <template #cell-level="{ value }">
        <BaseBadge tone="info">{{ value }}</BaseBadge>
      </template>
      <template #cell-commissionRate="{ value }">
        <span class="font-bold text-success">{{ value }}%</span>
      </template>
      <template #cell-salesYtd="{ value }">
        <span class="font-bold tabular-nums">{{ format.currency(value) }}</span>
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
          @click="navigateTo(`/agents/${row.id}`)"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useAgents } from '~/composables/api/useAgents'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຕົວແທນ',
  permission: 'agent.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useAgents()

const localStats = computed(() => {
  const sales = items.value.reduce((sum, agent) => sum + (Number(agent.salesYtd) || 0), 0)
  const commission =
    items.value.length > 0
      ? items.value.reduce((sum, agent) => sum + (Number(agent.commissionRate) || 0), 0) /
        items.value.length
      : 0
  return { total: total.value, sales, commission }
})

const { remoteStats } = useRemoteStats('/agents')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'active', label: 'ມີຜົນ' },
  { key: 'inactive', label: 'ປິດໃຊ້ງານ' },
])

const columns = [
  { key: 'name', label: 'ຕົວແທນ', sortable: true },
  { key: 'teamName', label: 'ທີມ / ລະຫັດ' },
  { key: 'level', label: 'ລະດັບ', align: 'center', hideOn: ['mobile'] },
  { key: 'commissionRate', label: 'ຄອມມິດຊັ່ນ', align: 'right' },
  { key: 'salesYtd', label: 'ຍອດຂາຍ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
