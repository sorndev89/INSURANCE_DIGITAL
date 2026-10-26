import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie } from '#app'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '~/config/permissions'
import { setCurrencyUser } from '~/utils/currencyDisplay'

const SESSION_COOKIE = 'saiyfon_session'
const REMEMBER_SECONDS = 60 * 60 * 24 * 30

export const useAuthStore = defineStore('auth', () => {
  const sessionCookie = useCookie(SESSION_COOKIE, {
    sameSite: 'lax',
    default: () => null,
  })
  const initialSession = sessionCookie.value

  const user = ref(initialSession?.user || null)
  const token = ref(initialSession?.token || null)
  const impersonating = ref(Boolean(initialSession?.impersonating))

  setCurrencyUser(user.value?.id)

  const role = computed(() => user.value?.role || null)
  const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ''))
  const permissions = computed(() => (role.value ? ROLE_PERMISSIONS[role.value] || [] : []))
  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const displayName = computed(() => user.value?.name || user.value?.username || 'ຜູ້ໃຊ້')
  const initials = computed(() => {
    const name = displayName.value.trim()
    if (!name) return '?'
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })

  const persistSession = (nextSession, remember = true) => {
    const cookie = useCookie(SESSION_COOKIE, {
      sameSite: 'lax',
      maxAge: remember ? REMEMBER_SECONDS : undefined,
      default: () => null,
    })
    cookie.value = {
      user: nextSession.user || null,
      token: nextSession.token || null,
      impersonating: Boolean(nextSession.impersonating),
    }
  }

  const can = (permission) => {
    if (!permission) return true
    return permissions.value.includes('*') || permissions.value.includes(permission)
  }

  const setSession = (session, remember = true, options = {}) => {
    const flag = options.impersonating ?? session.impersonating ?? false
    user.value = session.user || null
    token.value = session.token || null
    impersonating.value = Boolean(flag)
    setCurrencyUser(user.value?.id)
    persistSession(
      { user: session.user || null, token: session.token || null, impersonating: flag },
      remember,
    )
  }

  const beginImpersonation = (impersonationToken) => {
    if (!impersonationToken) throw new Error('Impersonation token is required')
    setSession({ user: null, token: impersonationToken }, true, { impersonating: true })
  }

  const updateUser = (patch) => {
    if (!user.value) return null
    user.value = { ...user.value, ...patch }
    persistSession(
      { user: user.value, token: token.value, impersonating: impersonating.value },
      true,
    )
    return user.value
  }

  const logout = () => {
    user.value = null
    token.value = null
    impersonating.value = false
    setCurrencyUser(null)
    sessionCookie.value = null
    const cookie = useCookie(SESSION_COOKIE, { sameSite: 'lax', default: () => null })
    cookie.value = null
  }

  return {
    user,
    token,
    impersonating,
    role,
    roleLabel,
    permissions,
    isAuthenticated,
    displayName,
    initials,
    can,
    setSession,
    beginImpersonation,
    updateUser,
    logout,
  }
})
