<template>
  <div
    v-if="auth.impersonating"
    class="flex flex-wrap items-center justify-between gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning"
    role="status"
    aria-live="polite"
  >
    <p class="font-bold">ທ່ານກຳລັງຢູ່ໃນໂໝດ Impersonation ໂດຍ Superadmin</p>
    <BaseButton size="sm" variant="secondary" icon="logout" @click="exitImpersonation">
      ກັບຄືນ Platform
    </BaseButton>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const config = useRuntimeConfig()

const exitImpersonation = () => {
  const target = config.public.platformUrl || '/login'
  auth.logout()
  if (import.meta.client) {
    window.location.assign(target)
  }
}
</script>
