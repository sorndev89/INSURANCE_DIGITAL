import { computed, ref } from 'vue'
import { banners as mockBanners } from '~/mocks/banners'

const banners = ref(mockBanners.map((banner) => ({ ...banner })))

export const useBanners = () => {
  const activeBanners = computed(() =>
    banners.value.filter((banner) => {
      if (!banner.active) return false
      const today = new Date().toISOString().slice(0, 10)
      return banner.startDate <= today && banner.endDate >= today
    }),
  )

  const createBanner = (payload) => {
    const id = Math.max(0, ...banners.value.map((banner) => banner.id)) + 1
    banners.value.unshift({ ...payload, id, active: true })
    return banners.value[0]
  }

  const updateBanner = (id, patch) => {
    const index = banners.value.findIndex((banner) => banner.id === Number(id))
    if (index === -1) return null
    banners.value[index] = { ...banners.value[index], ...patch }
    return banners.value[index]
  }

  const removeBanner = (id) => {
    banners.value = banners.value.filter((banner) => banner.id !== Number(id))
  }

  return { banners, activeBanners, createBanner, updateBanner, removeBanner }
}
