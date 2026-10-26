export const useApiToken = () =>
  useCookie('saiyfon_platform_token', {
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    default: () => null,
  })

export const apiErrorMessage = (error) =>
  error?.data?.error?.message || error?.message || 'ມີຂໍ້ຜິດພາດ, ກະລຸນາລອງໃໝ່'

export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useApiToken()

  const request = async (path, options = {}) => {
    try {
      return await $fetch(path, {
        baseURL: config.public.apiBase,
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
      })
    } catch (error) {
      if (error?.response?.status === 401 && path !== '/platform/auth/login') {
        token.value = null
        await navigateTo('/login')
      }
      throw error
    }
  }

  return { request, token, apiBase: config.public.apiBase }
}
