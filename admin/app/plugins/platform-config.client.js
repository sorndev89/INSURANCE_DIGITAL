export default defineNuxtPlugin(() => {
  const { load } = usePlatformConfig()
  void load()
})
