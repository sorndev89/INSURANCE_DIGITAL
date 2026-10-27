<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div class="flex flex-col items-center gap-2 text-center">
        <div class="relative">
          <button
            type="button"
            class="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary-light text-2xl font-bold text-primary-text shadow-card transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :aria-label="currentAvatar ? 'ປ່ຽນຮູບໂປຣໄຟລ໌' : 'ເລືອກຮູບໂປຣໄຟລ໌'"
            @click="openAvatarPicker"
          >
            <img
              v-if="currentAvatar"
              :src="currentAvatar"
              alt="ຮູບໂປຣໄຟລ໌"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ avatarInitials }}</span>
            <span
              class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <BaseIcon name="photo_camera" size="lg" />
            </span>
          </button>
          <button
            v-if="currentAvatar"
            type="button"
            class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-danger shadow-card transition hover:bg-danger/10"
            aria-label="ລຶບຮູບໂປຣໄຟລ໌"
            @click="clearAvatar"
          >
            <BaseIcon name="close" size="sm" />
          </button>
          <span
            class="pointer-events-none absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white ring-4 ring-surface"
            aria-hidden="true"
          >
            <BaseIcon name="photo_camera" size="sm" />
          </span>
        </div>
        <div>
          <p class="text-sm font-bold">ຮູບໂປຣໄຟລ໌</p>
          <p class="mt-0.5 text-xs text-muted">
            ກົດທີ່ຮູບເພື່ອເລືອກ · ຮູບຈະຖືກຫຍໍ້ອັດຕະໂນມັດ ແລະ ເກັບໃນຖານຂໍ້ມູນ
          </p>
        </div>
        <p v-if="avatarError" class="text-xs font-bold text-danger">{{ avatarError }}</p>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="sr-only"
          @change="handleAvatarChange"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput
          v-model="form.name"
          label="ຊື່ ແລະ ນາມສະກຸນ"
          required
          maxlength="255"
          :error="errors.name"
        />
        <BaseInput
          v-model="form.username"
          label="ຊື່ເຂົ້າໃຊ້"
          required
          autocomplete="username"
          maxlength="255"
          :error="errors.username"
        />
        <BaseInput
          v-model="form.email"
          type="email"
          label="ອີເມວ"
          required
          autocomplete="email"
          maxlength="255"
          :error="errors.email"
        />
        <BaseInput
          v-model="form.phone"
          label="ເບີໂທ"
          prefix-icon="phone"
          autocomplete="tel"
          maxlength="20"
          :error="errors.phone"
        />
        <BaseInput
          v-model="form.password"
          type="password"
          :label="isEdit ? 'ລະຫັດຜ່ານໃໝ່' : 'ລະຫັດຜ່ານ'"
          :hint="isEdit ? 'ປ່ອຍວ່າງ ຖ້າບໍ່ຕ້ອງການປ່ຽນ' : 'ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ'"
          :required="!isEdit"
          autocomplete="new-password"
          maxlength="128"
          :error="errors.password"
        />
        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="ຢືນຢັນລະຫັດຜ່ານ"
          autocomplete="new-password"
          maxlength="128"
          :error="errors.confirmPassword"
        />
        <BaseSelect
          v-model="form.role"
          label="ບົດບາດ"
          :options="roleChoices"
          :disabled="isSelf"
          :hint="isSelf ? 'ບໍ່ສາມາດປ່ຽນບົດບາດຂອງຕົນເອງໄດ້' : ''"
        />
        <BaseSelect
          v-model="form.status"
          label="ສະຖານະ"
          :options="STATUS_OPTIONS"
          :disabled="isSelf"
          :hint="isSelf ? 'ບໍ່ສາມາດປິດໃຊ້ບັນຊີຂອງຕົນເອງໄດ້' : ''"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
          ຍົກເລີກ
        </BaseButton>
        <BaseButton icon="save" :loading="saving" @click="save">
          {{ isEdit ? 'ບັນທຶກ' : 'ສ້າງຜູ້ໃຊ້' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useUsers } from '~/composables/api/useUsers'
import { useRoleOptions } from '~/composables/api/useRoles'
import { useToast } from '~/composables/useToast'
import { ROLES } from '~/utils/constants'
import { AVATAR_MAX_INPUT_BYTES, fileToAvatarDataUrl } from '~/utils/image'
import {
  email as emailValidator,
  minLength,
  phone as phoneValidator,
  required,
} from '~/utils/validators'
import { messageFrom } from '~/utils/apiError'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  currentUserId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const { create, update } = useUsers({ immediate: false })
const { items: roleOptions, refresh: refreshRoles } = useRoleOptions({ immediate: false })
const saving = ref(false)
const fileInput = ref(null)
const avatarError = ref('')

const STATUS_OPTIONS = [
  { value: 'active', label: 'ໃຊ້ງານ' },
  { value: 'inactive', label: 'ປິດໃຊ້' },
  { value: 'suspended', label: 'ລະງັບ' },
]

const roleChoices = computed(() => {
  if (!roleOptions.value.length) return ROLES
  return roleOptions.value.map((role) => ({ value: role.key, label: role.name }))
})

const isEdit = computed(() => Boolean(props.user?.id))
const isSelf = computed(
  () => isEdit.value && String(props.user?.id) === String(props.currentUserId),
)
const currentAvatar = computed(() => form.avatar || '')
const avatarInitials = computed(() => {
  const value = (form.name || form.username || '').trim()
  if (!value) return '?'
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const blankForm = () => ({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'staff',
  status: 'active',
  avatar: '',
})

const form = reactive(blankForm())
const errors = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
})

const fillForm = () => {
  const source = props.user || {}
  Object.assign(form, blankForm(), {
    name: source.name || '',
    username: source.username || '',
    email: source.email || '',
    phone: source.phone || '',
    role: source.role || 'staff',
    status: source.status || 'active',
    avatar: source.avatar || '',
  })
  avatarError.value = ''
  if (fileInput.value) fileInput.value.value = ''
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const openAvatarPicker = () => fileInput.value?.click()

const clearAvatar = () => {
  form.avatar = ''
  avatarError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  avatarError.value = ''
  if (!file) return

  if (!String(file.type || '').startsWith('image/')) {
    avatarError.value = 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ'
    event.target.value = ''
    return
  }
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    avatarError.value = 'ໄຟລ໌ໃຫຍ່ເກີນ 5 MB'
    event.target.value = ''
    return
  }

  try {
    form.avatar = await fileToAvatarDataUrl(file)
  } catch {
    avatarError.value = 'ບໍ່ສາມາດປະມວນຜົນຮູບນີ້ໄດ້'
  } finally {
    event.target.value = ''
  }
}

watch(() => props.user, fillForm, { immediate: true })
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    fillForm()
    void refreshRoles()
  },
)

