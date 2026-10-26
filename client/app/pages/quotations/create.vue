<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <PageHeader
      title="ສ້າງໃບສະເໜີລາຄາ ແລະ ປຽບທຽບແຜນ"
      description="ປ້ອນຂໍ້ມູນຄວາມຕ້ອງການ ແລະ ສ້າງຕາຕະລາງປຽບທຽບແຜນຈາກຫຼາຍບໍລິສັດປະກັນໄພ (Multi-Insurer Comparison)."
    />

    <form class="space-y-6" @submit.prevent="submit">
      <!-- 1. ຂໍ້ມູນລູກຄ້າ ແລະ ຕົວແທນ -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold">1. ຂໍ້ມູນລູກຄ້າ ແລະ ຕົວແທນຜູ້ດູແລ</h2>
            <span class="text-xs font-semibold text-muted">Customer & Agent</span>
          </div>
        </template>
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-3">
            <BaseSelect v-model="form.customerType" label="ປະເພດລູກຄ້າ" :options="CUSTOMER_TYPES" />
            <BaseInput
              v-model="form.customerName"
              :label="
                form.customerType === 'corporate' ? 'ຊື່ບໍລິສັດ / ອົງກອນ' : 'ຊື່ ແລະ ນາມສະກຸນລູກຄ້າ'
              "
              :placeholder="
                form.customerType === 'corporate' ? 'ບໍລິສັດ ພັດທະນາ ຈຳກັດ' : 'ສົມສັກ ບຸນທະວີ'
              "
              required
              :error="errors.customerName"
            />
            <BaseInput
              v-model="form.customerPhone"
              label="ເບີໂທລະສັບ / WhatsApp"
              placeholder="020 5555 1234"
              prefix-icon="phone"
              required
              :error="errors.customerPhone"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <BaseInput
              v-if="form.customerType === 'corporate'"
              v-model="form.taxId"
              label="ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ (Tax ID)"
              placeholder="0101234567"
            />
            <BaseInput
              v-model="form.customerEmail"
              type="email"
              label="ອີເມວ (ຮັບໃບສະເໜີລາຄາ)"
              placeholder="client@example.la"
            />
            <BaseSelect
              v-model="form.agentId"
              label="ຕົວແທນຂາຍຜູ້ຮັບຜິດຊອບ"
              :options="agentOptions"
            />
          </div>
        </div>
      </BaseCard>

      <!-- 2. ໝວດໝູ່ປະກັນໄພ ແລະ ລາຍລະອຽດຊັບສິນ -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold">2. ປະເພດປະກັນໄພ ແລະ ລາຍລະອຽດຊັບສິນ</h2>
            <span class="text-xs font-semibold text-muted">Risk Subject / Asset</span>
          </div>
        </template>
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <BaseSelect
              v-model="form.productType"
              label="ໝວດປະກັນໄພ"
              :options="PRODUCT_TYPES"
              required
            />
            <BaseInput
              v-model="form.validUntil"
              type="date"
              label="ໃບສະເໜີລາຄານີ້ໃຊ້ໄດ້ຮອດວັນທີ"
              required
              :error="errors.validUntil"
            />
          </div>

          <!-- ກໍລະນີປະກັນລົດຍົນ -->
          <div
            v-if="form.productType === 'Motor'"
            class="rounded-xl border border-line bg-surface-muted p-4 space-y-4"
          >
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              ຂໍ້ມູນພາຫະນະ (ລົດຍົນ)
            </h3>
            <div class="grid gap-4 sm:grid-cols-4">
              <BaseInput v-model="form.vehicle.make" label="ຍີ່ຫໍ້ລົດ" placeholder="Toyota" />
              <BaseInput v-model="form.vehicle.model" label="ຮຸ່ນລົດ" placeholder="Fortuner" />
              <BaseInput
                v-model="form.vehicle.year"
                type="number"
                label="ປີຜະລິດ"
                placeholder="2023"
              />
              <BaseInput
                v-model="form.vehicle.plateNumber"
                label="ທະບຽນລົດ (ຖ້າມີ)"
                placeholder="ກກ 9999"
              />
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 3. ຕາຕະລາງປຽບທຽບແຜນຈາກຫຼາຍບໍລິສັດປະກັນໄພ (Multi-Carrier Options) -->
      <BaseCard>
        <template #header>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-base font-bold">3. ຕົວເລືອກປຽບທຽບແຜນ (Comparison Options)</h2>
              <p class="text-xs text-muted">
                ເລືອກ 2-3 ບໍລິສັດປະກັນໄພ ເພື່ອປຽບທຽບຄວາມຄຸ້ມຄອງ ແລະ ເບ້ຍປະກັນໃຫ້ລູກຄ້າເລືອກ
              </p>
            </div>
            <BaseButton type="button" variant="secondary" size="sm" icon="add" @click="addOption">
              ເພີ່ມຕົວເລືອກປຽບທຽບ
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <div
            v-for="(option, index) in form.options"
            :key="option.id"
            class="relative rounded-xl border border-line p-5 transition-all"
            :class="
              option.isRecommended
                ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                : 'bg-surface'
            "
          >
            <div class="flex items-center justify-between pb-3 border-b border-line">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-text"
                >
                  #{{ index + 1 }}
                </span>
                <span class="text-sm font-bold">ແຜນຕົວເລືອກທີ່ {{ index + 1 }}</span>
                <label class="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                  <input
                    v-model="option.isRecommended"
                    type="checkbox"
                    class="rounded border-line text-primary focus:ring-primary"
                  />
                  <span class="font-semibold text-primary-text">ແນະນຳໃຫ້ລູກຄ້າ (Recommended)</span>
                </label>
              </div>
              <button
                v-if="form.options.length > 1"
                type="button"
                class="text-xs text-danger hover:underline"
                @click="removeOption(index)"
              >
                ລຶບຕົວເລືອກນີ້
              </button>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-3">
              <BaseSelect
                v-model="option.companyId"
                label="ບໍລິສັດປະກັນໄພ (Insurer)"
                :options="companyOptions"
                required
                @update:model-value="onCompanyChange(option)"
              />
              <BaseInput
                v-model="option.planName"
                label="ຊື່ແຜນ / ຊັ້ນປະກັນ"
                placeholder="ເຊັ່ນ: ຊັ້ນ 1 ຄົບວົງຈອນ"
                required
              />
              <BaseInput
                v-model.number="option.sumInsured"
                type="number"
                label="ທຶນປະກັນ / ວົງເງິນຄຸ້ມຄອງ (₭)"
                placeholder="150,000,000"
              />
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-4">
              <BaseInput
                v-model.number="option.basePremium"
                type="number"
                label="ເບ້ຍປະກັນພື້ນຖານ (₭)"
                required
                @input="calculateOption(option)"
              />
              <BaseInput
                v-model.number="option.discountPercent"
                type="number"
                label="ສ່ວນຫຼຸດ Broker (%)"
                placeholder="0"
                min="0"
                max="100"
                @input="calculateOption(option)"
              />
              <BaseInput
                v-model.number="option.deductible"
                type="number"
                label="ຄ່າເສຍຫາຍສ່ວນທຳອິດ (₭)"
                placeholder="0"
              />
              <div class="rounded-xl border border-line bg-surface-muted p-2.5">
                <span class="text-xs text-muted">ເບ້ຍສຸດທິລູກຄ້າຈ່າຍ:</span>
                <p class="text-base font-bold text-primary-text tabular-nums">
                  {{ format.currency(option.totalPremium || option.basePremium) }}
                </p>
              </div>
            </div>

            <div class="mt-4">
              <BaseInput
                v-model="option.highlights"
                label="ຈຸດເດັ່ນຄວາມຄຸ້ມຄອງ / ເງື່ອນໄຂພິເສດ"
                placeholder="ເຊັ່ນ: ລົດລາກຟຣີ 24 ຊມ, ສ້ອມແປງສູນທາງການ, ຄຸ້ມຄອງໄຟໄໝ້ ແລະ ນ້ຳຖ້ວມ 100%"
              />
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 4. ໝາຍເຫດ ແລະ ປຸ່ມບັນທຶກ -->
      <BaseCard>
        <BaseTextarea
          v-model="form.note"
          label="ໝາຍເຫດເພີ່ມເຕີມສຳລັບລູກຄ້າ"
          placeholder="ເງື່ອນໄຂການຊຳລະ, ເວລາອອກກົມມະທັນ, ຫຼື ຄຳແນະນຳອື່ນໆ..."
        />

        <div class="mt-6 flex justify-end gap-3 border-t border-line pt-4">
          <BaseButton variant="secondary" @click="router.back()">ຍົກເລີກ</BaseButton>
          <BaseButton type="submit" icon="save" :loading="saving">
            ບັນທຶກໃບສະເໜີລາຄາປຽບທຽບ
          </BaseButton>
        </div>
      </BaseCard>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { navigateTo, useRouter } from '#app'
