<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  breadcrumbs: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <nav v-if="breadcrumbs && breadcrumbs.length" class="mb-2 flex items-center gap-1.5 text-xs text-muted">
        <NuxtLink to="/dashboard" class="hover:text-primary transition-colors">
          SaaS
        </NuxtLink>
        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <span>/</span>
          <NuxtLink
            v-if="crumb.to"
            :to="crumb.to"
            class="hover:text-primary transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-else class="text-foreground font-bold">{{ crumb.label }}</span>
        </template>
      </nav>

      <h1 class="text-2xl font-extrabold text-foreground tracking-tight sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm text-muted">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2.5">
      <slot name="actions" />
    </div>
  </div>
</template>
