<template>
  <div
    class="rounded-xl border p-3 sm:p-4 md:p-5 shadow-card transition-all duration-150"
    :class="highlight ? 'border-primary bg-primary text-white' : 'border-line bg-surface'"
    :aria-busy="loading || undefined"
  >
    <div class="flex items-start justify-between gap-1.5 sm:gap-3">
      <p
        class="truncate text-xs sm:text-sm font-bold"
        :class="highlight ? 'text-on-primary' : 'text-muted'"
      >
        {{ label }}
      </p>
      <span
        v-if="icon"
        class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl"
        :class="highlight ? 'bg-primary-dark text-white' : 'bg-primary/10 text-primary-text'"
      >
        <BaseIcon :name="icon" size="sm" class="sm:hidden" />
        <BaseIcon :name="icon" size="md" class="hidden sm:inline-block" />
      </span>
    </div>

    <template v-if="loading">
      <BaseSkeleton class="mt-2.5 sm:mt-4" width="lg" height="lg" />
      <BaseSkeleton class="mt-1.5 sm:mt-2.5" width="md" height="sm" />
    </template>
    <template v-else>
      <p class="mt-2 sm:mt-3 font-bold tabular-nums" :class="valueClass">{{ value }}</p>
      <div v-if="trend || hint" class="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
        <span
          v-if="trend"
          class="rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-bold"
          :class="trendClass"
        >
          {{ trend }}
        </span>
        <span
          v-if="hint"
          class="truncate text-xs"
          :class="highlight ? 'text-on-primary' : 'text-muted'"
        >
          {{ hint }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  icon: { type: String, default: '' },
  trend: { type: String, default: '' },
  trendTone: { type: String, default: 'success' },
  hint: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const valueClass = computed(() => {
  const text = String(props.value)
  if (text.length > 12) return 'text-base sm:text-xl'
  if (text.length > 8) return 'text-lg sm:text-2xl'
  return 'text-xl sm:text-3xl'
})

const trendClass = computed(() => {
  if (props.highlight) return 'bg-primary-dark text-white'
  if (props.trendTone === 'danger') return 'bg-danger/10 text-danger'
  if (props.trendTone === 'warning') return 'bg-warning/10 text-warning'
  return 'bg-success/10 text-success'
})
</script>
