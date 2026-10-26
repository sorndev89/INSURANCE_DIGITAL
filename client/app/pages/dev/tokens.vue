<template>
  <main class="min-h-dvh bg-background text-foreground">
    <div class="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-text">Design system</p>
          <h1 class="mt-2 text-3xl font-bold">Tokens &amp; Typography</h1>
          <p class="mt-2 max-w-2xl text-sm text-muted">
            ໜ້ານີ້ສະແດງ token ທັງໝົດທີ່ໃຊ້ໃນລະບົບ. ກວດ light/dark ແລະ contrast ກ່ອນໃຊ້ໃນໜ້າຈິງ.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-card transition-colors hover:border-primary hover:text-primary-text"
          @click="toggleTheme"
        >
          {{ isDark ? 'Light mode' : 'Dark mode' }}
        </button>
      </header>

      <section aria-labelledby="colors-title" class="space-y-4">
        <h2 id="colors-title" class="text-2xl font-bold">Colors</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="color in colors"
            :key="color.name"
            class="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
          >
            <div class="h-20" :style="{ backgroundColor: `var(${color.token})` }" />
            <div class="space-y-1 p-4">
              <p class="text-sm font-bold">{{ color.name }}</p>
              <p class="text-xs text-muted">{{ color.token }}</p>
              <p class="text-xs text-muted">{{ color.usage }}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="type-title" class="space-y-4">
        <h2 id="type-title" class="text-2xl font-bold">Typography</h2>
        <div class="space-y-6 rounded-xl border border-line bg-surface p-6 shadow-card">
          <div class="space-y-1">
            <p class="text-xs text-muted">text-3xl · 30px / 1.3 · bold</p>
            <p class="text-3xl font-bold">ປົກປ້ອງອະນາຄົດຂອງທ່ານ</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">text-2xl · 24px / 1.4 · bold</p>
            <p class="text-2xl font-bold">ຈັດການປະກັນໄພ</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">text-lg · 18px / 1.6· regular</p>
            <p class="text-lg">ລາຍລະອຽດປະກັນໄພ ແລະ ການຄຸ້ມຄອງ</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">text-base · 16px / 1.7 · regular</p>
            <p class="text-base">
              ຂໍ້ຄວາມຫຼັກສຳລັບເນື້ອຫາ ແລະ ຄຳອະທິບາຍ. ຕົວອັກສອນລາວຕ້ອງມີຄວາມສູງພຽງພໍສຳລັບວັນນະຍຸດ.
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">text-sm · 14px / 1.7 · regular</p>
            <p class="text-sm text-muted">ຂໍ້ມູນຮອງ, ປ້າຍກຳກັບ, ແລະ ຂໍ້ຄວາມໃນຕາຕະລາງ</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">text-xs · 12px / 1.7 · bold</p>
            <p class="text-xs font-bold uppercase tracking-wider text-muted">ສະຖານະ / ໝວດ</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-muted">tabular-nums</p>
            <p class="text-2xl font-bold tabular-nums">{{ format.currency(12850000) }}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="surface-title" class="space-y-4">
        <h2 id="surface-title" class="text-2xl font-bold">Surfaces, radius &amp; shadow</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-lg border border-line bg-surface p-6 shadow-card">
            <p class="text-sm font-bold">Card · rounded-xl</p>
            <p class="mt-1 text-xs text-muted">bg-surface · border-line · shadow-card</p>
          </div>
          <div class="rounded-lg border border-line bg-surface-muted p-6">
            <p class="text-sm font-bold">Muted surface</p>
            <p class="mt-1 text-xs text-muted">bg-surface-muted</p>
          </div>
          <div class="rounded-xl bg-primary p-6 text-white shadow-cta">
            <p class="text-sm font-bold">Primary CTA</p>
            <p class="mt-1 text-xs text-on-primary">shadow-cta</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="semantic-title" class="space-y-4">
        <h2 id="semantic-title" class="text-2xl font-bold">Semantic tones</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="tone in tones"
            :key="tone.name"
            class="rounded-xl border border-line bg-surface p-5"
          >
            <p class="text-sm font-bold" :class="tone.text">{{ tone.name }}</p>
            <p class="mt-1 text-xs text-muted">{{ tone.usage }}</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { useFormat } from '~/utils/format'

const format = useFormat()
const isDark = ref(false)

const colors = [
  { name: 'Primary', token: '--sf-primary', usage: 'ປຸ່ມຫຼັກ, link, active' },
  { name: 'Primary dark', token: '--sf-primary-dark', usage: 'hover, pressed' },
  { name: 'Primary light', token: '--sf-primary-light', usage: 'soft background' },
  { name: 'Background', token: '--sf-background', usage: 'ພື້ນຫຼັງໜ້າ' },
  { name: 'Surface', token: '--sf-surface', usage: 'card, modal' },
  { name: 'Surface muted', token: '--sf-surface-muted', usage: 'table header, filter' },
  { name: 'Foreground', token: '--sf-foreground', usage: 'ຂໍ້ຄວາມຫຼັກ' },
  { name: 'Muted', token: '--sf-muted', usage: 'ຂໍ້ຄວາມຮອງ' },
  { name: 'Line', token: '--sf-line', usage: 'border, divider' },
  { name: 'Success', token: '--sf-success', usage: 'ມີຜົນ, ສຳເລັດ' },
  { name: 'Warning', token: '--sf-warning', usage: 'ລໍຖ້າ, ໃກ້ໝົດອາຍຸ' },
  { name: 'Danger', token: '--sf-danger', usage: 'ຜິດພາດ, ປະຕິເສດ' },
  { name: 'Info', token: '--sf-info', usage: 'ຂໍ້ມູນ, ກຳລັງດຳເນີນການ' },
]

const tones = [
  { name: 'Success', text: 'text-success', usage: 'active / approved / paid' },
  { name: 'Warning', text: 'text-warning', usage: 'pending / expiring' },
  { name: 'Danger', text: 'text-danger', usage: 'rejected / expired' },
  { name: 'Info', text: 'text-info', usage: 'reviewing / processing' },
]

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  document.cookie = `saiyfon_theme=${theme}; path=/; max-age=31536000; samesite=lax`
  isDark.value = theme === 'dark'
}

function toggleTheme() {
  applyTheme(isDark.value ? 'light' : 'dark')
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

definePageMeta({
  layout: 'blank',
  middleware: 'dev-only',
  title: 'Design tokens',
})
</script>
