<template>
  <div class="flex min-h-dvh items-center justify-center bg-background px-4 py-12 text-foreground">
    <div class="w-full max-w-md text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary-text"
      >
        <BaseIcon :name="icon" size="xl" />
      </div>
      <p class="mt-6 text-sm font-bold uppercase tracking-widest text-primary-text">
        {{ statusCode }}
      </p>
      <h1 class="mt-2 text-2xl font-bold">{{ title }}</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">{{ message }}</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <BaseButton variant="primary" icon="home" @click="goHome">ກັບໜ້າຫຼັກ</BaseButton>
        <BaseButton variant="secondary" icon="arrow_back" @click="goBack">ກັບຄືນ</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: { type: Object, required: true },
})

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const title = computed(() => {
  if (statusCode.value === 403) return 'ບໍ່ມີສິດເຂົ້າເຖິງ'
  if (statusCode.value === 404) return 'ບໍ່ພົບໜ້າທີ່ຕ້ອງການ'
  return 'ເກີດຂໍ້ຜິດພາດ'
})
const message = computed(() => {
  if (statusCode.value === 403) return 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້. ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບ.'
  if (statusCode.value === 404) return 'ໜ້າທີ່ທ່ານກຳລັງຊອກຫາບໍ່ມີ ຫຼື ຖືກຍ້າຍໄປແລ້ວ.'
  return props.error?.message || 'ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.'
})
const icon = computed(() => {
  if (statusCode.value === 403) return 'lock'
  if (statusCode.value === 404) return 'search_off'
  return 'error_outline'
})

const goHome = () => clearError({ redirect: '/' })
const goBack = () => {
  if (import.meta.client && window.history.length > 1) {
    window.history.back()
    return
  }
  goHome()
}
</script>
