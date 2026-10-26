<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light font-bold text-primary-text"
    :class="sizeClass"
    role="img"
    :aria-label="alt || name || 'ຮູບຜູ້ໃຊ້'"
  >
    <img v-if="src" :src="src" :alt="alt || name" class="h-full w-full object-cover" />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const initials = computed(() => {
  const value = props.name.trim()
  if (!value) return '?'
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-8 w-8 text-xs'
  if (props.size === 'lg') return 'h-12 w-12 text-base'
  if (props.size === 'xl') return 'h-20 w-20 text-2xl'
  return 'h-10 w-10 text-sm'
})
</script>
