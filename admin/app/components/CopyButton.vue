<script setup>
import { ref } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: 'ສຳເນົາ' },
})

const copied = ref(false)

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <button type="button" class="sf-btn sf-btn-secondary" @click="copy">
    {{ copied ? 'ສຳເນົາແລ້ວ' : label }}
  </button>
</template>
