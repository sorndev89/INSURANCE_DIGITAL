<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-muted">
      <BaseIcon :name="icon" size="xl" />
    </div>
    <h2 class="mt-4 text-lg font-bold text-foreground">{{ title }}</h2>
    <p v-if="description" class="mt-1 max-w-md text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: 'ບໍ່ມີຂໍ້ມູນ' },
  description: { type: String, default: '' },
})
</script>
