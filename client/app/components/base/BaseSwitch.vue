<template>
  <div class="flex items-center justify-between gap-4">
    <span v-if="label || description" class="min-w-0">
      <span class="block text-sm font-bold text-foreground">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-xs text-muted">{{ description }}</span>
    </span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label || 'ສະຫຼັບ'"
      :disabled="disabled"
      class="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      :class="modelValue ? 'bg-primary' : 'bg-line'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>
