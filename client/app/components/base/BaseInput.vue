<template>
  <FormField :for="fieldId" :label="label" :hint="hint" :error="error" :required="required">
    <div class="relative">
      <span
        v-if="prefixIcon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      >
        <BaseIcon :name="prefixIcon" size="sm" />
      </span>
      <input
        :id="fieldId"
        :name="name"
        :value="modelValue"
        :type="actualType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-label="ariaLabel || undefined"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        class="h-11 w-full rounded-lg border bg-surface text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[
          error ? 'border-danger' : 'border-line',
          prefixIcon ? 'pl-10' : 'pl-3',
          hasSuffix ? 'pr-11' : 'pr-3',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground"
        :aria-label="showPassword ? 'ເຊື່ອງລະຫັດຜ່ານ' : 'ສະແດງລະຫັດຜ່ານ'"
        @click="showPassword = !showPassword"
      >
        <BaseIcon :name="showPassword ? 'visibility_off' : 'visibility'" size="sm" />
      </button>
      <span
        v-else-if="$slots.suffix || suffix"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
      >
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
  </FormField>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  prefixIcon: { type: String, default: '' },
  suffix: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  ariaLabel: { type: String, default: '' },
  inputmode: { type: String, default: undefined },
  maxlength: { type: [String, Number], default: undefined },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const showPassword = ref(false)
const generatedId = useId()
const fieldId = computed(() => props.id || `input-${generatedId}`)
const actualType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})
const hasSuffix = computed(() => props.type === 'password' || Boolean(props.suffix))
const describedBy = computed(() => {
  if (props.error) return `${fieldId.value}-error`
  if (props.hint) return `${fieldId.value}-hint`
  return undefined
})
</script>
