<template>
  <div class="space-y-6">
    <PageHeader title="ຕັ້ງຄ່າລະບົບ" description="ຄຸ້ມຄອງ ແລະ ປັບແຕ່ງການເຮັດວຽກຂອງລະບົບ." />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="setting in settings"
        :key="setting.title"
        type="button"
        class="rounded-xl border border-line bg-surface p-5 text-left shadow-card transition-colors hover:border-primary"
        @click="toast.info(setting.title)"
      >
        <span
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
        >
          <BaseIcon :name="setting.icon" size="lg" />
        </span>
        <p class="mt-4 text-sm font-bold">{{ setting.title }}</p>
        <p class="mt-1 text-xs text-muted">{{ setting.description }}</p>
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <BaseCard>
        <template #header>
          <h2 class="text-sm font-bold">ຮູບແບບການສະແດງຜົນ</h2>
        </template>
        <BaseSwitch
          :model-value="ui.isDark"
          label="Dark mode"
          description="ປ່ຽນຮູບແບບສີຂອງລະບົບ"
          @update:model-value="ui.toggleTheme()"
        />
      </BaseCard>

      <BaseCard>
        <template #header>
          <h2 class="text-sm font-bold">ຂໍ້ມູນລະບົບ</h2>
        </template>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ເວີຊັນ</dt>
            <dd class="font-bold">1.0.0</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ສະຖານະລະບົບ</dt>
            <dd>
              <BaseBadge :tone="config.public.useMock ? 'warning' : 'success'">
                {{ config.public.useMock ? 'Mock Mode' : 'Live API (ຂໍ້ມູນຈິງ)' }}
              </BaseBadge>
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ພາສາ</dt>
            <dd class="font-bold">ລາວ</dd>
          </div>
        </dl>
      </BaseCard>
    </div>

    <BaseCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold">ການສະແດງຈຳນວນເງິນ</h2>
            <p class="mt-0.5 text-xs text-muted">
              ຄ່າເລີ່ມຕົ້ນສຳລັບຜູ້ໃຊ້ໃນບໍລິສັດ. ຜູ້ໃຊ້ສາມາດກຳນົດສ່ວນຕົວໄດ້ໃນໜ້າໂປຣໄຟລ໌.
            </p>
          </div>
          <BaseBadge tone="primary">Tenant default</BaseBadge>
        </div>
      </template>

      <CurrencyDisplayFields v-model="currencyForm" />

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p class="text-xs text-muted">ຖ້າຜູ້ໃຊ້ຕັ້ງຄ່າສ່ວນຕົວໄວ້ ລະບົບຈະໃຊ້ຄ່າສ່ວນຕົວນັ້ນກ່ອນ.</p>
        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            size="sm"
            icon="refresh"
            :loading="resetting"
            @click="resetCurrency"
          >
            ລ້າງຄ່າ
          </BaseButton>
          <BaseButton icon="save" size="sm" :loading="savingCurrency" @click="saveCurrency">
            ບັນທຶກ
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useTenantSettings } from '~/composables/api/useTenantSettings'
import { useToast } from '~/composables/useToast'
import { useTenantStore } from '~/stores/tenant'
import { useUiStore } from '~/stores/ui'
import { DEFAULT_CURRENCY_DISPLAY, normalizeCurrencyDisplay } from '~/utils/currencyDisplay'

definePageMeta({
  layout: 'admin',
  title: 'ຕັ້ງຄ່າລະບົບ',
  permission: 'settings.manage',
})

const config = useRuntimeConfig()
const ui = useUiStore()
const toast = useToast()
const tenant = useTenantStore()
const { updateCurrencyDisplay } = useTenantSettings()

const currencyForm = ref({ ...DEFAULT_CURRENCY_DISPLAY })
const savingCurrency = ref(false)
const resetting = ref(false)

const syncCurrencyForm = () => {
  currencyForm.value = normalizeCurrencyDisplay(tenant.currencyDisplay) || {
    ...DEFAULT_CURRENCY_DISPLAY,
  }
}

watch(() => tenant.currencyDisplay, syncCurrencyForm, { immediate: true })

const saveCurrency = async () => {
  savingCurrency.value = true
  try {
    await updateCurrencyDisplay({ ...currencyForm.value })
    toast.success('ບັນທຶກການສະແດງເງິນສຳເລັດ')
  } catch (error) {
    toast.error(error?.message || 'ບໍ່ສາມາດບັນທຶກການສະແດງເງິນໄດ້')
  } finally {
    savingCurrency.value = false
  }
}

const resetCurrency = async () => {
  if (!window.confirm('ລ້າງຄ່າການສະແດງເງິນຂອງບໍລິສັດ ແລະ ກັບໄປໃຊ້ຄ່າເລີ່ມຕົ້ນ?')) return
  resetting.value = true
  try {
    await updateCurrencyDisplay(null)
    currencyForm.value = { ...DEFAULT_CURRENCY_DISPLAY }
    toast.success('ລ້າງຄ່າແລ້ວ')
  } catch (error) {
    toast.error(error?.message || 'ບໍ່ສາມາດລ້າງຄ່າໄດ້')
  } finally {
    resetting.value = false
  }
}

const settings = [
  { title: 'ຂໍ້ມູນບໍລິສັດ', description: 'ທີ່ຢູ່, ເບີໂທ, ໂລໂກ້', icon: 'business' },
  { title: 'ຈັດການສິດທິ', description: 'Role ແລະ ການເຂົ້າເຖິງ', icon: 'verified_user' },
  { title: 'ການແຈ້ງເຕືອນ', description: 'Email ແລະ SMS Alerts', icon: 'notifications_active' },
  { title: 'Backup ຂໍ້ມູນ', description: 'ສຳຮອງ ແລະ ກູ້ຄືນ', icon: 'cloud_upload' },
]
</script>
