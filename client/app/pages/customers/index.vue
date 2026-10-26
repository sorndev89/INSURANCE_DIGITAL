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
          @click="toast.info('ກຳລັງກະກຽມ Export (mock)')"
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
            @click="toast.info('ຟອມແກ້ໄຂຈະມາໃນໄວໆນີ້')"
          />
        </div>
      </template>
    </DataTable>

    <BaseModal v-model="createOpen" title="ເພີ່ມລູກຄ້າໃໝ່" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.firstName" label="ຊື່" required :error="errors.firstName" />
        <BaseInput v-model="form.lastName" label="ນາມສະກຸນ" required :error="errors.lastName" />
        <BaseInput
          v-model="form.phone"
          label="ເບີໂທ"
          prefix-icon="phone"
          required
          :error="errors.phone"
        />
        <BaseInput
          v-model="form.email"
          type="email"
          label="ອີເມວ"
          prefix-icon="mail"
          :error="errors.email"
        />
        <BaseSelect v-model="form.gender" label="ເພດ" :options="GENDERS" />
        <BaseInput v-model="form.occupation" label="ອາຊີບ" />
      </div>
      <BaseTextarea
        v-model="form.address"
        label="ທີ່ຢູ່"
        class="mt-4"
        placeholder="ບ້ານ, ເມືອງ, ແຂວງ"
      />
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="saveCustomer">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { useRemoteStats } from '~/composables/api/useRemoteStats'
import { computed, reactive, ref } from 'vue'
import { navigateTo } from '#app'
import { useCustomers } from '~/composables/api/useCustomers'
import { useToast } from '~/composables/useToast'
import { GENDERS } from '~/utils/constants'
import { useFormat } from '~/utils/format'
import {
  email as emailValidator,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ຈັດການຂໍ້ມູນລູກຄ້າ',
  permission: 'customer.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, create } =
  useCustomers()

const localStats = computed(() => ({
  total: total.value,
  active: items.value.filter((customer) => customer.status === 'active').length,
  policies: items.value.reduce((sum, customer) => sum + (Number(customer.policiesCount) || 0), 0),
}))

const { remoteStats } = useRemoteStats('/customers')
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

const createOpen = ref(false)
const saving = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: 'male',
  occupation: '',
  address: '',
})
const errors = reactive({ firstName: '', lastName: '', phone: '', email: '' })

const openCreate = () => {
  Object.assign(form, {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: 'male',
    occupation: '',
    address: '',
  })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  createOpen.value = true
}

const saveCustomer = async () => {
  errors.firstName = required(form.firstName)
  errors.lastName = required(form.lastName)
  errors.phone = validate(form.phone, [required, phoneValidator])
  errors.email = form.email ? emailValidator(form.email) : ''
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    await create(form)
    createOpen.value = false
    refresh()
    toast.success('ເພີ່ມລູກຄ້າສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດເພີ່ມລູກຄ້າໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
