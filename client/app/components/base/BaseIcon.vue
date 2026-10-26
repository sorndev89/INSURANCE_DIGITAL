<template>
  <span
    class="material-icons shrink-0 select-none"
    :style="{ fontSize: `${pixelSize}px` }"
    :aria-hidden="isDecorative ? 'true' : undefined"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="isDecorative ? undefined : label"
  >
    {{ name }}
  </span>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' },
  label: { type: String, default: '' },
})

const sizes = {
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

const pixelSize = computed(() => sizes[props.size] || sizes.md)
const isDecorative = computed(() => !props.label)
</script>
