export default defineNuxtPlugin(async () => {
  const tenant = useTenantStore()
  await tenant.resolve()
  tenant.applyBranding()

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => tenant.applyBranding())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
})
