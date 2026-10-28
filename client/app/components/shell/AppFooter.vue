<template>
  <footer class="hidden border-t border-line bg-surface px-6 py-4 md:block">
    <div
      class="mx-auto flex max-w-[1920px] flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row"
    >
      <p>© {{ year }} {{ tenant.brandName }}. ສະຫງວນລິຂະສິດ.</p>
      <div class="flex items-center gap-4">
        <NuxtLink to="/profile" class="transition-colors hover:text-primary-text"
          >ນະໂຍບາຍ</NuxtLink
        >
        <NuxtLink to="/profile" class="transition-colors hover:text-primary-text"
          >ເງື່ອນໄຂ</NuxtLink
        >
        <span class="hidden text-line sm:inline">|</span>
        <span>v1.0.0</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
const tenant = useTenantStore()
</script>
