<template>
  <div class="min-h-dvh bg-background text-foreground">
    <header class="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <NuxtLink to="/" class="flex items-center gap-3 text-primary-text">
          <img
            v-if="tenant.logoUrl"
            :src="tenant.logoUrl"
            :alt="tenant.brandName"
            class="h-10 w-10 rounded-xl bg-surface-muted object-contain p-1"
          />
          <span
            v-else
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-cta"
          >
            <BaseIcon name="shield" size="lg" />
          </span>
          <span class="text-lg font-bold tracking-tight">{{ tenant.shortName }}</span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" icon="login" @click="navigateTo('/login')"
            >ເຂົ້າສູ່ລະບົບ</BaseButton
          >
          <BaseButton icon="arrow_forward" @click="navigateTo('/login')">ເລີ່ມຕົ້ນ</BaseButton>
        </div>
      </div>
    </header>

    <main>
      <section
        class="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20"
      >
        <div>
          <BaseBadge tone="primary">ປະກັນໄພອອນລາຍ</BaseBadge>
          <h1 class="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            ປົກປ້ອງສິ່ງສຳຄັນ
            <span class="block text-primary-text">ດ້ວຍຄວາມໝັ້ນໃຈ</span>
          </h1>
          <p class="mt-4 max-w-xl text-base leading-relaxed text-muted">
            ຈັດການທຸກຄວາມປອດໄພຂອງທ່ານຜ່ານລະບົບດິຈິຕອນ ທີ່ວ່ອງໄວ, ໂປ່ງໃສ ແລະ ເຊື່ອຖືໄດ້.
            ບໍລິການປະກັນໄພຄົບວົງຈອນສຳລັບທຸກຄົນ.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <BaseButton size="lg" icon="login" @click="navigateTo('/login')"
              >ເຂົ້າສູ່ລະບົບ</BaseButton
            >
            <BaseButton size="lg" variant="secondary" icon="mail" @click="navigateTo('/login')"
              >ຕິດຕໍ່ທີມງານ</BaseButton
            >
          </div>
          <dl class="mt-10 grid grid-cols-3 gap-4">
            <div v-for="stat in stats" :key="stat.label">
              <dt class="text-xs text-muted">{{ stat.label }}</dt>
              <dd class="mt-1 text-2xl font-bold">{{ stat.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <img :src="heroImage" alt="Saiyfon Insurance" class="h-full w-full object-cover" />
        </div>
      </section>

      <section class="border-y border-line bg-surface py-12">
        <div class="mx-auto max-w-6xl px-4">
          <div class="max-w-2xl">
            <p class="text-sm font-bold uppercase tracking-widest text-primary-text">ບໍລິການ</p>
            <h2 class="mt-2 text-2xl font-bold">ທຸກຢ່າງທີ່ທ່ານຕ້ອງການໃນບ່ອນດຽວ</h2>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <BaseCard v-for="service in services" :key="service.title">
              <span
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
              >
                <BaseIcon :name="service.icon" size="lg" />
              </span>
              <h3 class="mt-4 text-lg font-bold">{{ service.title }}</h3>
              <p class="mt-1 text-sm leading-relaxed text-muted">{{ service.description }}</p>
            </BaseCard>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-12">
        <div
          class="rounded-2xl bg-primary p-8 text-white md:flex md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-2xl font-bold">ພ້ອມເລີ່ມຕົ້ນແລ້ວບໍ?</h2>
            <p class="mt-1 text-sm text-on-primary">
              ເຂົ້າສູ່ລະບົບເພື່ອຈັດການປະກັນໄພ, ເຄມ ແລະ ການຊຳລະ.
            </p>
          </div>
          <BaseButton
            class="mt-4 md:mt-0"
            variant="secondary"
            icon="arrow_forward"
            @click="navigateTo('/login')"
          >
            ເຂົ້າສູ່ລະບົບ
          </BaseButton>
        </div>
      </section>
    </main>

    <footer class="border-t border-line py-6 text-center text-xs text-muted">
      © {{ year }} {{ tenant.brandName }}. ສະຫງວນລິຂະສິດ.
    </footer>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'
import heroImage from '~/assets/img/hero-insurance.svg'

definePageMeta({
  layout: 'blank',
  title: 'ໜ້າຫຼັກ',
})

const year = new Date().getFullYear()
const tenant = useTenantStore()

const stats = [
  { value: '10K+', label: 'ລູກຄ້າ' },
  { value: '15+', label: 'ປີປະສົບການ' },
  { value: '99%', label: 'ຄວາມເພິ່ງພໍໃຈ' },
]

const services = [
  {
    title: 'ປະກັນໄພລົດຍົນ',
    description: 'ຄຸ້ມຄອງອຸບັດຕິເຫດ ແລະ ຄວາມເສຍຫາຍດ້ວຍເບ້ຍທີ່ຄຸ້ມຄ່າ.',
    icon: 'directions_car',
  },
  {
    title: 'ປະກັນສຸຂະພາບ',
    description: 'ເບິ່ງແຍງສຸຂະພາບທ່ານ ແລະ ຄອບຄົວ ດ້ວຍເຄືອຂ່າຍໂຮງໝໍ.',
    icon: 'health_and_safety',
  },
  {
    title: 'ປະກັນອັກຄີໄພ',
    description: 'ປົກປ້ອງເຮືອນ ແລະ ຊັບສິນຈາກເຫດການທີ່ບໍ່ຄາດຄິດ.',
    icon: 'home',
  },
]
</script>
