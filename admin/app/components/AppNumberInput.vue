<template>
  <input
    :id="id"
    ref="inputRef"
    :name="name"
    :value="display"
    type="text"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :inputmode="actualInputmode"
    :maxlength="maxlength"
    class="sf-input"
    @input="onInput"
    @blur="onBlur"
    @focus="$emit('focus', $event)"
  />
</template>

<script setup>
import {
  caretForSymbols,
  formatGroupedNumber,
  formatNumericDraft,
} from '~/utils/currencyDisplay'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  inputmode: { type: String, default: '' },
  maxlength: { type: [String, Number], default: undefined },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  allowDecimal: { type: Boolean, default: false },
  maxDecimals: { type: Number, default: 2 },
  allowNegative: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const inputRef = ref(null)
const actualInputmode = computed(
  () => props.inputmode || (props.allowDecimal ? 'decimal' : 'numeric'),
)

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
