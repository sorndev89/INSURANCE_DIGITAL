<template>
  <div class="space-y-6">
    <PageHeader title="ຈັດການຕົວແທນ" description="ຕິດຕາມຜົນງານ ແລະ ຈັດການຕົວແທນຂາຍ.">
      <template #actions>
        <BaseButton variant="secondary" icon="star" @click="toast.info('Top Performers (mock)')"
          >Top Performers</BaseButton
        >
        <BaseButton icon="person_add" @click="openCreate">ເພີ່ມຕົວແທນ</BaseButton>
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

    <BaseModal v-model="createOpen" title="ເພີ່ມຕົວແທນໃໝ່" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.name" label="ຊື່ຜູ້ໃຊ້" required :error="errors.name" />
        <BaseInput
          v-model="form.email"
          type="email"
          label="ອີເມວ"
          prefix-icon="mail"
          required
          :error="errors.email"
        />
        <BaseInput v-model="form.phone" label="ເບີໂທ" prefix-icon="phone" :error="errors.phone" />
        <BaseInput
          v-model="form.password"
          type="password"
          label="ລະຫັດຜ່ານ"
          placeholder="ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
          required
          :error="errors.password"
        />
        <BaseSelect v-model="form.teamId" label="ທີມ" :options="teamOptions" />
        <BaseSelect v-model="form.level" label="ລະດັບ" :options="LEVEL_OPTIONS" />
        <BaseInput
          v-model="form.commissionRate"
          type="number"
          label="ອັດຕາຄອມມິດຊັ່ນ (%)"
          min="0"
          max="100"
          suffix="%"
          :error="errors.commissionRate"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="saveAgent">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed, reactive, ref } from 'vue'
import { navigateTo } from '#app'
import { useAgents } from '~/composables/api/useAgents'
import { useTeams } from '~/composables/api/useTeams'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import {
  email as emailValidator,
  maxValue,
  minValue,
  numeric,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຕົວແທນ',
  permission: 'agent.view',
})

const LEVEL_OPTIONS = [
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Manager', label: 'Manager' },
]

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, create } =
  useAgents()
const { items: teams } = useTeams({ pageSize: 100, querySync: false })

const localStats = computed(() => {
  const sales = items.value.reduce((sum, agent) => sum + (Number(agent.salesYtd) || 0), 0)
  const commission =
    items.value.length > 0
      ? items.value.reduce((sum, agent) => sum + (Number(agent.commissionRate) || 0), 0) /
        items.value.length
      : 0
  return { total: total.value, sales, commission }
})

const { remoteStats, refreshStats } = useRemoteStats('/agents')
const stats = computed(() => remoteStats.value || localStats.value)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'active', label: 'ມີຜົນ' },
  { key: 'inactive', label: 'ປິດໃຊ້ງານ' },
])

const teamOptions = computed(() => [
  { value: '', label: 'ບໍ່ມີທີມ' },
  ...teams.value.map((team) => ({ value: String(team.id), label: team.name })),
])

const columns = [
  { key: 'name', label: 'ຕົວແທນ', sortable: true },
  { key: 'teamName', label: 'ທີມ / ລະຫັດ' },
  { key: 'level', label: 'ລະດັບ', align: 'center', hideOn: ['mobile'] },
  { key: 'commissionRate', label: 'ຄອມມິດຊັ່ນ', align: 'right' },
  { key: 'salesYtd', label: 'ຍອດຂາຍ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const createOpen = ref(false)
const saving = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  teamId: '',
  level: 'Senior',
  commissionRate: 5,
})
const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  commissionRate: '',
})

const openCreate = () => {
  Object.assign(form, {
    name: '',
    email: '',
    phone: '',
    password: '',
    teamId: '',
    level: 'Senior',
    commissionRate: 5,
  })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  createOpen.value = true
}

const saveAgent = async () => {
  errors.name = required(form.name)
  errors.email = validate(form.email, [required, emailValidator])
  errors.phone = form.phone ? phoneValidator(form.phone) : ''
  errors.password = String(form.password).length >= 8 ? '' : 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ'
  errors.commissionRate = validate(form.commissionRate, [numeric, minValue(0), maxValue(100)])
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    const team = teams.value.find((item) => String(item.id) === String(form.teamId))
    await create({
      name: form.name.trim(),
      username: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      teamId: form.teamId ? Number(form.teamId) : null,
      teamName: team?.name || '',
      level: form.level,
      commissionRate: Number(form.commissionRate) || 0,
    })
    createOpen.value = false
    refresh()
    void refreshStats()
    toast.success('ເພີ່ມຕົວແທນສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດເພີ່ມຕົວແທນໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
