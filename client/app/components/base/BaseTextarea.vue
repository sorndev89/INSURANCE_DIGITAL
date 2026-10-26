<template>
  <FormField :for="fieldId" :label="label" :hint="hint" :error="error" :required="required">
    <textarea
      :id="fieldId"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :required="required"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="describedBy"
      class="w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-60"
      :class="error ? 'border-danger' : 'border-line'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </FormField>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: [String, Number], default: 3 },
  maxlength: { type: [String, Number], default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const generatedId = useId()
const fieldId = computed(() => props.id || `textarea-${generatedId}`)
const describedBy = computed(() => {
  if (props.error) return `${fieldId.value}-error`
  if (props.hint) return `${fieldId.value}-hint`
  return undefined
})
</script>
