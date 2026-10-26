<template>
  <div class="flex min-h-dvh bg-background font-display text-foreground">
    <div class="relative hidden w-1/2 overflow-hidden lg:block">
      <img :src="authBg" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/80" />
      <div class="relative z-10 flex h-full flex-col justify-between p-12 text-white">
        <div class="flex items-center gap-3 text-2xl font-bold">
          <img
            v-if="tenant.logoUrl"
            :src="tenant.logoUrl"
            :alt="tenant.brandName"
            class="h-12 w-12 rounded-xl bg-white/10 object-contain p-1"
          />
          <span
            v-else
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dark"
          >
            <BaseIcon name="shield" size="xl" />
          </span>
          <span>{{ tenant.brandName }}</span>
        </div>
        <div class="mb-12 max-w-md">
          <h2 class="text-3xl font-bold leading-snug">ປົກປ້ອງອະນາຄົດຂອງທ່ານ ດ້ວຍຄວາມໝັ້ນໃຈ</h2>
          <p class="mt-4 text-base leading-relaxed text-on-primary">
            ລະບົບຄຸ້ມຄອງການປະກັນໄພທີ່ທັນສະໄໝ ແລະ ປອດໄພ ສຳລັບຕົວແທນ ແລະ ລູກຄ້າ.
          </p>
        </div>
        <p class="text-sm text-on-primary">© {{ year }} {{ tenant.brandName }}.</p>
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="mb-8 flex justify-center lg:hidden">
          <div class="flex items-center gap-2 text-2xl font-bold text-primary-text">
            <img
              v-if="tenant.logoUrl"
              :src="tenant.logoUrl"
              :alt="tenant.brandName"
              class="h-11 w-11 rounded-xl object-contain"
            />
            <span
              v-else
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light"
            >
              <BaseIcon name="shield" size="lg" />
            </span>
            <span>{{ tenant.brandName }}</span>
          </div>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import authBg from '~/assets/img/auth-bg.svg'

const tenant = useTenantStore()
const year = new Date().getFullYear()
</script>
