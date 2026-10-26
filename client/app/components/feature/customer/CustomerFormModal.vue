<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າ' : 'ເພີ່ມລູກຄ້າໃໝ່ (Customer KYC)'"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- ເລືອກປະເພດລູກຄ້າ -->
      <div class="flex items-center justify-between border-b border-line pb-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted">ປະເພດລູກຄ້າ:</label>
        <BaseSelect v-model="form.customerType" label="" :options="CUSTOMER_TYPES" class="w-64" />
      </div>

      <!-- ຟອມບຸກຄົນທົ່ວໄປ -->
      <div v-if="form.customerType === 'individual'" class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.firstName" label="ຊື່ແທ້" required :error="errors.firstName" />
        <BaseInput v-model="form.lastName" label="ນາມສະກຸນ" required :error="errors.lastName" />
        <BaseInput
          v-model="form.phone"
          label="ເບີໂທລະສັບ"
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
        <BaseInput
          v-model="form.idCardNumber"
          label="ເລກບັດປະຈຳຕົວ / ພາສປອດ"
          placeholder="01-..."
        />
        <BaseSelect v-model="form.gender" label="ເພດ" :options="GENDERS" />
        <BaseInput v-model="form.dob" type="date" label="ວັນເດືອນປີເກີດ" />
        <BaseInput v-model="form.occupation" label="ອາຊີບ" placeholder="ພະນັກງານ" />
      </div>

      <!-- ຟອມນິຕິບຸກຄົນ / ບໍລິສັດ -->
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <BaseInput
          v-model="form.companyName"
          label="ຊື່ບໍລິສັດ / ອົງກອນ"
          placeholder="ບໍລິສັດ ພັດທະນາ ຈຳກັດ"
          required
          :error="errors.companyName"
        />
        <BaseInput
          v-model="form.taxId"
          label="ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ (Tax ID)"
          placeholder="0101234567"
          required
          :error="errors.taxId"
        />
        <BaseInput
          v-model="form.contactPerson"
          label="ຊື່ຜູ້ຕິດຕໍ່ປະສານງານ"
          placeholder="ທ່ານ ວິໄລ"
          required
          :error="errors.contactPerson"
        />
        <BaseInput
          v-model="form.phone"
          label="ເບີໂທລະສັບຕິດຕໍ່"
          prefix-icon="phone"
          required
          :error="errors.phone"
        />
        <BaseInput
          v-model="form.email"
          type="email"
          label="ອີເມວບໍລິສັດ"
          prefix-icon="mail"
          :error="errors.email"
        />
        <BaseSelect v-if="isEdit" v-model="form.status" label="ສະຖານະ" :options="STATUS_OPTIONS" />
      </div>

      <!-- ທີ່ຢູ່ -->
      <BaseTextarea v-model="form.address" label="ທີ່ຢູ່ປະຈຸບັນ" placeholder="ບ້ານ, ເມືອງ, ແຂວງ" />

      <div v-if="isEdit && form.customerType === 'individual'" class="grid gap-4 sm:grid-cols-2">
        <BaseSelect v-model="form.status" label="ສະຖານະ" :options="STATUS_OPTIONS" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
          ຍົກເລີກ
        </BaseButton>
        <BaseButton icon="save" :loading="saving" @click="save">ບັນທຶກ</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useCustomers } from '~/composables/api/useCustomers'
import { useToast } from '~/composables/useToast'
import { CUSTOMER_TYPES, GENDERS } from '~/utils/constants'
import {
  email as emailValidator,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  customer: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const { create, update } = useCustomers({ immediate: false })
const saving = ref(false)
const isEdit = computed(() => Boolean(props.customer?.id))

const STATUS_OPTIONS = [
  { value: 'active', label: 'ມີຜົນ (Active)' },
  { value: 'inactive', label: 'ປິດໃຊ້ງານ (Inactive)' },
]

const blankForm = () => ({
  customerType: 'individual',
  firstName: '',
  lastName: '',
  companyName: '',
  taxId: '',
  contactPerson: '',
  phone: '',
  email: '',
  idCardNumber: '',
  gender: 'male',
  dob: '',
  occupation: '',
  address: '',
  status: 'active',
})

const form = reactive(blankForm())
const errors = reactive({
  firstName: '',
  lastName: '',
  companyName: '',
  taxId: '',
  contactPerson: '',
  phone: '',
  email: '',
})

const fillForm = () => {
  const source = props.customer || {}
  Object.assign(form, blankForm(), {
    customerType: source.customerType || (source.companyName ? 'corporate' : 'individual'),
    firstName: source.firstName || '',
    lastName: source.lastName || '',
    companyName: source.companyName || source.fullName || '',
    taxId: source.taxId || '',
    contactPerson: source.contactPerson || '',
    phone: source.phone || '',
    email: source.email || '',
    idCardNumber: source.idCardNumber || '',
    gender: source.gender || 'male',
    dob: source.dob || '',
    occupation: source.occupation || '',
    address: source.address || '',
    status: source.status || 'active',
  })
}

watch(() => props.customer, fillForm, { immediate: true })
watch(
  () => props.modelValue,
  (open) => {
    if (open) fillForm()
  },
)

const save = async () => {
  errors.phone = validate(form.phone, [required, phoneValidator])
  if (form.email) errors.email = emailValidator(form.email)

  if (form.customerType === 'corporate') {
    errors.companyName = required(form.companyName)
    errors.taxId = required(form.taxId)
    errors.contactPerson = required(form.contactPerson)
    errors.firstName = ''
    errors.lastName = ''
  } else {
    errors.firstName = required(form.firstName)
    errors.lastName = required(form.lastName)
    errors.companyName = ''
    errors.taxId = ''
    errors.contactPerson = ''
  }

  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    const payload = {
      ...form,
      fullName:
        form.customerType === 'corporate'
          ? form.companyName
          : `${form.firstName} ${form.lastName}`.trim(),
    }
    if (isEdit.value) {
      await update(props.customer.id, payload)
      toast.success('ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ')
    } else {
      await create(payload)
      toast.success('ເພີ່ມລູກຄ້າໃໝ່ສຳເລັດ')
    }
    emit('update:modelValue', false)
    emit('saved')
  } catch (err) {
    toast.error(err?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນລູກຄ້າໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
