<template>
  <div class="space-y-6">
    <PageHeader title="ຈັດການຜູ້ໃຊ້ງານ" description="ກຳນົດສິດ ແລະ ຜູ້ເຂົ້າໃຊ້ລະບົບ.">
      <template #actions>
        <BaseButton v-if="canManage" icon="person_add" @click="openCreate">ເພີ່ມຜູ້ໃຊ້</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຜູ້ໃຊ້ທັງໝົດ" :value="totalUsersLabel" icon="manage_accounts" />
      <StatCard label="ຜູ້ດູແລລະບົບ" :value="statLabel('admins')" icon="admin_panel_settings" />
      <StatCard label="ຕົວແທນ" :value="statLabel('agents')" icon="badge" />
      <StatCard label="ລູກຄ້າ" :value="statLabel('customers')" icon="people_alt" highlight />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.role" :items="roleTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາຜູ້ໃຊ້"
            placeholder="ຊື່, ອີເມວ, ເບີໂທ..."
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
      caption="ຕາຕະລາງຜູ້ໃຊ້"
      empty-title="ບໍ່ພົບຜູ້ໃຊ້"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <BaseAvatar :src="row.avatar" :name="row.name" size="sm" />
          <div>
            <p class="font-bold">{{ row.name }}</p>
            <p class="mt-0.5 text-xs text-muted">{{ row.email }}</p>
          </div>
        </div>
      </template>
      <template #cell-username="{ value }">
        <span class="font-mono text-xs font-bold text-muted">@{{ value }}</span>
      </template>
      <template #cell-role="{ row }">
        <BaseBadge tone="info">{{ roleLabel(row.role, row.roleName) }}</BaseBadge>
      </template>
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
      <template #cell-createdAt="{ value }">
        <span class="text-xs text-muted">{{ format.date(value) }}</span>
      </template>
      <template #actions="{ row }">
        <div v-if="canManage" class="flex items-center justify-end gap-1">
          <BaseButton
            variant="ghost"
            size="sm"
            icon-only
            label="ແກ້ໄຂ"
            icon="edit"
            @click="openEdit(row)"
          />
          <BaseButton
            v-if="row.id !== auth.user?.id"
            variant="ghost"
            size="sm"
            icon-only
            label="ລຶບ"
            icon="delete"
            :loading="removingId === row.id"
            @click="removeUser(row)"
          />
        </div>
      </template>
    </DataTable>

    <UserFormModal
      v-model="showModal"
      :user="editingUser"
      :current-user-id="auth.user?.id"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUsers } from '~/composables/api/useUsers'
import { useRoleOptions } from '~/composables/api/useRoles'
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { PERM, ROLE_LABELS } from '~/config/permissions'
import { useFormat } from '~/utils/format'
import { messageFrom } from '~/utils/apiError'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຜູ້ໃຊ້ງານ',
  permission: 'user.view',
})

const format = useFormat()
const toast = useToast()
const auth = useAuthStore()
const { confirm } = useConfirm()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, remove } =
  useUsers()
const { remoteStats, refreshStats } = useRemoteStats('/users')
const { items: roleOptions } = useRoleOptions()

const showModal = ref(false)
const editingUser = ref(null)
const removingId = ref(null)

const canManage = computed(() => auth.can(PERM.USER_MANAGE))

const totalUsersLabel = computed(() => format.number(remoteStats.value?.total ?? total.value))
const statLabel = (key) => (remoteStats.value ? format.number(remoteStats.value[key]) : '—')

const statCount = (key) => {
  if (!remoteStats.value) return undefined
  if (key === 'admin') return remoteStats.value.admins
  if (key === 'agent') return remoteStats.value.agents
  if (key === 'customer') return remoteStats.value.customers
  return undefined
}

const roleTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: remoteStats.value?.total ?? total.value },
  ...roleOptions.value.map((role) => ({
    key: role.key,
    label: role.name,
    count: statCount(role.key),
  })),
])

const columns = [
  { key: 'name', label: 'ຜູ້ໃຊ້', sortable: true },
  { key: 'username', label: 'ຊື່ເຂົ້າໃຊ້', hideOn: ['mobile'] },
  { key: 'role', label: 'ບົດບາດ' },
  { key: 'phone', label: 'ເບີໂທ', hideOn: ['mobile'] },
  { key: 'createdAt', label: 'ສ້າງເມື່ອ', hideOn: ['mobile'] },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const openCreate = () => {
  editingUser.value = null
  showModal.value = true
}

const openEdit = (row) => {
  editingUser.value = row
  showModal.value = true
}

const handleSaved = async () => {
  await Promise.all([refresh(), refreshStats()])
}

const removeUser = async (row) => {
  const accepted = await confirm({
    title: 'ລຶບຜູ້ໃຊ້',
    message: `ລຶບຜູ້ໃຊ້ ${row.name || row.username}? ການກະທຳນີ້ບໍ່ສາມາດກູ້ຄືນໄດ້.`,
    confirmLabel: 'ລຶບຜູ້ໃຊ້',
    tone: 'danger',
  })
  if (!accepted) return

  removingId.value = row.id
  try {
    await remove(row.id)
    toast.success('ລຶບຜູ້ໃຊ້ແລ້ວ')
    await Promise.all([refresh(), refreshStats()])
  } catch (requestError) {
    toast.error(messageFrom(requestError, 'ບໍ່ສາມາດລຶບຜູ້ໃຊ້ໄດ້'))
  } finally {
    removingId.value = null
  }
}

const roleLabel = (role, roleName) =>
  roleName || ROLE_LABELS[role] || role || '—'
</script>
