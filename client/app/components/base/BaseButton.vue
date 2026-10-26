<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    :class="classes"
    @click="$emit('click', $event)"
  >
    <BaseSpinner v-if="loading" :size="size === 'lg' ? 'md' : 'sm'" />
    <BaseIcon v-else-if="icon" :name="icon" :size="size === 'lg' ? 'md' : 'sm'" />
    <slot v-if="!iconOnly" />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  iconOnly: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  label: { type: String, default: '' },
})

defineEmits(['click'])

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-cta',
  secondary: 'border border-line bg-surface text-foreground hover:bg-surface-muted',
  outline: 'border border-line text-foreground hover:border-primary hover:text-primary-text',
  ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
  danger: 'bg-danger text-white hover:opacity-90',
}

const sizeClasses = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
}

const iconOnlyClasses = {
  sm: 'h-9 w-9 p-0',
  md: 'h-11 w-11 p-0',
  lg: 'h-12 w-12 p-0',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-150 active:scale-[0.98] select-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
  variantClasses[props.variant] || variantClasses.primary,
  props.iconOnly
    ? iconOnlyClasses[props.size] || iconOnlyClasses.md
    : sizeClasses[props.size] || sizeClasses.md,
  props.block ? 'w-full' : '',
])
</script>