const validateForm = () => {
  errors.name = required(form.name)
  errors.username = form.username.trim() ? minLength(2)(form.username) : required(form.username)
  errors.email = emailValidator(form.email) || required(form.email)
  errors.phone = phoneValidator(form.phone)

  if (form.password) {
    errors.password = minLength(8)(form.password)
  } else {
    errors.password = isEdit.value ? '' : required(form.password)
  }

  if (!form.password && form.confirmPassword) {
    errors.confirmPassword = 'ກະລຸນາປ້ອນລະຫັດຜ່ານກ່ອນ'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'ລະຫັດຜ່ານບໍ່ກົງກັນ'
  } else {
    errors.confirmPassword = ''
  }

  return !Object.values(errors).some(Boolean)
}

const save = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      status: form.status,
      avatar: form.avatar || null,
    }
    if (form.password) payload.password = form.password

    if (isEdit.value) {
      await update(props.user.id, payload)
      toast.success('ອັບເດດຜູ້ໃຊ້ແລ້ວ')
    } else {
      await create(payload)
      toast.success('ສ້າງຜູ້ໃຊ້ແລ້ວ')
    }
    emit('update:modelValue', false)
    emit('saved')
  } catch (requestError) {
    toast.error(messageFrom(requestError, 'ບໍ່ສາມາດບັນທຶກຜູ້ໃຊ້ໄດ້'))
  } finally {
    saving.value = false
  }
}
</script>
