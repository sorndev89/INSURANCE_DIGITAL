<template>
  <FormField :for="fieldId" :label="label" :hint="hint" :error="error" :required="required">
    <div class="relative">
      <select
        :id="fieldId"
        :name="name"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-label="ariaLabel || undefined"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        class="h-11 w-full appearance-none rounded-lg border bg-surface pl-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-60"
        :class="error ? 'border-danger' : 'border-line'"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <BaseIcon
        name="expand_more"
        size="sm"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  </FormField>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const generatedId = useId()
const fieldId = computed(() => props.id || `select-${generatedId}`)
const describedBy = computed(() => {
  if (props.error) return `${fieldId.value}-error`
  if (props.hint) return `${fieldId.value}-hint`
  return undefined
})
</script>
