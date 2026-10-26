<template>
  <div class="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
    <div class="flex items-center gap-3 text-primary-text">
      <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
        <BaseIcon name="shield" size="lg" />
      </span>
      <div>
        <p class="text-lg font-bold">ເລືອກບໍລິສັດ</p>
        <p class="text-xs text-muted">ປ້ອນລະຫັດບໍລິສັດທີ່ໄດ້ຮັບຈາກຜູ້ດູແລລະບົບ</p>
      </div>
    </div>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <div
        v-if="errorMessage"
        class="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm font-bold text-danger"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <BaseInput
        v-model="code"
        label="ລະຫັດບໍລິສັດ"
        placeholder="saiyfon"
        prefix-icon="business"
        autocomplete="organization"
        required
      />

      <BaseButton type="submit" block size="lg" :loading="loading"> ຢືນຢັນ </BaseButton>
    </form>

    <p class="mt-6 text-center text-xs text-muted">
      ຕົວຢ່າງ: <span class="font-bold">saiyfon</span> ສຳລັບບໍລິສັດສາຍຝົນ
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'blank', title: 'ເລືອກບໍລິສັດ' })

const tenant = useTenantStore()
const code = ref('')
const loading = ref(false)
const errorMessage = ref('')

const submit = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await tenant.selectSlug(code.value)
    await navigateTo('/login')
  } catch (error) {
    errorMessage.value = error?.data?.error?.message || error?.message || 'ບໍ່ພົບບໍລິສັດນີ້'
  } finally {
    loading.value = false
  }
}
</script>
