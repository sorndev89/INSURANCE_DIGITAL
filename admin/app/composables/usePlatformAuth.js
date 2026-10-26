export const usePlatformAuth = () => {
  const config = useRuntimeConfig()
  const token = useApiToken()
  const user = useState('platform_user', () => null)

  const login = async ({ identifier, email, password }) => {
    const response = await $fetch('/platform/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { identifier: identifier ?? email, password },
    })
    token.value = response.data.token
    user.value = response.data.user
    return response.data
  }

  const loadMe = async () => {
    if (!token.value) return null
    try {
      const response = await $fetch('/platform/auth/me', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${token.value}` },
      })
      user.value = response.data
      return response.data
    } catch (error) {
      if (error?.response?.status === 401) {
        token.value = null
        user.value = null
      }
      return null
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  return { token, user, login, loadMe, logout }
}
