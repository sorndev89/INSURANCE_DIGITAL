<template>
  <nav aria-label="Breadcrumb" class="min-w-0">
    <ol class="flex min-w-0 items-center gap-1.5 text-sm">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex min-w-0 items-center gap-1.5"
      >
        <NuxtLink
          v-if="index < items.length - 1"
          :to="item.to"
          class="shrink-0 text-muted transition-colors hover:text-primary-text"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else class="truncate font-bold text-foreground" aria-current="page">
          {{ item.label }}
        </span>
        <BaseIcon
          v-if="index < items.length - 1"
          name="chevron_right"
          size="sm"
          class="shrink-0 text-muted"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup>
const { breadcrumb } = useNavigation()
const items = computed(() => breadcrumb.value)
</script>
