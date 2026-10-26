<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: '0' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  trend: { type: String, default: '' },
  trendPositive: { type: Boolean, default: true },
  iconColor: { type: String, default: 'text-primary' },
  iconBg: { type: String, default: 'bg-primary/10' },
})
</script>

<template>
  <div class="sf-card p-5 transition hover:shadow-md">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold uppercase tracking-wider text-muted">
          {{ title }}
        </p>
        <p class="mt-2 text-2xl font-extrabold text-foreground tracking-tight sm:text-3xl">
          {{ value }}
        </p>
        <div v-if="subtitle || trend" class="mt-2 flex items-center gap-2 text-xs">
          <span
            v-if="trend"
            class="inline-flex items-center font-bold"
            :class="trendPositive ? 'text-success' : 'text-danger'"
          >
            {{ trendPositive ? '↑' : '↓' }} {{ trend }}
          </span>
          <span v-if="subtitle" class="truncate text-muted">{{ subtitle }}</span>
        </div>
      </div>
      <div
        v-if="icon"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        :class="[iconBg, iconColor]"
      >
        <BaseIcon :name="icon" :size="24" />
      </div>
    </div>
  </div>
</template>
