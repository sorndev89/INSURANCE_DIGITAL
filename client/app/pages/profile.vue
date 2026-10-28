<template>
  <div class="space-y-6">
    <PageHeader title="ໂປຣໄຟລ໌" description="ຂໍ້ມູນຜູ້ໃຊ້ ແລະ ການຕັ້ງຄ່າສ່ວນຕົວ." />

    <div class="grid gap-6 lg:grid-cols-3">
      <BaseCard class="lg:col-span-1">
        <div class="flex flex-col items-center text-center">
          <BaseAvatar :src="auth.user?.avatar" :name="auth.displayName" size="xl" />
          <h2 class="mt-3 text-lg font-bold">{{ auth.displayName }}</h2>
          <p class="mt-1 text-sm text-muted">{{ auth.roleLabel }}</p>
          <BaseBadge class="mt-3" tone="success" dot>ໃຊ້ງານຢູ່</BaseBadge>
        </div>
        <dl class="mt-6 space-y-3 border-t border-line pt-4 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ອີເມວ</dt>
            <dd class="truncate font-bold">{{ auth.user?.email || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ເບີໂທ</dt>
            <dd class="font-bold">{{ auth.user?.phone || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ສິດທິ</dt>
            <dd class="font-bold">
              {{ auth.permissions.includes('*') ? 'ທັງໝົດ' : `${auth.permissions.length} ລາຍການ` }}
            </dd>
          </div>
        </dl>
      </BaseCard>

      <BaseCard class="lg:col-span-2">
        <template #header>
          <h2 class="text-sm font-bold">ຂໍ້ມູນສ່ວນຕົວ</h2>
        </template>
        <form class="space-y-4" @submit.prevent="save">
          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput v-model="form.name" label="ຊື່ ແລະ ນາມສະກຸນ" required />
            <BaseInput v-model="form.phone" label="ເບີໂທ" prefix-icon="phone" />
            <BaseInput
              v-model="form.email"
              type="email"
              label="ອີເມວ"
              prefix-icon="mail"
              disabled
            />
            <BaseInput v-model="form.role" label="ບົດບາດ" disabled />
          </div>
          <div class="flex justify-end">
            <BaseButton type="submit" icon="save" :loading="saving">ບັນທຶກ</BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>

    <BaseCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold">ຄະແນນສະສົມ & ຄອມມິດຊັ່ນ</h2>
            <p class="mt-0.5 text-xs text-muted">
              1 ສັນຍາ = 5,000 Point ມູນຄ່າ 3,000 ກີບ · ຄອມມິດຊັ່ນ 5%
            </p>
          </div>
          <BaseBadge tone="primary">{{ auth.roleLabel }}</BaseBadge>
        </div>
      </template>

      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ຄະແນນສະສົມ</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-primary-text">
            {{ format.number(pointsBalance) }}
          </p>
          <p class="mt-0.5 text-xs text-muted">Point</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ມູນຄ່າຄະແນນ</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-success">
            {{ format.currency(pointsValue) }}
          </p>
          <p class="mt-0.5 text-xs text-muted">ແລກເປັນເງິນສົດໄດ້</p>
        </div>
        <div class="rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-xs text-muted">ຄອມມິດຊັ່ນຄ້າງຈ່າຍ</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-warning">
            {{ format.currency(commissionBalance) }}
          </p>
          <p class="mt-0.5 text-xs text-muted">ໂອນເຂົ້າ BCEL ອັດຕະໂນມັດ</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        <p class="text-xs text-muted">
          ແລກຄະແນນເປັນເງິນສົດ ຫຼື ຂອງລາງວັນ (Mockup)
        </p>
        <BaseButton variant="secondary" icon="redeem" @click="redeemPoints">
          ແລກຄະແນນ
        </BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold">ການສະແດງຈຳນວນເງິນ</h2>
            <p class="mt-0.5 text-xs text-muted">
              ເລືອກໃຊ້ຄ່າຂອງບໍລິສັດ ຫຼື ກຳນົດການສະແດງເງິນສ່ວນຕົວສຳລັບບັນຊີນີ້.
            </p>
          </div>
          <BaseBadge :tone="useTenantDefault ? 'neutral' : 'primary'">
            {{ useTenantDefault ? 'ໃຊ້ຄ່າບໍລິສັດ' : 'ກຳນົດເອງ' }}
          </BaseBadge>
        </div>
      </template>

      <BaseSwitch
        v-model="useTenantDefault"
        label="ໃຊ້ຄ່າການສະແດງເງິນຂອງບໍລິສັດ"
        description="ປິດເພື່ອກຳນົດ symbol ແລະ ຕຳແໜ່ງເອງ"
      />

      <div v-if="useTenantDefault" class="mt-4 rounded-xl border border-line bg-surface-muted p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-muted">ຄ່າຂອງບໍລິສັດ</p>
        <p class="mt-1 text-xl font-bold tabular-nums text-primary-text">
          {{ tenantDefaultPreview }}
        </p>
      </div>
      <CurrencyDisplayFields v-else v-model="customForm" class="mt-4" />

      <div class="mt-5 flex justify-end border-t border-line pt-4">
        <BaseButton icon="save" size="sm" @click="saveCurrency">ບັນທຶກການຕັ້ງຄ່າສ່ວນຕົວ</BaseButton>
      </div>
    </BaseCard>

    <BaseCard>
      <template #header>
        <h2 class="text-sm font-bold">ການຕັ້ງຄ່າ</h2>
      </template>
      <div class="space-y-4">
        <BaseSwitch
          :model-value="ui.isDark"
          label="Dark mode"
          description="ປ່ຽນຮູບແບບສີຂອງລະບົບ"
          @update:model-value="ui.toggleTheme()"
        />
        <div class="flex items-center justify-between border-t border-line pt-4">
          <div>
            <p class="text-sm font-bold text-danger">ອອກຈາກລະບົບ</p>
            <p class="text-xs text-muted">ລຶບ session ໃນອຸປະກອນນີ້</p>
          </div>
          <BaseButton variant="danger" icon="logout" @click="logout">ອອກຈາກລະບົບ</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAuth } from '~/composables/api/useAuth'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { useUiStore } from '~/stores/ui'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { pointsToKip } from '~/utils/points'
import { agents } from '~/mocks/agents'
import {
  DEFAULT_CURRENCY_DISPLAY,
  clearUserCurrencyDisplay,
  formatCurrency,
  normalizeCurrencyDisplay,
  setUserCurrencyDisplay,
  userCurrencyDisplay,
} from '~/utils/currencyDisplay'

definePageMeta({
  layout: 'admin',
  title: 'ໂປຣໄຟລ໌',
  permission: 'profile.view',
})

const auth = useAuthStore()
const tenant = useTenantStore()
const ui = useUiStore()
const toast = useToast()
const format = useFormat()
const { logout: signOut, updateProfile } = useAuth()
const saving = ref(false)

const agentRecord = computed(() =>
  agents.find((agent) => agent.userId && String(agent.userId) === String(auth.user?.id)),
)
const pointsBalance = computed(() => {
  if (agentRecord.value) return agentRecord.value.points || 0
  if (auth.role === 'customer') return 10000
  return 0
})
const commissionBalance = computed(() => agentRecord.value?.commissionBalance || 0)
const pointsValue = computed(() => pointsToKip(pointsBalance.value))

const redeemPoints = () => {
  toast.info('ໂໝດ Mockup: ຄຳຮ້ອງແລກຄະແນນຖືກສົ່ງເຂົ້າລະບົບແລ້ວ')
}

const tenantDisplay = computed(
  () => normalizeCurrencyDisplay(tenant.currencyDisplay) || { ...DEFAULT_CURRENCY_DISPLAY },
)
const tenantDefaultPreview = computed(() => formatCurrency(12850000, tenantDisplay.value))
const storedUserDisplay = normalizeCurrencyDisplay(userCurrencyDisplay.value)
const useTenantDefault = ref(!storedUserDisplay)
const customForm = ref(storedUserDisplay || { ...tenantDisplay.value })

watch(userCurrencyDisplay, (value) => {
  const normalized = normalizeCurrencyDisplay(value)
  if (normalized) {
    useTenantDefault.value = false
    customForm.value = normalized
  } else {
    useTenantDefault.value = true
  }
})

watch(useTenantDefault, (value) => {
  if (!value && !normalizeCurrencyDisplay(userCurrencyDisplay.value)) {
    customForm.value = { ...tenantDisplay.value }
  }
})

const saveCurrency = () => {
  if (useTenantDefault.value) {
    clearUserCurrencyDisplay()
    toast.success('ໃຊ້ຄ່າການສະແດງເງິນຂອງບໍລິສັດແລ້ວ')
    return
  }
  setUserCurrencyDisplay({ ...customForm.value })
  toast.success('ບັນທຶກການຕັ້ງຄ່າສ່ວນຕົວແລ້ວ')
}

const form = reactive({
  name: auth.displayName,
  phone: auth.user?.phone || '',
  email: auth.user?.email || '',
  role: auth.roleLabel,
})

const save = async () => {
  if (!form.name.trim()) {
    toast.error('ກະລຸນາປ້ອນຊື່')
    return
  }
  saving.value = true
  try {
    await updateProfile({ name: form.name.trim(), phone: form.phone.trim() })
    toast.success('ບັນທຶກຂໍ້ມູນສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດບັນທຶກໂປຣໄຟລ໌ໄດ້')
  } finally {
    saving.value = false
  }
}

const logout = () => signOut()
</script>
