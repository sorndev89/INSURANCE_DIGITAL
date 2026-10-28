<template>
  <div id="app-root">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--sf-primary)" :height="2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
    <ConfirmDialog />
    <AppDialog />
    <BannerPopup />
  </div>
</template>

<script setup>
const route = useRoute()
const tenant = useTenantStore()

useHead(() => ({
  title: route.meta.title || undefined,
  titleTemplate: (title) => (title ? `${title} · ${tenant.brandName}` : tenant.brandName),
  htmlAttrs: { lang: tenant.locale },
  meta: [{ name: 'theme-color', content: tenant.primaryColor }],
}))
</script>
