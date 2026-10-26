<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' },
})

const palette = {
  active: 'background:#ecfdf5;color:#047857',
  verified: 'background:#ecfdf5;color:#047857',
  trial: 'background:#fffbeb;color:#b45309',
  pending: 'background:#fffbeb;color:#b45309',
  suspended: 'background:#fef2f2;color:#b91c1c',
  failed: 'background:#fef2f2;color:#b91c1c',
  cancelled: 'background:#f1f5f9;color:#475569',
  inactive: 'background:#f1f5f9;color:#475569',
}

const style = computed(() => palette[props.status] || palette.inactive)
const text = computed(() => props.label || props.status || '—')
</script>

<template>
  <span class="sf-badge" :style="style">{{ text }}</span>
</template>
