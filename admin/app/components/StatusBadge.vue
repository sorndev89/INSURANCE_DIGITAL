<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
})

const label = computed(() => {
  switch (props.status) {
    case 'active':
      return 'ເປີດໃຊ້ງານ'
    case 'trial':
      return 'ທົດລອງໃຊ້'
    case 'suspended':
      return 'ຖືກລະງັບ'
    case 'pending':
      return 'ລໍຖ້າກວດສອບ'
    case 'verified':
      return 'ຢັ້ງຢືນແລ້ວ'
    case 'failed':
      return 'ບໍ່ສຳເລັດ'
    default:
      return props.status || '—'
  }
})

const badgeClass = computed(() => {
  switch (props.status) {
    case 'active':
    case 'verified':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    case 'trial':
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
    case 'suspended':
    case 'failed':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
    default:
      return 'bg-surface-muted text-muted border border-line'
  }
})
</script>

<template>
  <span class="sf-badge" :class="badgeClass">
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="{
        'bg-emerald-500': status === 'active' || status === 'verified',
        'bg-amber-500': status === 'trial' || status === 'pending',
        'bg-rose-500': status === 'suspended' || status === 'failed',
        'bg-muted': !['active', 'trial', 'suspended', 'pending', 'verified', 'failed'].includes(status),
      }"
    />
    {{ label }}
  </span>
</template>
