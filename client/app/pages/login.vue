<template>
  <div>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">ເຂົ້າສູ່ລະບົບ</h1>
      <p class="mt-2 text-sm text-muted">ຍິນດີຕ້ອນຮັບກັບຄືນ ສູ່ລະບົບຄຸ້ມຄອງການປະກັນໄພ.</p>
    </div>

    <form class="mt-8 space-y-4" novalidate @submit.prevent="submit">
      <div
        v-if="errorMessage"
        class="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm font-bold text-danger"
        role="alert"
        aria-live="polite"
      >
        {{ errorMessage }}
      </div>

      <BaseInput
        v-model="form.email"
        type="email"
        label="ອີເມວ"
        placeholder="name@saiyfon.com"
        prefix-icon="mail"
        autocomplete="username"
        required
        :error="errors.email"
      />
      <BaseInput
        v-model="form.password"
        type="password"
        label="ລະຫັດຜ່ານ"
        placeholder="••••••••"
        prefix-icon="lock"
        autocomplete="current-password"
        required
        :error="errors.password"
      />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <BaseCheckbox v-model="form.remember" label="ຈົດຈຳຂ້ອຍ" />
        <NuxtLink
          to="/forgot-password"
          class="text-sm font-bold text-primary-text transition-colors hover:text-primary-dark"
        >
          ລືມລະຫັດຜ່ານ?
        </NuxtLink>
      </div>

      <BaseButton type="submit" block size="lg" :loading="pending" :disabled="isLocked">
        {{ isLocked ? `ລອງໃໝ່ໃນ ${remaining} ວິນາທີ` : 'ເຂົ້າສູ່ລະບົບ' }}
      </BaseButton>
    </form>

    <div class="mt-6 text-center text-sm text-muted">
      ຍັງບໍ່ມີບັນຊີ?
      <a href="mailto:info@saiyfon.com" class="font-bold text-primary-text hover:text-primary-dark">
        ຕິດຕໍ່ຜູ້ດູແລລະບົບ
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useAuth } from '~/composables/api/useAuth'
import { ROLE_LANDING } from '~/config/permissions'
import { useAuthStore } from '~/stores/auth'
import { email as emailValidator, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  title: 'ເຂົ້າສູ່ລະບົບ',
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { login, pending, error } = useAuth()

const form = reactive({
  email: '',
  password: '',
  remember: true,
})
const errors = reactive({ email: '', password: '' })
const attempts = ref(0)
const lockedUntil = ref(0)
const now = ref(Date.now())

let timer = null

const remaining = computed(() => Math.max(0, Math.ceil((lockedUntil.value - now.value) / 1000)))
const isLocked = computed(() => remaining.value > 0)
const errorMessage = computed(() => error.value || '')

const submit = async () => {
  if (pending.value || isLocked.value) return

  errors.email = validate(form.email, [required, emailValidator])
  errors.password = validate(form.password, [required])
  if (errors.email || errors.password) return

  try {
    await login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    })
    attempts.value = 0
    const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const landing = ROLE_LANDING[auth.role] || '/dashboard'
    const target =
      requested.startsWith('/') && !requested.startsWith('//') ? router.resolve(requested) : null
    const allowed = target ? !target.meta.permission || auth.can(target.meta.permission) : false
    const isAdminArea = requested === '/dashboard' && !['admin', 'staff'].includes(auth.role)
    const redirect = target && allowed && !isAdminArea ? requested : landing
    await navigateTo(redirect)
  } catch {
    attempts.value += 1
    if (attempts.value >= 5) {
      lockedUntil.value = Date.now() + 30_000
      attempts.value = 0
    }
  }
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
