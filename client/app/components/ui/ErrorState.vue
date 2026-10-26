<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
      <BaseIcon :name="icon" size="xl" />
    </div>
    <h2 class="mt-4 text-lg font-bold text-foreground">{{ title }}</h2>
    <p class="mt-1 max-w-md text-sm text-muted">{{ message }}</p>
    <BaseButton class="mt-5" variant="secondary" icon="refresh" @click="$emit('retry')">
      {{ retryLabel }}
    </BaseButton>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'error_outline' },
  title: { type: String, default: 'ເກີດຂໍ້ຜິດພາດ' },
  message: { type: String, default: 'ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.' },
  retryLabel: { type: String, default: 'ລອງໃໝ່' },
})

defineEmits(['retry'])
</script>
