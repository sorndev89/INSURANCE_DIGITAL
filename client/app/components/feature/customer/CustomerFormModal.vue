<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າ' : 'ເພີ່ມລູກຄ້າໃໝ່'"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
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
      <BaseInput v-model="form.dob" type="date" label="ວັນເດືອນປີເກີດ" />
      <BaseInput v-model="form.occupation" label="ອາຊີບ" />
      <BaseSelect v-if="isEdit" v-model="form.status" label="ສະຖານະ" :options="STATUS_OPTIONS" />
    </div>
    <BaseTextarea
      v-model="form.address"
      label="ທີ່ຢູ່"
      class="mt-4"
      placeholder="ບ້ານ, ເມືອງ, ແຂວງ"
    />
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
import { GENDERS } from '~/utils/constants'
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
  { value: 'active', label: 'ມີຜົນ' },
  { value: 'inactive', label: 'ປິດໃຊ້ງານ' },
]

const blankForm = () => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  gender: 'male',
  dob: '',
  occupation: '',
  address: '',
  status: 'active',
})

const form = reactive(blankForm())
const errors = reactive({ firstName: '', lastName: '', phone: '', email: '' })

const fillForm = () => {
  const source = props.customer || {}
  Object.assign(form, blankForm(), {
    firstName: source.firstName || '',
    lastName: source.lastName || '',
    phone: source.phone || '',
    email: source.email || '',
    gender: source.gender || 'male',
    dob: source.dob || '',
    occupation: source.occupation || '',
    address: source.address || '',
    status: source.status || 'active',
  })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

watch(
  () => [props.modelValue, props.customer],
  ([open]) => {
    if (open) fillForm()
  },
  { immediate: true },
)

const validateForm = () => {
  errors.firstName = required(form.firstName)
  errors.lastName = required(form.lastName)
  errors.phone = validate(form.phone, [required, phoneValidator])
  errors.email = form.email ? emailValidator(form.email) : ''
  return !Object.values(errors).some(Boolean)
}

const save = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dob: form.dob,
      occupation: form.occupation,
      address: form.address,
      status: form.status,
    }
    const saved = isEdit.value ? await update(props.customer.id, payload) : await create(payload)
    emit('saved', saved)
    emit('update:modelValue', false)
    toast.success(isEdit.value ? 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ' : 'ເພີ່ມລູກຄ້າສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນລູກຄ້າໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
