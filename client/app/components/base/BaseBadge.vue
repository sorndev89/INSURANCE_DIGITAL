<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
    :class="toneClass"
  >
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>

<script setup>
const props = defineProps({
  tone: { type: String, default: 'neutral' },
  dot: { type: Boolean, default: false },
})

const toneClasses = {
  primary: 'border-primary/20 bg-primary/10 text-primary-text',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-danger/20 bg-danger/10 text-danger',
  info: 'border-info/20 bg-info/10 text-info',
  neutral: 'border-line bg-surface-muted text-muted',
}

const toneClass = computed(() => toneClasses[props.tone] || toneClasses.neutral)
</script>
