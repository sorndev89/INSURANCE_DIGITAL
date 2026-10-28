<template>
  <div class="min-h-dvh bg-background text-foreground">
    <header class="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-cta"
          >
            <BaseIcon name="shield" size="lg" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-base font-bold leading-tight">ສາຍຝົນ ປະກັນໄພ</span>
            <span class="block text-[11px] text-muted">Saiyfon Broker Digital Hub</span>
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-bold text-muted md:flex">
          <a href="#insurers" class="hover:text-primary-text">ບໍລິສັດຄູ່ຮ່ວມ</a>
          <a href="#features" class="hover:text-primary-text">ບໍລິການ</a>
          <a href="#agents" class="hover:text-primary-text">ເປັນຕົວແທນ</a>
        </nav>

        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="navigateTo('/login')">ເຂົ້າສູ່ລະບົບ</BaseButton>
          <BaseButton size="sm" icon="person_add" @click="navigateTo('/agents/register')">
            ສະໝັກຕົວແທນ
          </BaseButton>
        </div>
      </div>
    </header>

    <main>
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div class="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <BaseBadge tone="primary" dot>ນາຍໜ້າປະກັນໄພອັນດັບ 1 ຂອງລາວ</BaseBadge>
            <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              ເລື່ອງປະກັນໄພ
              <span class="text-primary-text">ຄົບ ແລະ ຈົບຢູ່ບ່ອນດຽວ</span>
            </h1>
            <p class="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              ເຊື່ອມຕໍ່ 11 ບໍລິສັດປະກັນໄພຊັ້ນນຳ, ຊື້ປະກັນໄພອອນລາຍ, ຊຳລະຜ່ານ BCEL One
              ແລະ ຮັບຄອມມິດຊັ່ນ 5% ສຳລັບຕົວແທນຂາຍຍ່ອຍ.
            </p>

            <div class="mt-6 flex flex-col gap-2 sm:flex-row">
              <BaseButton size="lg" icon="add_circle" @click="navigateTo('/policies/create')">
                ຊື້ປະກັນໄພເລີຍ
              </BaseButton>
              <BaseButton
                size="lg"
                variant="secondary"
                icon="badge"
                @click="navigateTo('/agents/register')"
              >
                ສະໝັກເປັນຕົວແທນ 5%
              </BaseButton>
            </div>

            <dl class="mt-8 grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-line bg-surface p-3 text-center">
                <dt class="text-xs text-muted">ບໍລິສັດຄູ່ຮ່ວມ</dt>
                <dd class="mt-1 text-2xl font-bold text-primary-text">{{ insurers.length }}</dd>
              </div>
              <div class="rounded-xl border border-line bg-surface p-3 text-center">
                <dt class="text-xs text-muted">ສັນຍາທີ່ອອກ</dt>
                <dd class="mt-1 text-2xl font-bold text-primary-text">1,240+</dd>
              </div>
              <div class="rounded-xl border border-line bg-surface p-3 text-center">
                <dt class="text-xs text-muted">ຄອມມິດຊັ່ນ</dt>
                <dd class="mt-1 text-2xl font-bold text-primary-text">5%</dd>
              </div>
            </dl>
          </div>

          <div class="relative">
            <div class="rounded-3xl border border-primary/20 bg-surface p-5 shadow-card sm:p-7">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-muted">Quick Quote</p>
                  <p class="mt-1 text-lg font-bold">ປະກັນໄພລົດຍົນ</p>
                </div>
                <span class="rounded-xl bg-primary/10 p-2 text-primary-text">
                  <BaseIcon name="directions_car" size="lg" />
                </span>
              </div>

              <div class="mt-4 grid grid-cols-3 gap-2">
                <div
                  v-for="category in VEHICLE_CATEGORIES.slice(0, 6)"
                  :key="category.value"
                  class="rounded-lg border border-line p-2 text-center"
                >
                  <BaseIcon :name="category.icon" class="mx-auto text-muted" />
                  <p class="mt-1 text-[11px] font-bold">{{ category.label }}</p>
                </div>
              </div>

              <div class="mt-4 rounded-xl bg-surface-muted p-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted">ເບ້ຍພື້ນຖານ</span>
                  <span class="font-bold tabular-nums">{{ format.currency(2500000) }}</span>
                </div>
                <div class="mt-1 flex justify-between">
                  <span class="text-muted">VAT 7%</span>
                  <span class="font-bold tabular-nums">{{ format.currency(175000) }}</span>
                </div>
                <div class="mt-1 flex justify-between">
                  <span class="text-muted">ຄ່າທະບຽນ</span>
                  <span class="font-bold tabular-nums">{{ format.currency(20000) }}</span>
                </div>
                <div class="mt-2 flex justify-between border-t border-line pt-2">
                  <span class="font-bold">ລວມສຸດທິ</span>
                  <span class="font-bold tabular-nums text-primary-text">
                    {{ format.currency(2695000) }}
                  </span>
                </div>
              </div>

              <BaseButton class="mt-4" block icon="qr_code_2" @click="navigateTo('/policies/create')">
                ຄຳນວນ ແລະ ຊຳລະ BCEL One
              </BaseButton>
              <p class="mt-2 text-center text-[11px] text-muted">
                ເລືອກລົດຮັບຈ້າງ / ສ່ວນຕົວ ເພື່ອຄຳນວນລາຄາທີ່ຖືກຕ້ອງ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="insurers" class="border-t border-line bg-surface-muted/40 py-12">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-primary-text">
                Partner Insurers
              </p>
              <h2 class="mt-1 text-2xl font-bold">11 ບໍລິສັດປະກັນໄພຊັ້ນນຳ</h2>
              <p class="mt-1 text-sm text-muted">ປຽບທຽບແຜນ ແລະ ລາຄາໄດ້ໃນບ່ອນດຽວ</p>
            </div>
            <BaseButton variant="secondary" icon="apartment" @click="navigateTo('/login')">
              ເຂົ້າຈັດການ
            </BaseButton>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <div
              v-for="insurer in insurers"
              :key="insurer.id"
              class="rounded-xl border border-line bg-surface p-3 shadow-card"
            >
              <img
                v-if="insurer.logo"
                :src="insurer.logo"
                :alt="insurer.name"
                class="h-10 w-10 rounded-lg bg-surface-muted object-contain p-1"
              />
              <span
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-text"
              >
                {{ insurer.code }}
              </span>
              <p class="mt-2 line-clamp-2 text-xs font-bold">{{ insurer.nameLao }}</p>
              <p class="mt-0.5 text-[11px] text-muted">{{ insurer.shortName }}</p>
              <p class="mt-1 text-[11px] font-bold text-success">
                ຄອມ {{ insurer.defaultCommissionRate }}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="py-12">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="text-center">
            <p class="text-xs font-bold uppercase tracking-wider text-primary-text">Why Saiyfon</p>
            <h2 class="mt-1 text-2xl font-bold">ຄົບວົງຈອນການປະກັນໄພ</h2>
          </div>
          <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BaseCard v-for="feature in features" :key="feature.title">
              <span
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
              >
                <BaseIcon :name="feature.icon" size="lg" />
              </span>
              <h3 class="mt-3 text-base font-bold">{{ feature.title }}</h3>
              <p class="mt-1 text-sm text-muted">{{ feature.description }}</p>
            </BaseCard>
          </div>
        </div>
      </section>

      <section id="agents" class="border-t border-line bg-primary py-12 text-white">
        <div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-white">Sub-Agent Program</p>
            <h2 class="mt-1 text-2xl font-bold sm:text-3xl">ເປັນຕົວແທນຂາຍຍ່ອຍ ຮັບ 5% ທຸກສັນຍາ</h2>
            <p class="mt-2 max-w-2xl text-sm text-white">
              ສະໝັກອອນລາຍ, ໄດ້ລະຫັດຕົວແທນ, ຮັບຄອມມິດຊັ່ນ 5% ໂອນເຂົ້າ BCEL ອັດຕະໂນມັດ
              ແລະ ສະສົມຄະແນນ 5,000 Point ຕໍ່ສັນຍາ.
            </p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row">
            <BaseButton
              size="lg"
              variant="secondary"
              icon="person_add"
              @click="navigateTo('/agents/register')"
            >
              ສະໝັກຕອນນີ້
            </BaseButton>
            <BaseButton
              size="lg"
              variant="ghost"
              class="!text-white hover:!bg-white/10"
              icon="login"
              @click="navigateTo('/login')"
            >
              ເຂົ້າສູ່ລະບົບ
            </BaseButton>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-line bg-surface py-8">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted sm:flex-row sm:px-6">
        <p>© {{ year }} ສາຍຝົນ ນາຍໜ້າປະກັນໄພ ຈຳກັດ · SAIYFON BROKER LAOS CO., LTD</p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="hover:text-primary-text">ເຂົ້າສູ່ລະບົບ</NuxtLink>
          <NuxtLink to="/agents/register" class="hover:text-primary-text">ສະໝັກຕົວແທນ</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'
