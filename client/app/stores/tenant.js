import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#app'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { normalizeHex, rgbChannels, shadeHex, tintHex } from '~/utils/color'
import { createSingleFlight } from '~/utils/async'

const SLUG_KEY = 'saiyfon_tenant_slug'
const REQUEST_TIMEOUT_MS = 2500

const timeoutSignal = (ms) => {
  try {
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      return AbortSignal.timeout(ms)
    }
  } catch {
    // fall through
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}

const errorStatus = (error) => error?.response?.status || error?.statusCode || error?.status || null

const isLocalHostname = (host) =>
  !host || host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')

export const useTenantStore = defineStore('tenant', () => {
  const config = useRuntimeConfig()
  const isNative = Capacitor.isNativePlatform()

  const tenant = ref(null)
  const loading = ref(false)
  const missing = ref(false)
  const offline = ref(false)
  const needsSelection = ref(false)
  const slug = ref('')

  const name = computed(() => tenant.value?.name || config.public.defaultTenantName)
  const brand = computed(() => tenant.value?.branding || {})
  const brandName = computed(() => brand.value.name || name.value)
  const shortName = computed(() => brand.value.shortName || brandName.value)
  const logoUrl = computed(() => brand.value.logoUrl || '')
  const primaryColor = computed(() =>
    normalizeHex(brand.value.primaryColor, config.public.defaultBrandColor),
  )
  const locale = computed(() => tenant.value?.locale || 'lo')
  const currency = computed(() => tenant.value?.currency || 'LAK')
  const status = computed(() => tenant.value?.status || 'active')
  const suspended = computed(() => status.value === 'suspended')
  const features = computed(() => tenant.value?.features || [])
  const resolved = computed(() => Boolean(tenant.value))
  const isFallback = computed(() => offline.value || needsSelection.value)

  const hasFeature = (feature) => features.value.includes('*') || features.value.includes(feature)

  const applyFallback = () => {
    tenant.value = {
      slug: slug.value || config.public.defaultTenantSlug,
      name: config.public.defaultTenantName,
      status: 'active',
      branding: {
        name: config.public.defaultTenantName,
        primaryColor: config.public.defaultBrandColor,
      },
      features: ['*'],
      locale: 'lo',
      currency: 'LAK',
      timezone: 'Asia/Vientiane',
    }
  }

  const applyBranding = () => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const primary = primaryColor.value
    const isDark = root.classList.contains('dark')
    root.style.setProperty('--sf-primary', primary)
    root.style.setProperty('--sf-primary-rgb', rgbChannels(primary))
    root.style.setProperty('--sf-primary-dark', shadeHex(primary, 0.18))
    root.style.setProperty(
      '--sf-primary-light',
      isDark ? shadeHex(primary, 0.72) : tintHex(primary, 0.9),
    )
    root.style.setProperty(
      '--sf-primary-text',
      isDark ? tintHex(primary, 0.55) : shadeHex(primary, 0.32),
    )
    root.style.setProperty('--sf-focus', isDark ? tintHex(primary, 0.45) : primary)
    root.style.setProperty('--sf-on-primary', '#ffffff')
    root.style.setProperty('--sf-theme-color', primary)
  }

  const applyTenant = async (data) => {
    tenant.value = data
    slug.value = data.slug
    missing.value = false
    offline.value = false
    needsSelection.value = false
    try {
      await Preferences.set({ key: SLUG_KEY, value: data.slug })
    } catch {
      // persistence is best-effort
    }
  }

  const handleError = async (error, { explicit } = { explicit: false }) => {
    const code = errorStatus(error)
    if (code === 404) {
      if (isNative) {
        needsSelection.value = true
        missing.value = false
        tenant.value = null
        try {
          await Preferences.remove({ key: SLUG_KEY })
        } catch {
          // ignore
        }
      } else {
        missing.value = true
        tenant.value = null
      }
      return
    }

    if (explicit) throw error
    offline.value = true
    applyFallback()
  }

  const fetchBySlug = async (value) => {
    const response = await $fetch('/public/tenant', {
      baseURL: config.public.apiBase,
      query: { slug: value },
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    })
    await applyTenant(response.data)
  }

  const fetchByHost = async () => {
    const response = await $fetch('/public/tenant', {
      baseURL: config.public.apiBase,
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    })
    await applyTenant(response.data)
  }

  const resolveTask = async () => {
    loading.value = true
    try {
      const mode = config.public.tenantMode || 'auto'
      let stored = ''
      try {
        stored = (await Preferences.get({ key: SLUG_KEY })).value || ''
      } catch {
        stored = ''
      }

      if (mode === 'off' || mode === 'mock') {
        slug.value = stored || config.public.defaultTenantSlug
        applyFallback()
        return
      }

      if (isNative) {
        if (!stored) {
          needsSelection.value = true
          applyFallback()
          return
        }
        slug.value = stored
        try {
          await fetchBySlug(stored)
        } catch (error) {
          await handleError(error)
        }
        return
      }

      const host = typeof window === 'undefined' ? '' : window.location.hostname
      if (isLocalHostname(host)) {
        slug.value = stored || config.public.defaultTenantSlug
        try {
          await fetchBySlug(slug.value)
        } catch (error) {
          await handleError(error)
        }
      } else {
        try {
          await fetchByHost()
        } catch (error) {
          await handleError(error)
        }
      }
    } finally {
      loading.value = false
    }
  }

  // A single in-flight resolver prevents plugin/middleware races and duplicate requests.
  const resolve = createSingleFlight(resolveTask)

  const selectSlug = async (value) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(normalized)) {
      throw new Error('ລະຫັດບໍລິສັດບໍ່ຖືກຕ້ອງ')
    }
    loading.value = true
    try {
      await fetchBySlug(normalized)
      applyBranding()
      return tenant.value
    } finally {
      loading.value = false
    }
  }

  return {
    tenant,
    loading,
    missing,
    offline,
    needsSelection,
    slug,
    isNative,
    name,
    brand,
    brandName,
    shortName,
    logoUrl,
    primaryColor,
    locale,
    currency,
    status,
    suspended,
    features,
    resolved,
    isFallback,
    hasFeature,
    resolve,
    selectSlug,
    applyBranding,
  }
})
