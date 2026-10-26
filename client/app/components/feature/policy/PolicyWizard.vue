<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <Stepper v-if="currentStep < 5" :steps="steps" :current="currentStep" />

    <BaseCard>
      <div v-if="currentStep === 0" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">ຂໍ້ມູນຜູ້ເອົາປະກັນ</h2>
          <p class="mt-1 text-sm text-muted">ຂໍ້ມູນພື້ນຖານສຳລັບເຮັດປະກັນໄພ.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.customer.firstName"
            label="ຊື່"
            placeholder="ຊື່ແທ້"
            required
            :error="errors.firstName"
          />
          <BaseInput
            v-model="form.customer.lastName"
            label="ນາມສະກຸນ"
            placeholder="ນາມສະກຸນ"
            required
            :error="errors.lastName"
          />
          <BaseInput
            v-model="form.customer.phone"
            label="ເບີໂທ"
            placeholder="020 5555 1234"
            prefix-icon="phone"
            required
            :error="errors.phone"
          />
          <BaseInput v-model="form.customer.dob" type="date" label="ວັນເດືອນປີເກີດ" />
          <BaseSelect v-model="form.customer.gender" label="ເພດ" :options="GENDERS" />
          <BaseInput v-model="form.customer.occupation" label="ອາຊີບ" placeholder="ພະນັກງານ" />
        </div>
        <BaseTextarea
          v-model="form.customer.address"
          label="ທີ່ຢູ່"
          placeholder="ບ້ານ, ເມືອງ, ແຂວງ"
          :error="errors.address"
          required
        />
        <FileUpload
          v-model="form.customer.idCard"
          label="ບັດປະຊາຊົນ / ພາສປອດ"
          hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
        />
      </div>

      <div v-else-if="currentStep === 1" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">ຂໍ້ມູນລົດ</h2>
          <p class="mt-1 text-sm text-muted">ລາຍລະອຽດຂອງພາຫະນະທີ່ຈະຄຸ້ມຄອງ.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.vehicle.make"
            label="ຍີ່ຫໍ້"
            placeholder="Toyota"
            required
            :error="errors.make"
          />
          <BaseInput
            v-model="form.vehicle.model"
            label="ຮຸ່ນ"
            placeholder="Camry"
            required
            :error="errors.model"
          />
          <BaseInput
            v-model="form.vehicle.year"
            label="ປີ"
            type="number"
            placeholder="2024"
            :error="errors.year"
          />
          <BaseInput
            v-model="form.vehicle.plateNumber"
            label="ທະບຽນລົດ"
            placeholder="ກກ 1234"
            required
            :error="errors.plateNumber"
          />
          <BaseInput v-model="form.vehicle.engineNumber" label="ເລກຈັກ" placeholder="Engine no." />
          <BaseInput
            v-model="form.vehicle.chassisNumber"
            label="ເລກຖັງ"
            placeholder="Chassis no."
          />
          <BaseInput
            v-model="form.vehicle.engineCapacity"
            label="ຄວາມຈຸກະບອກສູບ (cc)"
            type="number"
            placeholder="2000"
            :error="errors.engineCapacity"
          />
          <BaseInput
            v-model="form.vehicle.seats"
            label="ຈຳນວນທີ່ນັ່ງ"
            type="number"
            placeholder="5"
          />
          <BaseSelect v-model="form.vehicle.usageType" label="ການໃຊ້ງານ" :options="USAGE_TYPES" />
        </div>
      </div>

      <div v-else-if="currentStep === 2" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">ເລືອກແຜນປະກັນໄພ</h2>
          <p class="mt-1 text-sm text-muted">ເລືອກບໍລິສັດ ແລະ ແຜນທີ່ເໝາະສົມ.</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="product in products"
            :key="product.id"
            type="button"
            class="rounded-xl border p-4 text-left transition-colors"
            :class="
              form.productId === product.id
                ? 'border-primary bg-primary/5'
                : 'border-line bg-surface hover:border-primary'
            "
            :aria-pressed="form.productId === product.id"
            @click="selectProduct(product)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold">{{ product.name }}</p>
                <p class="mt-0.5 text-xs text-muted">
                  {{ product.companyCode }} · {{ product.description }}
                </p>
              </div>
              <BaseIcon
                :name="form.productId === product.id ? 'check_circle' : 'radio_button_unchecked'"
                :class="form.productId === product.id ? 'text-primary-text' : 'text-muted'"
              />
            </div>
            <p class="mt-3 text-lg font-bold tabular-nums text-primary-text">
              {{ format.currency(product.basePremium) }}
            </p>
          </button>
        </div>
        <p v-if="errors.productId" class="text-xs font-bold text-danger" role="alert">
          {{ errors.productId }}
        </p>
      </div>

      <div v-else-if="currentStep === 3" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">ສະຫຼຸບ ແລະ ຢືນຢັນ</h2>
          <p class="mt-1 text-sm text-muted">ກວດສອບຂໍ້ມູນ ແລະ ການຄຳນວນເບ້ຍປະກັນ.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-line p-4">
            <p class="text-xs text-muted">ຜູ້ເອົາປະກັນ</p>
            <p class="mt-1 text-sm font-bold">{{ customerName }}</p>
            <p class="text-xs text-muted">{{ format.phone(form.customer.phone) }}</p>
          </div>
          <div class="rounded-xl border border-line p-4">
            <p class="text-xs text-muted">ລົດ</p>
            <p class="mt-1 text-sm font-bold">{{ form.vehicle.make }} {{ form.vehicle.model }}</p>
            <p class="text-xs text-muted">{{ form.vehicle.plateNumber }}</p>
          </div>
        </div>
        <BaseInput
          v-model.number="form.discountPercent"
          type="number"
          label="ສ່ວນຫຼຸດ (%)"
          min="0"
          max="100"
          suffix="%"
          :error="errors.discountPercent"
        />
        <dl class="space-y-3 rounded-xl border border-line p-4 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">ເບ້ຍພື້ນຖານ</dt>
            <dd class="font-bold tabular-nums">{{ format.currency(premium.basePremium) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">ສ່ວນຫຼຸດ</dt>
            <dd class="font-bold tabular-nums text-danger">
              -{{ format.currency(premium.discountAmount) }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">ອາກອນມູນຄ່າເພີ່ມ (7%)</dt>
            <dd class="font-bold tabular-nums">{{ format.currency(premium.vatAmount) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">ຄ່າທະບຽນ</dt>
            <dd class="font-bold tabular-nums">{{ format.currency(premium.registrationFee) }}</dd>
          </div>
          <div class="flex justify-between gap-4 border-t border-line pt-3 text-base">
            <dt class="font-bold">ລວມທັງໝົດ</dt>
            <dd class="font-bold tabular-nums text-primary-text">
              {{ format.currency(premium.totalPremium) }}
            </dd>
          </div>
        </dl>
      </div>

      <div v-else-if="currentStep === 4" class="space-y-4">
        <div>
          <h2 class="text-lg font-bold">ຊຳລະເງິນ</h2>
          <p class="mt-1 text-sm text-muted">ນີ້ເປັນການຊຳລະ mock ສຳລັບການທົດສອບ.</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ຍອດທີ່ຕ້ອງຊຳລະ</p>
          <p class="mt-1 text-3xl font-bold tabular-nums text-primary-text">
            {{ format.currency(premium.totalPremium) }}
          </p>
        </div>
        <div class="space-y-2">
          <BaseRadio
            v-for="method in PAYMENT_METHODS"
            :key="method.value"
            v-model="form.paymentMethod"
            :value="method.value"
            name="payment-method"
            :label="method.label"
          />
        </div>
        <p v-if="errors.paymentMethod" class="text-xs font-bold text-danger" role="alert">
          {{ errors.paymentMethod }}
        </p>
      </div>

      <div v-else class="space-y-4 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
        >
          <BaseIcon name="check_circle" size="2xl" />
        </div>
        <div>
          <h2 class="text-2xl font-bold">ເຮັດປະກັນໄພສຳເລັດ</h2>
          <p class="mt-1 text-sm text-muted">ປະກັນໄພຖືກສ້າງໃນສະຖານະລໍຖ້າກວດສອບ.</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ເລກປະກັນໄພ</p>
          <p class="mt-1 text-xl font-bold">{{ createdPolicy?.policyNumber }}</p>
          <StatusBadge class="mt-2" :status="createdPolicy?.status || 'pending'" />
        </div>
        <div class="flex flex-col justify-center gap-2 sm:flex-row">
          <BaseButton
            variant="secondary"
            icon="download"
            @click="toast.info('ກຳລັງກະກຽມເອກະສານ (mock)')"
          >
            ດາວໂຫຼດ
          </BaseButton>
          <BaseButton icon="visibility" @click="navigateTo(`/policies/${createdPolicy?.id}`)">
            ເບິ່ງປະກັນໄພ
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <div
      v-if="currentStep < 5"
      class="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] -mx-4 z-30 flex items-center justify-between gap-3 border-t border-line bg-surface/95 p-4 backdrop-blur md:static md:bottom-auto md:mx-0 md:rounded-xl md:border md:p-4"
    >
      <BaseButton v-if="currentStep > 0" variant="secondary" icon="arrow_back" @click="prevStep">
        ກັບຄືນ
      </BaseButton>
      <span v-else class="text-sm text-muted">ຂັ້ນຕອນ {{ currentStep + 1 }} / 5</span>

      <BaseButton v-if="currentStep < 4" icon="arrow_forward" @click="nextStep"> ຕໍ່ໄປ </BaseButton>
      <BaseButton v-else icon="payment" :loading="submitting" @click="submit">
        ຊຳລະ ແລະ ຢືນຢັນ
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { navigateTo } from '#app'
import { onBeforeRouteLeave } from 'vue-router'
import { GENDERS, PAYMENT_METHODS, USAGE_TYPES } from '~/utils/constants'
import { calculatePremium } from '~/utils/premium'
import { usePolicies } from '~/composables/api/usePolicies'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'
import { companies } from '~/mocks/companies'
import { products } from '~/mocks/products'
import {
  maxValue,
  minValue,
  numeric,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

const DRAFT_KEY = 'saiyfon-policy-draft'

const format = useFormat()
const toast = useToast()
const auth = useAuthStore()
const { confirm } = useConfirm()
const { create } = usePolicies({ immediate: false })

const steps = [
  { label: 'ຜູ້ເອົາປະກັນ', description: 'ຂໍ້ມູນລູກຄ້າ' },
  { label: 'ຂໍ້ມູນລົດ', description: 'ລາຍລະອຽດລົດ' },
  { label: 'ແຜນປະກັນ', description: 'ເລືອກແຜນ' },
  { label: 'ສະຫຼຸບ', description: 'ກວດສອບ' },
  { label: 'ຊຳລະ', description: 'ຊຳລະເງິນ' },
]

const currentStep = ref(0)
const submitting = ref(false)
const completed = ref(false)
const createdPolicy = ref(null)

const form = reactive({
  customer: {
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: 'male',
    occupation: '',
    address: '',
    idCard: null,
  },
  vehicle: {
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    engineNumber: '',
    chassisNumber: '',
    engineCapacity: '',
    seats: '',
    usageType: 'private',
  },
  productId: null,
  discountPercent: 0,
  paymentMethod: 'bcel',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  make: '',
  model: '',
  plateNumber: '',
  year: '',
  engineCapacity: '',
  productId: '',
  discountPercent: '',
  paymentMethod: '',
})

const customerName = computed(() => `${form.customer.firstName} ${form.customer.lastName}`.trim())

const selectedProduct = computed(() =>
  products.find((product) => product.id === Number(form.productId)),
)

const premium = computed(() =>
  calculatePremium({
    basePremium: selectedProduct.value?.basePremium || 0,
    discountPercent: form.discountPercent,
  }),
)

const selectProduct = (product) => {
  form.productId = product.id
  errors.productId = ''
}

const clearErrors = (keys) => {
  keys.forEach((key) => {
    errors[key] = ''
  })
}

const validateStep = () => {
  if (currentStep.value === 0) {
    clearErrors(['firstName', 'lastName', 'phone', 'address'])
    errors.firstName = required(form.customer.firstName)
    errors.lastName = required(form.customer.lastName)
    errors.phone = validate(form.customer.phone, [required, phoneValidator])
    errors.address = required(form.customer.address)
    return !errors.firstName && !errors.lastName && !errors.phone && !errors.address
  }

  if (currentStep.value === 1) {
    clearErrors(['make', 'model', 'plateNumber', 'year', 'engineCapacity'])
    errors.make = required(form.vehicle.make)
    errors.model = required(form.vehicle.model)
    errors.plateNumber = required(form.vehicle.plateNumber)
    errors.year = form.vehicle.year
      ? validate(form.vehicle.year, [numeric, minValue(1900), maxValue(2100)])
      : ''
    errors.engineCapacity = form.vehicle.engineCapacity ? numeric(form.vehicle.engineCapacity) : ''
    return (
      !errors.make && !errors.model && !errors.plateNumber && !errors.year && !errors.engineCapacity
    )
  }

  if (currentStep.value === 2) {
    errors.productId = form.productId ? '' : 'ກະລຸນາເລືອກແຜນປະກັນໄພ'
    return !errors.productId
  }

  if (currentStep.value === 3) {
    errors.discountPercent = validate(form.discountPercent, [numeric, minValue(0), maxValue(100)])
    return !errors.discountPercent
  }

  if (currentStep.value === 4) {
    errors.paymentMethod = form.paymentMethod ? '' : 'ກະລຸນາເລືອກວິທີຊຳລະ'
    return !errors.paymentMethod
  }

  return true
}

const nextStep = () => {
  if (!validateStep()) return
  if (currentStep.value < 4) currentStep.value += 1
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value -= 1
}

const addYear = (date, years) => {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + years)
  return next.toISOString().slice(0, 10)
}

const submit = async () => {
  if (!validateStep() || submitting.value) return
  submitting.value = true
  try {
    const today = new Date().toISOString().slice(0, 10)
    const company = companies.find((item) => item.code === selectedProduct.value.companyCode)
    const payload = {
      customerId: 0,
      customerName: customerName.value,
      customerPhone: form.customer.phone,
      agentId: auth.role === 'agent' ? 1 : null,
      agentName: auth.displayName,
      companyCode: selectedProduct.value.companyCode,
      companyName: company?.name || selectedProduct.value.companyCode,
      productType: selectedProduct.value.type,
      productName: selectedProduct.value.name,
      vehiclePlate: form.vehicle.plateNumber,
      startDate: today,
      endDate: addYear(today, 1),
      netPremium: premium.value.netPremium,
      vatAmount: premium.value.vatAmount,
      registrationFee: premium.value.registrationFee,
      totalPremium: premium.value.totalPremium,
      status: 'pending',
    }
    createdPolicy.value = await create(payload)
    completed.value = true
    currentStep.value = 5
    clearDraft()
    toast.success('ເຮັດປະກັນໄພສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງປະກັນໄພໄດ້')
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  if (!import.meta.client || completed.value) return
  try {
    const draft = {
      ...form,
      customer: { ...form.customer, idCard: null },
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Draft is best-effort only.
  }
}

const restoreDraft = () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    Object.assign(form, draft)
    form.customer.idCard = null
    toast.info('ກູ້ຄືນຮ່າງທີ່ບັນທຶກໄວ້')
  } catch {
    // Ignore malformed drafts.
  }
}

const clearDraft = () => {
  if (!import.meta.client) return
  localStorage.removeItem(DRAFT_KEY)
}

onMounted(restoreDraft)
onBeforeUnmount(saveDraft)

onBeforeRouteLeave(async () => {
  if (completed.value) return true
  return confirm({
    title: 'ອອກຈາກການເຮັດປະກັນໄພ?',
    message: 'ຂໍ້ມູນທີ່ປ້ອນໄວ້ຈະຖືກບັນທຶກເປັນຮ່າງ. ຕ້ອງການອອກບໍ່?',
    confirmLabel: 'ອອກ',
  })
})
</script>
