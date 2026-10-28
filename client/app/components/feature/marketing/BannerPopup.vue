<template>
  <BaseModal v-model="open" title="" size="md">
    <div v-if="banner" class="space-y-4">
      <div
        class="rounded-2xl p-5 text-white"
        :class="banner.tone === 'success' ? 'bg-success' : banner.tone === 'warning' ? 'bg-warning' : 'bg-primary'"
      >
        <p class="text-xs font-bold uppercase tracking-wider text-white">ໂປຣໂມຊັ່ນພິເສດ</p>
        <h2 class="mt-1 text-xl font-bold leading-snug">{{ banner.title }}</h2>
        <p class="mt-2 text-sm text-white">{{ banner.subtitle }}</p>
      </div>

      <div class="flex items-center gap-2 text-xs text-muted">
        <BaseIcon name="schedule" size="sm" />
        <span>ໄລຍະໂປຣໂມຊັ່ນ {{ banner.startDate }} – {{ banner.endDate }}</span>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" @click="dismiss">ບໍ່ສະແດງອີກ</BaseButton>
        <BaseButton icon="arrow_forward" @click="go"> {{ banner.ctaLabel }} </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { useBanners } from '~/composables/useBanners'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const { activeBanners } = useBanners()

const open = ref(false)

const banner = computed(() => {
  const audience = activeBanners.value.filter(
    (item) => item.audience === 'all' || item.audience === auth.role,
  )
  return audience[0] || null
})

const storageKey = computed(() => (banner.value ? `saiyfon-banner-seen-${banner.value.id}` : ''))

const dismiss = () => {
  if (import.meta.client && storageKey.value) {
    sessionStorage.setItem(storageKey.value, '1')
  }
  open.value = false
}

const go = () => {
  const target = banner.value?.ctaTo || '/home'
  dismiss()
  navigateTo(target)
}

onMounted(() => {
  const publicPaths = ['/', '/login', '/agents/register', '/forgot-password']
  if (publicPaths.includes(route.path)) return
  if (!auth.isAuthenticated || !banner.value) return
  if (import.meta.client && sessionStorage.getItem(storageKey.value)) return
  setTimeout(() => {
    open.value = true
  }, 900)
})
</script>
