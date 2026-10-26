<template>
  <div class="space-y-6">
    <PageHeader title="ຈັດການຜູ້ໃຊ້ງານ" description="ກຳນົດສິດ ແລະ ຜູ້ເຂົ້າໃຊ້ລະບົບ.">
      <template #actions>
        <BaseButton icon="person_add" @click="openCreate">ເພີ່ມຜູ້ໃຊ້</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຜູ້ໃຊ້ທັງໝົດ" :value="format.number(stats.total)" icon="manage_accounts" />
      <StatCard
        label="ຜູ້ດູແລລະບົບ"
        :value="format.number(stats.admins)"
        icon="admin_panel_settings"
      />
      <StatCard label="ຕົວແທນ" :value="format.number(stats.agents)" icon="badge" />
      <StatCard
        label="ລູກຄ້າ"
        :value="format.number(stats.customers)"
        icon="people_alt"
        highlight
      />
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
        <span class="font-mono text-xs font-bold text-muted">{{ value }}</span>
      </template>
      <template #cell-role="{ value }">
        <BaseBadge tone="info">{{ roleLabel(value) }}</BaseBadge>
      </template>
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
      <template #actions="{ row }">
        <BaseButton
          variant="ghost"
          size="sm"
          icon-only
          label="ແກ້ໄຂ"
          icon="edit"
          @click="openEdit(row)"
        />
      </template>
    </DataTable>

    <BaseModal v-model="showModal" :title="editing ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'" size="sm">
      <form id="user-form" class="space-y-4" @submit.prevent="submit">
        <div
          v-if="formError"
          class="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm font-bold text-danger"
        >
          {{ formError }}
        </div>
        <BaseInput
          v-if="!editing"
          v-model="form.username"
          label="ຊື່ເຂົ້າໃຊ້"
          required
          autocomplete="username"
        />
        <BaseInput
          v-if="!editing"
          v-model="form.email"
          type="email"
          label="ອີເມວ"
          required
          autocomplete="email"
        />
        <BaseInput
          v-if="!editing"
          v-model="form.password"
          type="password"
          label="ລະຫັດຜ່ານ"
          required
          autocomplete="new-password"
        />
        <BaseInput v-model="form.phone" label="ເບີໂທ" autocomplete="tel" />
        <BaseSelect v-model="form.role" label="ບົດບາດ" :options="roleOptions" />
        <BaseSelect v-if="editing" v-model="form.status" label="ສະຖານະ" :options="statusOptions" />
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="showModal = false">ຍົກເລີກ</BaseButton>
          <BaseButton type="submit" form="user-form" :loading="saving">
            {{ editing ? 'ບັນທຶກ' : 'ສ້າງຜູ້ໃຊ້' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useUsers } from '~/composables/api/useUsers'
import { useApiClient } from '~/composables/api/useApiClient'
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { tenantPath } from '~/config/api'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຜູ້ໃຊ້ງານ',
  permission: 'user.view',
})

const format = useFormat()
const toast = useToast()
const { apiFetch } = useApiClient()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage } = useUsers()
const { remoteStats, refreshStats } = useRemoteStats('/users')

const localStats = computed(() => ({
  total: total.value,
  admins: items.value.filter((user) => user.role === 'admin').length,
  agents: items.value.filter((user) => user.role === 'agent').length,
  customers: items.value.filter((user) => user.role === 'customer').length,
}))
const stats = computed(() => remoteStats.value || localStats.value)

const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  username: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  status: 'active',
})

const roleOptions = [
  { value: 'admin', label: 'ຜູ້ດູແລລະບົບ' },
  { value: 'staff', label: 'ພະນັກງານ' },
  { value: 'agent', label: 'ຕົວແທນ' },
  { value: 'customer', label: 'ລູກຄ້າ' },
]
const statusOptions = [
  { value: 'active', label: 'ໃຊ້ງານ' },
  { value: 'inactive', label: 'ປິດໃຊ້' },
  { value: 'suspended', label: 'ລະງັບ' },
]

const openCreate = () => {
  editing.value = null
  formError.value = ''
  Object.assign(form, {
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
    status: 'active',
  })
  showModal.value = true
}

const openEdit = (row) => {
  editing.value = row
  formError.value = ''
  Object.assign(form, {
    username: row.username || '',
    email: row.email || '',
    password: '',
    phone: row.phone || '',
    role: row.role || 'staff',
    status: row.status || 'active',
  })
  showModal.value = true
}

const submit = async () => {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await apiFetch(tenantPath(`/users/${editing.value.id}`), {
        method: 'PATCH',
        body: { role: form.role, status: form.status, phone: form.phone || null },
      })
      toast.success('ອັບເດດຜູ້ໃຊ້ແລ້ວ')
    } else {
      await apiFetch(tenantPath('/users'), {
        method: 'POST',
        body: {
          username: form.username,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
        },
      })
      toast.success('ສ້າງຜູ້ໃຊ້ແລ້ວ')
    }
    showModal.value = false
    await Promise.all([refresh(), refreshStats()])
  } catch (requestError) {
    formError.value =
      requestError?.data?.error?.message || requestError?.message || 'ບໍ່ສາມາດບັນທຶກໄດ້'
  } finally {
    saving.value = false
  }
}

const roleTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'admin', label: 'ຜູ້ດູແລ' },
  { key: 'staff', label: 'ພະນັກງານ' },
  { key: 'agent', label: 'ຕົວແທນ' },
  { key: 'customer', label: 'ລູກຄ້າ' },
])

const columns = [
  { key: 'name', label: 'ຜູ້ໃຊ້', sortable: true },
  { key: 'username', label: 'ຊື່ເຂົ້າໃຊ້', hideOn: ['mobile'] },
  { key: 'role', label: 'ບົດບາດ' },
  { key: 'phone', label: 'ເບີໂທ', hideOn: ['mobile'] },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const roleLabel = (role) => {
  if (role === 'admin') return 'ຜູ້ດູແລລະບົບ'
  if (role === 'staff') return 'ພະນັກງານ'
  if (role === 'agent') return 'ຕົວແທນ'
  return 'ລູກຄ້າ'
}
</script>
