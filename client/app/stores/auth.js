import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie } from '#app'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '~/config/permissions'

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

  const can = (permission) => {
    if (!permission) return true
    return permissions.value.includes('*') || permissions.value.includes(permission)
  }

  const setSession = (session, remember = true) => {
    user.value = session.user
    token.value = session.token
    const cookie = useCookie(SESSION_COOKIE, {
      sameSite: 'lax',
      maxAge: remember ? REMEMBER_SECONDS : undefined,
      default: () => null,
    })
    cookie.value = { user: session.user, token: session.token }
  }

  const logout = () => {
    user.value = null
    token.value = null
    sessionCookie.value = null
    const cookie = useCookie(SESSION_COOKIE, { sameSite: 'lax', default: () => null })
    cookie.value = null
  }

  return {
    user,
    token,
    role,
    roleLabel,
    permissions,
    isAuthenticated,
    displayName,
    initials,
    can,
    setSession,
    logout,
  }
})
