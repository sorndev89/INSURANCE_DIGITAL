<template>
  <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div class="min-w-0">
      <slot name="eyebrow" />
      <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
      <slot name="meta" />
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
