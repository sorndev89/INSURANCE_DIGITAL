<template>
  <div class="flex min-h-[60dvh] items-center justify-center">
    <div class="w-full max-w-lg rounded-xl border border-line bg-surface">
      <ErrorState
        icon="lock"
        title="ບໍ່ມີສິດເຂົ້າເຖິງ"
        message="ທ່ານບໍ່ມີສິດເຂົ້າໜ້ານີ້. ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບ ຫຼື ກັບໜ້າຫຼັກ."
      >
        <BaseButton icon="home" @click="goHome">ກັບໜ້າຫຼັກ</BaseButton>
      </ErrorState>
    </div>
  </div>
</template>

<script setup>
import { useNavigation } from '~/composables/useNavigation'

definePageMeta({
  layout: 'admin',
  title: 'ບໍ່ມີສິດເຂົ້າເຖິງ',
})

const { homeTo } = useNavigation()

const goHome = () => navigateTo(homeTo.value)
</script>
