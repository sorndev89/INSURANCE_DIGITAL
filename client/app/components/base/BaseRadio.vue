<template>
  <label class="flex cursor-pointer items-start gap-3">
    <input
      :id="fieldId"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      class="mt-0.5 h-5 w-5 shrink-0 border-line accent-primary disabled:cursor-not-allowed disabled:opacity-60"
      @change="$emit('update:modelValue', value)"
    />
    <span v-if="label || description" class="min-w-0">
      <span v-if="label" class="block text-sm font-bold text-foreground">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-xs text-muted">{{ description }}</span>
    </span>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const generatedId = useId()
const fieldId = computed(() => props.id || `radio-${generatedId}`)
</script>
