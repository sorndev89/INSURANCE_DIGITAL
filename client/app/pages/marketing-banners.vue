<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ໂຄສະນາ & ແບນເນີ"
      description="ສ້າງ ແລະ ກຳນົດເວລາສະແດງ Popup Banner ເມື່ອຜູ້ໃຊ້ເປີດແອັບ."
    >
      <template #actions>
        <BaseButton icon="add" @click="openCreate">ສ້າງແບນເນີ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ແບນເນີທັງໝົດ" :value="format.number(banners.length)" icon="campaign" />
      <StatCard label="ເປີດໃຊ້ງານ" :value="format.number(activeCount)" icon="visibility" />
      <StatCard
        label="ກຳລັງສະແດງ"
        :value="format.number(activeBanners.length)"
        icon="play_circle"
        highlight
      />
      <StatCard label="ກຸ່ມເປົ້າໝາຍ" :value="format.number(audienceCount)" icon="groups" />
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="banner in banners"
        :key="banner.id"
        class="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card"
      >
        <div
          class="p-5 text-white"
          :class="
            banner.tone === 'success'
              ? 'bg-success'
              : banner.tone === 'warning'
                ? 'bg-warning'
                : 'bg-primary'
          "
        >
          <p class="text-[11px] font-bold uppercase tracking-wider text-white">
            {{ audienceLabel(banner.audience) }}
          </p>
          <h2 class="mt-1 text-base font-bold leading-snug">{{ banner.title }}</h2>
          <p class="mt-1 line-clamp-2 text-xs text-white">{{ banner.subtitle }}</p>
        </div>

        <div class="flex flex-1 flex-col p-4">
          <div class="space-y-1 text-xs">
            <div class="flex justify-between gap-2">
              <span class="text-muted">ໄລຍະ</span>
              <span class="font-bold">{{ banner.startDate }} – {{ banner.endDate }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-muted">CTA</span>
              <span class="font-bold">{{ banner.ctaLabel }}</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-muted">ລິ້ງ</span>
              <span class="truncate font-mono text-[11px]">{{ banner.ctaTo }}</span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between border-t border-line pt-3">
            <BaseSwitch
              :model-value="banner.active"
              label="ເປີດໃຊ້"
              @update:model-value="toggle(banner, $event)"
            />
            <div class="flex gap-1">
              <BaseButton variant="ghost" size="sm" icon="edit" @click="openEdit(banner)">
                ແກ້ໄຂ
              </BaseButton>
              <BaseButton variant="ghost" size="sm" icon="delete" @click="remove(banner)">
                ລຶບ
              </BaseButton>
            </div>
          </div>
        </div>
      </article>
    </div>

    <BaseModal v-model="formOpen" :title="editingId ? 'ແກ້ໄຂແບນເນີ' : 'ສ້າງແບນເນີ'" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <BaseInput v-model="form.title" label="ຫົວຂໍ້" placeholder="ສ່ວນຫຼຸດ 30%..." required />
        </div>
        <div class="sm:col-span-2">
          <BaseTextarea v-model="form.subtitle" label="ຄຳອະທິບາຍ" placeholder="ລາຍລະອຽດໂປຣໂມຊັ່ນ" />
        </div>
        <BaseInput v-model="form.ctaLabel" label="ຂໍ້ຄວາມປຸ່ມ" placeholder="ຊື້ປະກັນໄພ" />
        <BaseInput v-model="form.ctaTo" label="ລິ້ງປາຍທາງ" placeholder="/policies/create" />
        <BaseInput v-model="form.startDate" type="date" label="ເລີ່ມສະແດງ" />
        <BaseInput v-model="form.endDate" type="date" label="ສິ້ນສຸດ" />
        <BaseSelect v-model="form.audience" label="ກຸ່ມເປົ້າໝາຍ" :options="audienceOptions" />
        <BaseSelect v-model="form.tone" label="ສີ" :options="toneOptions" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="formOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" @click="save">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useBanners } from '~/composables/useBanners'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ໂຄສະນາ & ແບນເນີ',
  permission: 'marketing.manage',
})

const format = useFormat()
const toast = useToast()
const { banners, activeBanners, createBanner, updateBanner, removeBanner } = useBanners()

const formOpen = ref(false)
const editingId = ref(null)

const audienceOptions = [
  { value: 'all', label: 'ທຸກຄົນ' },
  { value: 'customer', label: 'ລູກຄ້າ' },
  { value: 'agent', label: 'ຕົວແທນ' },
]
const toneOptions = [
  { value: 'primary', label: 'ຂຽວ (Primary)' },
  { value: 'success', label: 'ຂຽວສຳເລັດ' },
  { value: 'warning', label: 'ເຫຼືອງ (Warning)' },
]

const form = reactive({
  title: '',
  subtitle: '',
  ctaLabel: 'ເບິ່ງເພີ່ມເຕີມ',
  ctaTo: '/home',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  audience: 'all',
  tone: 'primary',
})

const activeCount = computed(() => banners.value.filter((banner) => banner.active).length)
const audienceCount = computed(
  () => new Set(banners.value.map((banner) => banner.audience)).size,
)
const audienceLabel = (value) =>
  audienceOptions.find((option) => option.value === value)?.label || value

const openCreate = () => {
  editingId.value = null
  Object.assign(form, {
    title: '',
    subtitle: '',
    ctaLabel: 'ເບິ່ງເພີ່ມເຕີມ',
    ctaTo: '/home',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    audience: 'all',
    tone: 'primary',
  })
  formOpen.value = true
}

const openEdit = (banner) => {
  editingId.value = banner.id
  Object.assign(form, banner)
  formOpen.value = true
}

const save = () => {
  if (!form.title.trim()) {
    toast.error('ກະລຸນາປ້ອນຫົວຂໍ້')
    return
  }
  if (editingId.value) {
    updateBanner(editingId.value, { ...form })
    toast.success('ແກ້ໄຂແບນເນີແລ້ວ')
  } else {
    createBanner({ ...form, image: '', active: true })
    toast.success('ສ້າງແບນເນີແລ້ວ')
  }
  formOpen.value = false
}

const toggle = (banner, value) => {
  updateBanner(banner.id, { active: value })
}

const remove = (banner) => {
  removeBanner(banner.id)
  toast.success('ລຶບແບນເນີແລ້ວ')
}
</script>
