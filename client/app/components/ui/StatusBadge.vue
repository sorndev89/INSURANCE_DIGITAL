<template>
  <BaseBadge :tone="meta.tone" :dot="dot">{{ label || meta.label }}</BaseBadge>
</template>

<script setup>
import { getStatusMeta } from '~/utils/constants'

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' },
  dot: { type: Boolean, default: true },
})

const meta = computed(() => getStatusMeta(props.status))
</script>
