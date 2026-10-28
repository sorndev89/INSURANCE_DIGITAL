<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ບໍລິສັດປະກັນໄພ"
      description="ຈັດການຄູ່ຮ່ວມ 11 ບໍລິສັດ, ອັດຕາຄອມມິດຊັ່ນ ແລະ ຂໍ້ມູນຕິດຕໍ່."
    >
      <template #actions>
        <BaseButton variant="secondary" icon="percent" @click="navigateTo('/insurer-commissions')">
          ຕາຕະລາງຄອມມິດຊັ່ນ
        </BaseButton>
        <BaseButton icon="add_business" @click="openCreate">ເພີ່ມບໍລິສັດ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ບໍລິສັດທັງໝົດ" :value="format.number(items.length)" icon="apartment" />
      <StatCard
        label="ໃຊ້ງານຢູ່"
        :value="format.number(activeCount)"
        icon="verified"
        trend="ຄູ່ຮ່ວມທັງໝົດ"
      />
      <StatCard
        label="ຄອມມິດຊັ່ນສະເລ່ຍ"
        :value="`${averageRate}%`"
        icon="percent"
      />
      <StatCard
        label="ຍອດຂາຍສະສົມ"
        :value="format.currency(totalPremium)"
        icon="payments"
        highlight
      />
    </div>

    <FilterBar>
      <template #start>
        <p class="text-sm font-bold text-muted">ລາຍຊື່ຄູ່ຮ່ວມທັງ 11 ບໍລິສັດ</p>
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="search"
            label="ຄົ້ນຫາບໍລິສັດ"
            placeholder="ລະຫັດ, ຊື່, ເບີໂທ..."
          />
        </div>
      </template>
    </FilterBar>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="insurer in filteredItems"
        :key="insurer.id"
        class="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition-all hover:border-primary"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="insurer.logo"
            :src="insurer.logo"
            :alt="insurer.name"
            class="h-12 w-12 shrink-0 rounded-xl bg-surface-muted object-contain p-1"
          />
          <span
            v-else
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary-text"
          >
            {{ insurer.code }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold">{{ insurer.nameLao }}</p>
            <p class="mt-0.5 truncate text-xs text-muted">{{ insurer.name }}</p>
            <p class="mt-1 text-xs text-muted">{{ insurer.contactPerson }} · {{ insurer.contactPhone }}</p>
          </div>
          <StatusBadge :status="insurer.status" />
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
          <div>
            <p class="text-xs text-muted">ຄອມມິດຊັ່ນ</p>
            <p class="font-bold text-success">{{ insurer.defaultCommissionRate }}%</p>
          </div>
          <div>
            <p class="text-xs text-muted">ເຄຣດິດ</p>
            <p class="font-bold">{{ insurer.creditDays }} ວັນ</p>
          </div>
          <div>
            <p class="text-xs text-muted">ສັນຍາ</p>
            <p class="font-bold">{{ policyCount(insurer.code) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຍອດຂາຍ</p>
            <p class="font-bold tabular-nums">{{ format.compact(premiumByInsurer(insurer.code)) }}</p>
          </div>
        </div>

        <div class="mt-3 flex justify-end gap-1">
          <BaseButton
            variant="ghost"
            size="sm"
            icon="visibility"
            @click="navigateTo(`/insurers/${insurer.id}`)"
          >
            ເບິ່ງ
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            icon="percent"
            @click="navigateTo('/insurer-commissions')"
          >
            ຄອມ
          </BaseButton>
        </div>
      </article>
    </div>

    <EmptyState v-if="!filteredItems.length" title="ບໍ່ພົບບໍລິສັດ" />

    <BaseModal v-model="createOpen" title="ເພີ່ມບໍລິສັດປະກັນໄພ" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.code" label="ລະຫັດ" placeholder="DHP" required :error="errors.code" />
        <BaseInput v-model="form.shortName" label="ຊື່ຫຍໍ້" placeholder="ທິບພະຍະ" />
        <BaseInput v-model="form.nameLao" label="ຊື່ລາວ" placeholder="ບໍລິສັດ ..." required />
        <BaseInput v-model="form.name" label="ຊື່ອັງກິດ" placeholder="COMPANY NAME" required />
        <BaseInput v-model="form.contactPerson" label="ຜູ້ຕິດຕໍ່" />
        <BaseInput v-model="form.contactPhone" label="ເບີໂທຕິດຕໍ່" prefix-icon="phone" />
        <BaseInput v-model="form.claimsHotline" label="ສາຍດ່ວນເຄມ" />
        <BaseInput v-model="form.address" label="ທີ່ຢູ່" />
        <BaseNumberInput
          v-model.number="form.defaultCommissionRate"
          label="ອັດຕາຄອມມິດຊັ່ນ (%)"
          :min="0"
          :max="100"
          suffix="%"
        />
        <BaseNumberInput v-model.number="form.creditDays" label="ເຄຣດິດ (ວັນ)" :min="0" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="save">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { navigateTo } from '#app'
import { useCompanies } from '~/composables/api/useCompanies'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { policies } from '~/mocks/policies'
import { required } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ບໍລິສັດປະກັນໄພ',
  permission: 'insurer.view',
})

const format = useFormat()
const toast = useToast()
const { list, create } = useCompanies()

const items = ref([])
const search = ref('')
const createOpen = ref(false)
const saving = ref(false)

const form = reactive({
  code: '',
  shortName: '',
  nameLao: '',
  name: '',
  contactPerson: '',
  contactPhone: '',
  claimsHotline: '',
  address: '',
  defaultCommissionRate: 15,
  creditDays: 30,
})
const errors = reactive({ code: '' })

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return items.value
  return items.value.filter((item) =>
    [item.code, item.name, item.nameLao, item.shortName, item.contactPhone]
      .join(' ')
      .toLowerCase()
      .includes(keyword),
  )
})
const activeCount = computed(() => items.value.filter((item) => item.status === 'active').length)
const averageRate = computed(() => {
  if (!items.value.length) return 0
  const sum = items.value.reduce((total, item) => total + (item.defaultCommissionRate || 0), 0)
  return Math.round((sum / items.value.length) * 10) / 10
})
const totalPremium = computed(() =>
  items.value.reduce((sum, item) => sum + premiumByInsurer(item.code), 0),
)

const premiumByInsurer = (code) =>
  policies
    .filter((policy) => policy.companyCode === code)
    .reduce((sum, policy) => sum + (policy.totalPremium || 0), 0)
const policyCount = (code) => policies.filter((policy) => policy.companyCode === code).length

const load = async () => {
  items.value = await list()
}

const openCreate = () => {
  Object.assign(form, {
    code: '',
    shortName: '',
    nameLao: '',
    name: '',
    contactPerson: '',
    contactPhone: '',
    claimsHotline: '',
    address: '',
    defaultCommissionRate: 15,
    creditDays: 30,
  })
  errors.code = ''
  createOpen.value = true
}

const save = async () => {
  errors.code = required(form.code)
  if (!form.nameLao.trim() || !form.name.trim()) {
    toast.error('ກະລຸນາປ້ອນຊື່ບໍລິສັດ')
    return
  }
  if (errors.code) return
  saving.value = true
  try {
    await create(form)
    await load()
    createOpen.value = false
    toast.success('ເພີ່ມບໍລິສັດປະກັນໄພສຳເລັດ')
  } catch (error) {
    toast.error(error?.message || 'ບໍ່ສາມາດເພີ່ມບໍລິສັດໄດ້')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
