<template>
  <div class="space-y-6">
    <PageHeader
      title="ຈັດການຂໍ້ມູນລູກຄ້າ"
      description="ລາຍການລູກຄ້າທັງໝົດ ພ້ອມຂໍ້ມູນຕິດຕໍ່ ແລະ ສະຖານະ."
    >
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="file_download"
          @click="toast.info('ກຳລັງກະກຽມ Export')"
          >Export</BaseButton
        >
        <BaseButton icon="person_add" @click="openCreate">ເພີ່ມລູກຄ້າ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="ລູກຄ້າທັງໝົດ" :value="format.number(stats.total)" icon="people_alt" />
      <StatCard
        label="ລູກຄ້າມີຜົນ"
        :value="format.number(stats.active)"
        icon="verified_user"
        trend="+3.5%"
      />
      <StatCard label="ປະກັນໄພລວມ" :value="format.number(stats.policies)" icon="description" />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາລູກຄ້າ"
            placeholder="ຊື່, ເບີໂທ, ອີເມວ..."
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
      caption="ຕາຕະລາງລູກຄ້າ"
      empty-title="ບໍ່ພົບລູກຄ້າ"
      empty-description="ລອງປ່ຽນຕົວກອງ ຫຼື ເພີ່ມລູກຄ້າໃໝ່."
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-fullName="{ row }">
        <p class="font-bold text-foreground">{{ row.fullName }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.email || '—' }}</p>
      </template>
      <template #cell-code="{ value }">
        <span class="font-mono text-xs font-bold text-muted">{{ value }}</span>
      </template>
      <template #cell-phone="{ value }">
        {{ format.phone(value) }}
      </template>
      <template #cell-policiesCount="{ value }">
        <BaseBadge tone="primary">{{ value }} ສະບັບ</BaseBadge>
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
            @click="navigateTo(`/customers/${row.id}`)"
          />
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ແກ້ໄຂ"
            icon="edit"
            @click="openEdit(row)"
          />
        </div>
      </template>
    </DataTable>

    <CustomerFormModal v-model="formOpen" :customer="editingCustomer" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { useCustomers } from '~/composables/api/useCustomers'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຂໍ້ມູນລູກຄ້າ',
  permission: 'customer.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useCustomers()

const localStats = computed(() => ({
  total: total.value,
  active: items.value.filter((customer) => customer.status === 'active').length,
  policies: items.value.reduce((sum, customer) => sum + (Number(customer.policiesCount) || 0), 0),
}))

const { remoteStats, refreshStats } = useRemoteStats('/customers')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'active', label: 'ມີຜົນ' },
  { key: 'inactive', label: 'ປິດໃຊ້ງານ' },
])

const columns = [
  { key: 'fullName', label: 'ລູກຄ້າ', sortable: true },
  { key: 'code', label: 'ລະຫັດ', hideOn: ['mobile'] },
  { key: 'phone', label: 'ເບີໂທ' },
  { key: 'policiesCount', label: 'ປະກັນໄພ', align: 'center' },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const formOpen = ref(false)
const editingCustomer = ref(null)

const openCreate = () => {
  editingCustomer.value = null
  formOpen.value = true
}

const openEdit = (customer) => {
  editingCustomer.value = { ...customer }
  formOpen.value = true
}

const handleSaved = () => {
  refresh()
  void refreshStats()
}
</script>
