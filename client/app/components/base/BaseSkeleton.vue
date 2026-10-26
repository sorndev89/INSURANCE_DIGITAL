<template>
  <span class="skeleton block" :class="classes" aria-hidden="true" />
</template>

<script setup>
const props = defineProps({
  width: { type: String, default: 'full' },
  height: { type: String, default: 'md' },
  rounded: { type: Boolean, default: true },
})

const widthClass = computed(() => {
  if (props.width === 'sm') return 'w-24'
  if (props.width === 'md') return 'w-40'
  if (props.width === 'lg') return 'w-64'
  return 'w-full'
})

const heightClass = computed(() => {
  if (props.height === 'sm') return 'h-3'
  if (props.height === 'lg') return 'h-6'
  if (props.height === 'xl') return 'h-10'
  return 'h-4'
})

const classes = computed(() => [
  widthClass.value,
  heightClass.value,
  props.rounded ? 'rounded-lg' : 'rounded-none',
])
</script>