import { useQuotations } from '~/composables/api/useQuotations'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { CUSTOMER_TYPES, PRODUCT_TYPES } from '~/utils/constants'
import { companies } from '~/mocks/companies'
import { agents } from '~/mocks/agents'
import { products } from '~/mocks/products'
import { calculatePremium } from '~/utils/premium'
import { required } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ສ້າງໃບສະເໜີລາຄາປຽບທຽບ (Broker)',
  permission: 'quotation.create',
})

const router = useRouter()
const toast = useToast()
const format = useFormat()
const { create } = useQuotations({ immediate: false })

const saving = ref(false)

const companyOptions = companies.map((c) => ({
  value: c.id,
  label: `${c.code} - ${c.name}`,
}))

const agentOptions = agents.map((a) => {
  const code = a.agentCode || a.code || ''
  const name = a.name || a.agentName || 'ຕົວແທນ'
  return {
    value: a.id,
    label: code ? `${code} - ${name}` : name,
  }
})

// ວັນໝົດອາຍຸໃບສະເໜີລາຄາເລີ່ມຕົ້ນ (15 ວັນຈາກມື້ນີ້)
const defaultValidDate = new Date()
defaultValidDate.setDate(defaultValidDate.getDate() + 15)
const defaultValidIso = defaultValidDate.toISOString().slice(0, 10)

