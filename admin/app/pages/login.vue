<script setup>
import { reactive, ref } from 'vue'

definePageMeta({ layout: false })
useHead({ title: 'ເຂົ້າສູ່ລະບົບ' })

const { login } = usePlatformAuth()

const form = reactive({ identifier: '', password: '' })
const pending = ref(false)
const error = ref('')
const showSuperadminAccount =
  import.meta.client &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)

const fillSuperadmin = () => {
  form.identifier = 'superadmin'
  form.password = 'sa123456'
}

const submit = async () => {
  error.value = ''
  pending.value = true
  try {
    await login({ identifier: form.identifier.trim(), password: form.password })
    await navigateTo('/dashboard')
  } catch (requestError) {
    error.value = apiErrorMessage(requestError)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4 py-10 transition-colors">
    <div class="w-full max-w-md">
      <div class="mb-6 flex items-center gap-3">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-base font-black text-white shadow-lg shadow-emerald-700/20"
        >
          IS
        </span>
        <div>
          <p class="text-xl font-extrabold text-foreground tracking-tight">Insurance SaaS</p>
          <p class="text-xs text-muted">Platform Administration Console</p>
        </div>
      </div>

      <form class="sf-card p-6" @submit.prevent="submit">
        <h1 class="text-base font-bold text-slate-900">ເຂົ້າສູ່ລະບົບ Platform</h1>
        <p class="mt-1 text-xs text-slate-500">
          ບັນຊີນີ້ແມ່ນສຳລັບຜູ້ດູແລ SaaS ເທົ່ານັ້ນ (ບໍ່ແມ່ນບັນຊີ tenant).
        </p>

        <div class="mt-5 space-y-4">
          <div>
            <label class="sf-label" for="identifier">ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້</label>
            <input
              id="identifier"
              v-model="form.identifier"
              class="sf-input"
              type="text"
              autocomplete="username"
              required
              placeholder="platform@saiyfon.com ຫຼື platform"
            />
          </div>
          <div>
            <label class="sf-label" for="password">ລະຫັດຜ່ານ</label>
            <input
              id="password"
              v-model="form.password"
              class="sf-input"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        <p
          v-if="error"
          class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
        >
          {{ error }}
        </p>

        <button type="submit" class="sf-btn sf-btn-primary mt-5 w-full" :disabled="pending">
          {{ pending ? 'ກຳລັງເຂົ້າ...' : 'ເຂົ້າສູ່ລະບົບ' }}
        </button>
      </form>

      <div
        v-if="showSuperadminAccount"
        class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
      >
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Superadmin account
        </p>
        <button
          type="button"
          class="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-xs transition-colors hover:border-emerald-400"
          @click="fillSuperadmin"
        >
          <span class="font-bold text-slate-700">superadmin</span>
          <span class="text-slate-500">sa123456</span>
        </button>
        <p class="mt-2 text-[11px] text-emerald-700">ກົດເພື່ອໃສ່ຂໍ້ມູນອັດຕະໂນມັດ</p>
      </div>

      <p class="mt-4 text-center text-[11px] text-slate-400">
        ລະຫັດຜ່ານ bootstrap ຢູ່ໃນ <code>server/.env</code>
      </p>
    </div>
  </div>
</template>
