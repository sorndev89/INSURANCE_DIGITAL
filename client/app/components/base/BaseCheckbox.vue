<template>
  <div class="space-y-1.5">
    <label class="flex cursor-pointer items-start gap-3">
      <input
        :id="fieldId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        class="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-primary disabled:cursor-not-allowed disabled:opacity-60"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span v-if="label || description" class="min-w-0">
        <span v-if="label" class="block text-sm font-bold text-foreground">{{ label }}</span>
        <span v-if="description" class="mt-0.5 block text-xs text-muted">{{ description }}</span>
      </span>
    </label>
    <p v-if="error" :id="errorId" class="text-xs font-bold text-danger" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  id: { type: String, default: '' },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const generatedId = useId()
const fieldId = computed(() => props.id || `checkbox-${generatedId}`)
const errorId = computed(() => `${fieldId.value}-error`)
const describedBy = computed(() => (props.error ? errorId.value : undefined))
</script>
