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
        ref="inputRef"
        :name="name"
        :value="display"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-label="ariaLabel || undefined"
        :inputmode="actualInputmode"
        :maxlength="maxlength"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        class="h-11 w-full rounded-lg border bg-surface text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[
          error ? 'border-danger' : 'border-line',
          prefixIcon ? 'pl-10' : 'pl-3',
          hasSuffix ? 'pr-11' : 'pr-3',
        ]"
        @input="onInput"
        @blur="onBlur"
        @focus="$emit('focus', $event)"
      />
      <span
        v-if="hasSuffix"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
      >
        {{ suffix }}
      </span>
    </div>
  </FormField>
</template>

<script setup>
import { formatGroupedNumber, formatNumericDraft, caretForSymbols } from '~/utils/currencyDisplay'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
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
  inputmode: { type: String, default: '' },
  maxlength: { type: [String, Number], default: undefined },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
  allowDecimal: { type: Boolean, default: false },
  maxDecimals: { type: Number, default: 2 },
  allowNegative: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const inputRef = ref(null)
const generatedId = useId()
const fieldId = computed(() => props.id || `number-${generatedId}`)
const actualInputmode = computed(
  () => props.inputmode || (props.allowDecimal ? 'decimal' : 'numeric'),
)
const hasSuffix = computed(() => Boolean(props.suffix))

const normalizeModelValue = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : ''
}

const formatValue = (value) =>
  formatGroupedNumber(normalizeModelValue(value), {
    allowDecimal: props.allowDecimal,
    maxDecimals: props.maxDecimals,
  })

const display = ref(formatValue(props.modelValue))
let lastEmitted = normalizeModelValue(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    const normalized = normalizeModelValue(value)
    if (normalized === lastEmitted) return
    lastEmitted = normalized
    display.value = formatValue(value)
  },
)

const onInput = (event) => {
  const target = event.target
  const raw = target.value
  const caret = target.selectionStart ?? raw.length
  const symbolPattern = props.allowDecimal ? /[\d.]/g : /\d/g
  const symbolCount = (raw.slice(0, caret).match(symbolPattern) || []).length
  const result = formatNumericDraft(raw, {
    allowDecimal: props.allowDecimal,
    allowNegative: props.allowNegative,
    maxDecimals: props.maxDecimals,
  })

  display.value = result.display
  lastEmitted = result.value
  emit('update:modelValue', result.value)
  emit('input', result.value)

  nextTick(() => {
    if (!inputRef.value) return
    let position = caretForSymbols(result.display, symbolCount)
    if (position === 0 && result.display.startsWith('-')) position = 1
    inputRef.value.setSelectionRange(position, position)
  })
}

const onBlur = (event) => {
  display.value = lastEmitted === '' ? '' : formatValue(lastEmitted)
  emit('blur', event)
}
</script>