const form = reactive({
  customerType: 'individual',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  taxId: '',
  agentId: agents[0]?.id || 1,
  productType: 'Motor',
  validUntil: defaultValidIso,
  vehicle: {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
  },
  options: [
    {
      id: 1,
      companyId: 1,
      planName: 'ລົດຍົນ ຊັ້ນ 1 (Gold)',
      sumInsured: 150000000,
      deductible: 0,
      basePremium: 2500000,
      discountPercent: 5,
      totalPremium: 2548500,
      highlights: 'ຄຸ້ມຄອງຄົບວົງຈອນ ລົດຊົນ, ລົດຫາຍ, ໄຟໄໝ້, ລົດລາກຟຣີ 24 ຊມ',
      isRecommended: true,
    },
    {
      id: 2,
      companyId: 2,
      planName: 'ລົດຍົນ ຊັ້ນ 1 (Platinum)',
      sumInsured: 140000000,
      deductible: 200000,
      basePremium: 2350000,
      discountPercent: 0,
      totalPremium: 2534500,
      highlights: 'ອູ່ສ້ອມແປງມາດຕະຖານສູງ, ເຄມໄວຜ່ານແອັບ',
      isRecommended: false,
    },
  ],
  note: '',
})

const errors = reactive({
  customerName: '',
  customerPhone: '',
  validUntil: '',
})

let nextOptionId = 3

const addOption = () => {
  form.options.push({
    id: nextOptionId++,
    companyId: 3,
    planName: 'ແຜນປະກັນໄພ',
    sumInsured: 100000000,
    deductible: 0,
    basePremium: 2000000,
    discountPercent: 0,
    totalPremium: 2160000,
    highlights: '',
    isRecommended: false,
  })
}

const removeOption = (index) => {
  if (form.options.length > 1) {
    form.options.splice(index, 1)
  }
}

const onCompanyChange = (option) => {
  const match = products.find(
    (p) => p.companyId === option.companyId && p.type === form.productType,
  )
  if (match) {
    option.planName = match.name
    option.basePremium = match.basePremium
    option.sumInsured = match.sumInsured || 100000000
    option.deductible = match.deductible || 0
    calculateOption(option)
  }
}

const calculateOption = (option) => {
  const calc = calculatePremium({
    basePremium: option.basePremium || 0,
    discountPercent: option.discountPercent || 0,
  })
  option.totalPremium = calc.totalPremium
}

const submit = async () => {
  errors.customerName = required(form.customerName)
  errors.customerPhone = required(form.customerPhone)
  errors.validUntil = required(form.validUntil)

  if (Object.values(errors).some(Boolean)) {
    toast.error('ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ')
    return
  }

  saving.value = true
  try {
    // ຄຳນວນເບ້ຍສຳລັບລາຍການທີ່ແນະນຳ ຫຼື option ທຳອິດ
    const primaryOption = form.options.find((o) => o.isRecommended) || form.options[0]
    const selectedCompany = companies.find((c) => c.id === primaryOption.companyId)

    await create({
      customerType: form.customerType,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      taxId: form.taxId,
      agentId: form.agentId,
      productType: form.productType,
      productName: primaryOption.planName,
      premium: primaryOption.totalPremium,
      companyId: primaryOption.companyId,
      companyName: selectedCompany?.name || 'ບໍລິສັດປະກັນໄພ',
      validUntil: form.validUntil,
      vehicle: form.vehicle,
      options: form.options,
      note: form.note,
    })

    toast.success('ສ້າງໃບສະເໜີລາຄາປຽບທຽບສຳເລັດ')
    await navigateTo('/quotations')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງໃບສະເໜີລາຄາໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
