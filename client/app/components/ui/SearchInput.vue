<template>
  <BaseInput
    v-model="query"
    type="search"
    :placeholder="placeholder"
    :aria-label="label || placeholder"
    prefix-icon="search"
    @update:model-value="handleInput"
  />
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'ຄົ້ນຫາ...' },
  label: { type: String, default: '' },
  debounce: { type: Number, default: 300 },
})

const emit = defineEmits(['update:modelValue', 'search'])
const query = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    if (value !== query.value) query.value = value
  },
)

const emitSearch = useDebounceFn((value) => emit('search', value), props.debounce)

const handleInput = (value) => {
  query.value = value
  emit('update:modelValue', value)
  emitSearch(value)
}
</script>
