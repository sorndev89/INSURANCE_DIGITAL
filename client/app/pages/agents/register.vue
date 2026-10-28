<template>
  <div>
    <div class="mb-6">
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-1 text-sm font-bold text-primary-text hover:underline"
      >
        <BaseIcon name="arrow_back" size="sm" />
        ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
      </NuxtLink>
    </div>

    <template v-if="!createdAgent">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">ສະໝັກເປັນຕົວແທນຂາຍຍ່ອຍ</h1>
        <p class="mt-2 text-sm text-muted">
          ສະໝັກອອນລາຍ ໄດ້ຮັບຄອມມິດຊັ່ນ 5% ອັດຕະໂນມັດ ແລະ ສະສົມຄະແນນທຸກສັນຍາ.
        </p>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2">
        <div class="rounded-xl border border-line bg-surface-muted p-3 text-center">
          <p class="text-lg font-bold text-primary-text">5%</p>
          <p class="text-xs text-muted">ຄອມມິດຊັ່ນ</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-3 text-center">
          <p class="text-lg font-bold text-primary-text">5,000</p>
          <p class="text-xs text-muted">Point / ສັນຍາ</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-3 text-center">
          <p class="text-lg font-bold text-primary-text">BCEL</p>
          <p class="text-xs text-muted">ຮັບເງິນອັດຕະໂນມັດ</p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.firstName"
            label="ຊື່"
            placeholder="ຄຳພູ"
            required
            :error="errors.firstName"
          />
          <BaseInput
            v-model="form.lastName"
            label="ນາມສະກຸນ"
            placeholder="ວົງວິຫານ"
            required
            :error="errors.lastName"
          />
          <BaseInput
            v-model="form.phone"
            label="ເບີໂທລະສັບ"
            placeholder="020 5555 1234"
            prefix-icon="phone"
            required
            :error="errors.phone"
          />
          <BaseInput
            v-model="form.email"
            type="email"
            label="ອີເມວ"
            placeholder="name@email.com"
            prefix-icon="mail"
            required
            :error="errors.email"
          />
          <BaseInput v-model="form.dob" type="date" label="ວັນເດືອນປີເກີດ" />
          <BaseSelect
            v-model="form.province"
            label="ແຂວງ"
            :options="LAO_PROVINCES"
          />
          <BaseInput
            v-model="form.idCardNumber"
            label="ເລກບັດປະຈຳຕົວ / Passport"
            placeholder="01-..."
          />
          <BaseInput
            v-model="form.bankAccount"
            label="ບັນຊີ BCEL ຮັບເງິນ"
            placeholder="010-01-00-..."
          />
        </div>

        <BaseTextarea
          v-model="form.address"
          label="ທີ່ຢູ່"
          placeholder="ບ້ານ, ເມືອງ, ແຂວງ"
          required
          :error="errors.address"
        />

        <FileUpload
          v-model="form.idCardFile"
          label="ອັບໂຫຼດບັດປະຈຳຕົວ / Passport"
          hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
          auto-upload
          @uploaded="form.idCardUrl = $event?.url || ''"
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="ລະຫັດຜ່ານເຂົ້າລະບົບ"
          placeholder="ຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
          required
          :error="errors.password"
        />

        <div class="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted">
          ການສະໝັກສຳເລັດລະບົບຈະກຳນົດ
          <span class="font-bold text-primary-text">ຄອມມິດຊັ່ນ 5%</span>
          ໃຫ້ອັດຕະໂນມັດ ໂດຍບໍ່ຕ້ອງລໍຖ້າການອະນຸມັດ.
        </div>

        <BaseButton type="submit" block size="lg" icon="badge" :loading="saving">
          ສະໝັກເປັນຕົວແທນ
        </BaseButton>
      </form>
    </template>

    <template v-else>
      <div class="space-y-4 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
        >
          <BaseIcon name="verified" size="2xl" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">ສະໝັກສຳເລັດ</h1>
          <p class="mt-1 text-sm text-muted">
            ທ່ານເປັນຕົວແທນຂາຍຍ່ອຍແລ້ວ ແລະ ໄດ້ຮັບຄອມມິດຊັ່ນ 5% ອັດຕະໂນມັດ.
          </p>
        </div>

        <div class="mx-auto max-w-sm rounded-xl border border-line bg-surface-muted p-4 text-left text-sm">
          <div class="flex justify-between border-b border-line pb-2">
            <span class="text-muted">ລະຫັດຕົວແທນ</span>
            <span class="font-mono font-bold text-primary-text">{{ createdAgent.code }}</span>
          </div>
          <div class="mt-2 flex justify-between border-b border-line pb-2">
            <span class="text-muted">ຊື່</span>
            <span class="font-bold">{{ createdAgent.name }}</span>
          </div>
          <div class="mt-2 flex justify-between border-b border-line pb-2">
            <span class="text-muted">ຄອມມິດຊັ່ນ</span>
            <span class="font-bold text-success">{{ createdAgent.commissionRate }}%</span>
          </div>
          <div class="mt-2 flex justify-between">
            <span class="text-muted">ສະຖານະ</span>
            <BaseBadge tone="success">ໃຊ້ງານໄດ້</BaseBadge>
          </div>
        </div>

        <div class="flex flex-col justify-center gap-2 sm:flex-row">
          <BaseButton variant="secondary" icon="login" @click="navigateTo('/login')">
            ເຂົ້າສູ່ລະບົບ
          </BaseButton>
          <BaseButton icon="add_circle" @click="navigateTo('/policies/create')">
            ອອກປະກັນໄພໃໝ່
          </BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { navigateTo } from '#app'
import { LAO_PROVINCES } from '~/utils/constants'
import { useAgents } from '~/composables/api/useAgents'
import { mockUsers } from '~/mocks/users'
import { useToast } from '~/composables/useToast'
import {
  email as emailValidator,
  phone as phoneValidator,
  required,
  validate,
} from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  title: 'ສະໝັກເປັນຕົວແທນ',
})

const toast = useToast()
const { create } = useAgents({ immediate: false })

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  dob: '',
  province: 'Vientiane Capital',
  idCardNumber: '',
  bankAccount: '',
  address: '',
  idCardFile: null,
  idCardUrl: '',
  password: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  password: '',
})

const saving = ref(false)
const createdAgent = ref(null)

const submit = async () => {
  errors.firstName = required(form.firstName)
  errors.lastName = required(form.lastName)
  errors.phone = validate(form.phone, [required, phoneValidator])
  errors.email = validate(form.email, [required, emailValidator])
  errors.address = required(form.address)
  errors.password = String(form.password).length >= 8 ? '' : 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ'
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
    const userId = Math.max(0, ...mockUsers.map((user) => user.id)) + 1
    const agent = await create({
      userId,
      name: fullName,
      email: form.email.trim(),
      phone: form.phone.trim(),
      dob: form.dob,
      address: form.address.trim(),
      idCardNumber: form.idCardNumber.trim(),
      bankAccount: form.bankAccount.trim(),
      commissionRate: 5,
      level: 'Junior',
      status: 'active',
    })
    mockUsers.push({
      id: userId,
      username: form.email.split('@')[0],
      name: fullName,
      email: form.email.trim(),
      password: form.password,
      role: 'agent',
      phone: form.phone.trim(),
      status: 'active',
      avatar: '',
    })
    createdAgent.value = agent
    toast.success('ສະໝັກເປັນຕົວແທນສຳເລັດ')
  } catch (error) {
    toast.error(error?.message || 'ບໍ່ສາມາດສະໝັກໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