import { insurers } from '~/mocks/insurers'
import { VEHICLE_CATEGORIES } from '~/utils/constants'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'blank',
  title: 'ສາຍຝົນ ບຣອກເກີ ດິຈິຕອນ',
})

const format = useFormat()
const year = new Date().getFullYear()

const features = [
  {
    icon: 'directions_car',
    title: 'ປະກັນໄພລົດ 6 ໝວດ',
    description: 'ເລືອກເກັງ, ກະບະ, ຈິບ, ຕູ້, ບັນທຸກ ຫຼື ລົດເມ ພ້ອມເລືອກລົດສ່ວນຕົວ/ຮັບຈ້າງ.',
  },
  {
    icon: 'qr_code_2',
    title: 'ຊຳລະຜ່ານ BCEL One',
    description: 'ສະແກນ OnePay QR ຈ່າຍຄ່າປະກັນໄພໄດ້ທັນທີ ພ້ອມໃບຢັ້ງຢືນດິຈິຕອນ.',
  },
  {
    icon: 'workspace_premium',
    title: 'ຕົວແທນ 5% + Point',
    description: 'ສະໝັກເປັນຕົວແທນອອນລາຍ ຮັບຄອມ 5% ແລະ ສະສົມ 5,000 Point ຕໍ່ສັນຍາ.',
  },
  {
    icon: 'apartment',
    title: '11 ບໍລິສັດຄູ່ຮ່ວມ',
    description: 'ທິບພະຍະ, ພົງສະຫວັນ, ໂຊກໄຊ, ລ້ານຊ້າງ, ຟໍເຕ-ໂຕໂກ, ອາລີອັນ ແລະ ອື່ນໆ.',
  },
  {
    icon: 'analytics',
    title: 'Dashboard & ລາຍງານ',
    description: 'ຕິດຕາມຍອດຂາຍ YTD, ເປົ້າໝາຍ 3.6 ຕື້, ແລະ ອອກລາຍງານ 4 ຮູບແບບ.',
  },
  {
    icon: 'cake',
    title: 'ແຈ້ງເຕືອນວັນເກີດ',
    description: 'ດູແລລູກຄ້າ ແລະ ຕົວແທນດ້ວຍແຈ້ງເຕືອນວັນເກີດ ແລະ ໂປຣໂມຊັ່ນ.',
  },
]
</script>
