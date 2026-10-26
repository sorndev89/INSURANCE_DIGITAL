<template>
  <component :is="as" class="rounded-xl border border-line bg-surface shadow-card">
    <div v-if="$slots.header" class="border-b border-line px-3.5 py-2.5 sm:px-5 sm:py-3.5">
      <slot name="header" />
    </div>
    <div :class="paddingClass">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-line px-3.5 py-2.5 sm:px-5 sm:py-3.5">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
const props = defineProps({
  as: { type: String, default: 'div' },
  padding: { type: String, default: 'md' },
  flush: { type: Boolean, default: false },
})

const paddingClass = computed(() => {
  if (props.flush) return ''
  if (props.padding === 'sm') return 'p-2.5 sm:p-3'
  if (props.padding === 'lg') return 'p-4 sm:p-6'
  return 'p-3.5 sm:p-5'
})
</script>
