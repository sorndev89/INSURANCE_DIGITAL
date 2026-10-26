<template>
  <BaseCard class="min-w-0 overflow-hidden">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-sm font-bold">{{ title }}</h2>
          <p v-if="description" class="mt-0.5 text-xs text-muted">{{ description }}</p>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </template>

    <div v-if="loading" class="space-y-3" aria-busy="true">
      <BaseSkeleton v-for="index in skeletonRows" :key="index" height="lg" />
    </div>
    <ErrorState v-else-if="error" :message="error" @retry="$emit('retry')" />
    <slot v-else />
  </BaseCard>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  skeletonRows: { type: Number, default: 3 },
})

defineEmits(['retry'])
</script>
