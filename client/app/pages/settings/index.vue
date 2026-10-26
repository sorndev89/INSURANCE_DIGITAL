<template>
  <div class="space-y-6">
    <PageHeader title="ຕັ້ງຄ່າລະບົບ" description="ຄຸ້ມຄອງ ແລະ ປັບແຕ່ງການເຮັດວຽກຂອງລະບົບ." />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="setting in settings"
        :key="setting.title"
        type="button"
        class="rounded-xl border border-line bg-surface p-5 text-left shadow-card transition-colors hover:border-primary"
        @click="toast.info(`${setting.title} (mock)`)"
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
            <dt class="text-muted">ສະຖານະ Mock</dt>
            <dd><BaseBadge tone="success">ເປີດໃຊ້</BaseBadge></dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">ພາສາ</dt>
            <dd class="font-bold">ລາວ</dd>
          </div>
        </dl>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  layout: 'admin',
  title: 'ຕັ້ງຄ່າລະບົບ',
  permission: 'settings.manage',
})

const ui = useUiStore()
const toast = useToast()

const settings = [
  { title: 'ຂໍ້ມູນບໍລິສັດ', description: 'ທີ່ຢູ່, ເບີໂທ, ໂລໂກ້', icon: 'business' },
  { title: 'ຈັດການສິດທິ', description: 'Role ແລະ ການເຂົ້າເຖິງ', icon: 'verified_user' },
  { title: 'ການແຈ້ງເຕືອນ', description: 'Email ແລະ SMS Alerts', icon: 'notifications_active' },
  { title: 'Backup ຂໍ້ມູນ', description: 'ສຳຮອງ ແລະ ກູ້ຄືນ', icon: 'cloud_upload' },
]
</script>
