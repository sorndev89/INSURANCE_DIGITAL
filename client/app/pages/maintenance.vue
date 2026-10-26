<template>
      <div class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <BaseIcon name="construction" size="xl" />
        </div>
        <h1 class="mt-5 text-2xl font-bold">ລະບົບກຳລັງປັບປຸງ</h1>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          ບໍລິການຂອງ {{ tenant.brandName }} ຖືກປິດໃຊ້ງານຊົ່ວຄາວ. ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບ.
        </p>
        <button type="button" class="mt-6" @click="reload">
          <BaseButton variant="secondary" icon="refresh">ລອງໃໝ່</BaseButton>
        </button>
      </div>
</template>

<script setup>
definePageMeta({ layout: 'blank', title: 'ລະບົບກຳລັງປັບປຸງ' })

const tenant = useTenantStore()

const reload = () => {
  if (typeof window !== 'undefined') window.location.reload()
}
</script>
