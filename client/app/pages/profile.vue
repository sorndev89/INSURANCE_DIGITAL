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
import { reactive, ref } from 'vue'
import { useAuth } from '~/composables/api/useAuth'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  title: 'ໂປຣໄຟລ໌',
  permission: 'profile.view',
})

const auth = useAuthStore()
const ui = useUiStore()
const toast = useToast()
const { logout: signOut, updateProfile } = useAuth()
const saving = ref(false)

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
