export const usePlatformConfig = () => {
  const config = useRuntimeConfig()
  const platform = useState('platform-config', () => ({
    rootDomain: config.public.rootDomain,
    adminHost: '',
    cnameTarget: '',
    loaded: false,
  }))

  const load = async () => {
    try {
      const response = await $fetch('/public/config', { baseURL: config.public.apiBase })
      platform.value = {
        ...platform.value,
        ...(response?.data || {}),
        loaded: true,
      }
    } catch {
      // Keep the build-time defaults when the API is unreachable.
    }
  }

  return { platform, load }
}
