<template>
  <div
    class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center"
  >
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-muted">
      <BaseIcon name="domain_disabled" size="xl" />
    </div>
    <h1 class="mt-5 text-2xl font-bold">ບໍ່ພົບບໍລິສັດ</h1>
    <p class="mt-3 text-sm leading-relaxed text-muted">
      domain ນີ້ຍັງບໍ່ໄດ້ຜູກກັບບໍລິສັດໃດໃນລະບົບ. ກະລຸນາກວດ domain ຫຼື ຕິດຕໍ່ຜູ້ດູແລລະບົບ.
    </p>
    <p class="mt-2 text-xs text-muted">{{ hostname }}</p>
    <NuxtLink to="/login" class="mt-6">
      <BaseButton variant="secondary" icon="login">ໄປໜ້າເຂົ້າສູ່ລະບົບ</BaseButton>
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank', title: 'ບໍ່ພົບບໍລິສັດ' })

const hostname = ref('')

onMounted(() => {
  hostname.value = window.location.host
})
</script>
