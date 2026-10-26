<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    :class="sizeClass"
    role="status"
    :aria-label="label"
  />
</template>

<script setup>
const props = defineProps({
  size: { type: String, default: 'md' },
  label: { type: String, default: 'ກຳລັງໂຫຼດ' },
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-4 w-4'
  if (props.size === 'lg') return 'h-8 w-8'
  return 'h-5 w-5'
})
</script>
