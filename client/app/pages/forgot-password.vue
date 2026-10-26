<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight">ລືມລະຫັດຜ່ານ</h1>
    <p class="mt-2 text-sm text-muted">
      ປ້ອນອີເມວທີ່ໃຊ້ໃນລະບົບ. ພວກເຮົາຈະສົ່ງລິ້ງຕັ້ງລະຫັດຜ່ານໃໝ່.
    </p>

    <form class="mt-8 space-y-4" novalidate @submit.prevent="submit">
      <div
        v-if="sent"
        class="rounded-lg border border-success/20 bg-success/10 p-3 text-sm font-bold text-success"
        role="status"
      >
        ຖ້າອີເມວນີ້ມີໃນລະບົບ ຈະໄດ້ຮັບລິ້ງຕັ້ງລະຫັດໃໝ່ໃນໄວໆນີ້.
      </div>

      <BaseInput
        v-model="email"
        type="email"
        label="ອີເມວ"
        placeholder="name@saiyfon.com"
        prefix-icon="mail"
        required
        :error="error"
      />

      <BaseButton type="submit" block size="lg" :loading="loading">ສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່</BaseButton>
    </form>

    <NuxtLink
      to="/login"
      class="mt-6 flex items-center justify-center gap-1 text-sm font-bold text-primary-text hover:text-primary-dark"
    >
      <BaseIcon name="arrow_back" size="sm" />
      ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { email as emailValidator, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  title: 'ລືມລະຫັດຜ່ານ',
})

const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

const submit = async () => {
  error.value = validate(email.value, [required, emailValidator])
  if (error.value) return

  loading.value = true
  sent.value = false
  await new Promise((resolve) => setTimeout(resolve, 700))
  loading.value = false
  sent.value = true
  email.value = ''
}
</script>
