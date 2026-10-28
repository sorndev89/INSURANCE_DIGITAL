<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      :title="insurer?.nameLao || 'ລາຍລະອຽດບໍລິສັດ'"
      :description="insurer ? `${insurer.code} · ${insurer.name}` : 'ກຳລັງໂຫຼດຂໍ້ມູນ'"
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="navigateTo('/insurers')">
          ກັບຄືນ
        </BaseButton>
        <BaseButton variant="danger" icon="delete" @click="removeInsurer">ລຶບ</BaseButton>
        <BaseButton icon="save" :loading="saving" @click="save">ບັນທຶກ</BaseButton>
      </template>
    </PageHeader>

    <BaseSkeleton v-if="pending" height="xl" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="insurer">
      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center gap-3">
              <img
                v-if="insurer.logo"
                :src="insurer.logo"
                :alt="insurer.name"
                class="h-12 w-12 rounded-xl bg-surface-muted object-contain p-1"
              />
              <span
                v-else
                class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary-text"
              >
                {{ insurer.code }}
              </span>
              <div>
                <h2 class="text-base font-bold">{{ insurer.nameLao }}</h2>
                <p class="text-xs text-muted">{{ insurer.name }}</p>
              </div>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput v-model="form.nameLao" label="ຊື່ລາວ" />
            <BaseInput v-model="form.name" label="ຊື່ອັງກິດ" />
            <BaseInput v-model="form.shortName" label="ຊື່ຫຍໍ້" />
            <BaseInput v-model="form.contactPerson" label="ຜູ້ຕິດຕໍ່" />
            <BaseInput v-model="form.contactPhone" label="ເບີໂທ" prefix-icon="phone" />
            <BaseInput v-model="form.claimsHotline" label="ສາຍດ່ວນເຄມ" />
            <BaseInput v-model="form.address" label="ທີ່ຢູ່" />
            <BaseSelect
              v-model="form.status"
              label="ສະຖານະ"
              :options="[
                { value: 'active', label: 'ໃຊ້ງານ' },
                { value: 'inactive', label: 'ປິດໃຊ້ງານ' },
              ]"
            />
            <BaseNumberInput
              v-model.number="form.defaultCommissionRate"
              label="ອັດຕາຄອມມິດຊັ່ນ (%)"
              :min="0"
              :max="100"
              suffix="%"
            />
            <BaseNumberInput v-model.number="form.creditDays" label="ເຄຣດິດ (ວັນ)" :min="0" />
          </div>
        </BaseCard>

        <div class="space-y-4">
          <StatCard
            label="ຍອດຂາຍສະສົມ"
            :value="format.currency(insurerPremium)"
            icon="payments"
            highlight
          />
          <StatCard label="ສັນຍາທັງໝົດ" :value="format.number(insurerPolicies.length)" icon="description" />
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ອັດຕາຄອມມິດຊັ່ນຕາມຜະລິດຕະພັນ</h2>
            </template>
            <ul class="space-y-2 text-sm">
              <li
                v-for="(rate, type) in insurer.commissionRates"
                :key="type"
                class="flex items-center justify-between"
              >
                <span class="text-muted">{{ type }}</span>
                <span class="font-bold text-success">{{ rate }}%</span>
              </li>
            </ul>
            <BaseButton
              class="mt-3"
              variant="secondary"
              size="sm"
              block
              icon="percent"
              @click="navigateTo('/insurer-commissions')"
            >
              ແກ້ໄຂຕາຕະລາງ
            </BaseButton>
          </BaseCard>
        </div>
      </div>

      <BaseCard flush>
        <template #header>
          <h2 class="text-sm font-bold">ຜະລິດຕະພັນຂອງບໍລິສັດ</h2>
        </template>
        <ul class="divide-y divide-line">
          <li
            v-for="product in insurerProducts"
            :key="product.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ product.name }}</p>
              <p class="text-xs text-muted">{{ product.type }} · {{ product.description }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-bold tabular-nums">{{ format.currency(product.basePremium) }}</p>
              <p class="text-xs text-success">ຄອມ {{ product.brokerCommissionRate }}%</p>
            </div>
          </li>
          <li v-if="!insurerProducts.length" class="px-4 py-6 text-center text-sm text-muted">
            ຍັງບໍ່ມີຜະລິດຕະພັນ
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { useCompanies } from '~/composables/api/useCompanies'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { policies } from '~/mocks/policies'
import { products } from '~/mocks/products'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດບໍລິສັດປະກັນໄພ',
  permission: 'insurer.view',
})

const route = useRoute()
const format = useFormat()
const toast = useToast()
const { confirm } = useConfirm()
const { getById, update, remove } = useCompanies()

const insurer = ref(null)
const pending = ref(true)
const error = ref('')
const saving = ref(false)

const form = reactive({
  nameLao: '',
  name: '',
  shortName: '',
  contactPerson: '',
  contactPhone: '',
  claimsHotline: '',
  address: '',
  status: 'active',
  defaultCommissionRate: 15,
  creditDays: 30,
})

const insurerPolicies = computed(() =>
  policies.filter((policy) => policy.companyCode === insurer.value?.code),
)
const insurerPremium = computed(() =>
  insurerPolicies.value.reduce((sum, policy) => sum + (policy.totalPremium || 0), 0),
)
const insurerProducts = computed(() =>
  products.filter((product) => product.companyId === insurer.value?.id),
)

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    insurer.value = await getById(route.params.id)
    Object.assign(form, insurer.value)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    insurer.value = await update(route.params.id, form)
    toast.success('ບັນທຶກຂໍ້ມູນບໍລິສັດສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດບັນທຶກໄດ້')
  } finally {
    saving.value = false
  }
}

const removeInsurer = async () => {
  const accepted = await confirm({
    title: 'ລຶບບໍລິສັດປະກັນໄພ',
    message: `ຕ້ອງການລຶບ ${insurer.value?.nameLao || 'ບໍລິສັດນີ້'} ອອກຈາກລະບົບບໍ?`,
    confirmLabel: 'ລຶບ',
    tone: 'danger',
  })
  if (!accepted) return
  try {
    await remove(route.params.id)
    toast.success('ລຶບບໍລິສັດແລ້ວ')
    await navigateTo('/insurers')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດລຶບໄດ້')
  }
}

onMounted(load)
</script>
