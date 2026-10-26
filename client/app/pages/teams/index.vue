<template>
  <div class="space-y-6">
    <PageHeader title="ໂຄງສ້າງທີມ" description="ຈັດການສາຍງານ ແລະ ໂຄງສ້າງຕົວແທນ.">
      <template #actions>
        <BaseButton icon="group_add" @click="openCreate">ສ້າງທີມ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="ທີມທັງໝົດ" :value="format.number(stats.total)" icon="diversity_3" />
      <StatCard label="ສະມາຊິກລວມ" :value="format.number(stats.members)" icon="groups" />
      <StatCard label="ຍອດຂາຍລວມ" :value="format.currency(stats.sales)" icon="payments" highlight />
    </div>

    <div v-if="pending" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BaseSkeleton v-for="index in 3" :key="index" height="xl" />
    </div>
    <ErrorState v-else-if="error" :message="error" @retry="refresh" />
    <EmptyState
      v-else-if="!items.length"
      title="ບໍ່ມີທີມ"
      description="ສ້າງທີມໃໝ່ເພື່ອເລີ່ມຕົ້ນ."
    />
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BaseCard v-for="team in items" :key="team.id">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold">{{ team.name }}</h2>
            <StatusBadge :status="team.status" />
          </div>
        </template>
        <div class="flex items-center gap-3">
          <BaseAvatar :name="team.headName" size="md" />
          <div>
            <p class="text-sm font-bold">{{ team.headName }}</p>
            <p class="text-xs text-muted">{{ team.location }}</p>
          </div>
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-xs text-muted">ສະມາຊິກ</dt>
            <dd class="mt-1 font-bold">{{ team.members }} ຄົນ</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">ຍອດເດືອນນີ້</dt>
            <dd class="mt-1 font-bold tabular-nums">{{ format.currency(team.monthlySales) }}</dd>
          </div>
        </dl>
      </BaseCard>
    </div>

    <BaseModal v-model="createOpen" title="ສ້າງທີມໃໝ່" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.name" label="ຊື່ທີມ" required :error="errors.name" />
        <BaseSelect v-model="form.headName" label="ຫົວໜ້າທີມ" :options="agentOptions" />
        <BaseInput v-model="form.location" label="ພື້ນທີ່ / ສາຂາ" placeholder="ວຽງຈັນ" />
        <BaseInput
          v-model="form.members"
          type="number"
          label="ຈຳນວນສະມາຊິກ"
          min="0"
          :error="errors.members"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="saveTeam">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useTeams } from '~/composables/api/useTeams'
import { useAgents } from '~/composables/api/useAgents'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ໂຄງສ້າງທີມ',
  permission: 'team.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, pending, error, refresh, create } = useTeams()
const { items: agents } = useAgents({ pageSize: 100, querySync: false })

const stats = computed(() => ({
  total: total.value,
  members: items.value.reduce((sum, team) => sum + (Number(team.members) || 0), 0),
  sales: items.value.reduce((sum, team) => sum + (Number(team.monthlySales) || 0), 0),
}))

const agentOptions = computed(() => [
  { value: '', label: 'ບໍ່ກຳນົດ' },
  ...agents.value.map((agent) => ({ value: agent.name, label: agent.name })),
])

const createOpen = ref(false)
const saving = ref(false)
const form = reactive({ name: '', headName: '', location: '', members: 0 })
const errors = reactive({ name: '', members: '' })

const openCreate = () => {
  Object.assign(form, { name: '', headName: '', location: '', members: 0 })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  createOpen.value = true
}

const saveTeam = async () => {
  errors.name = required(form.name)
  errors.members = form.members ? validate(form.members, [numeric]) : ''
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    await create({
      name: form.name.trim(),
      headName: form.headName,
      location: form.location.trim(),
      members: Number(form.members) || 0,
    })
    createOpen.value = false
    refresh()
    toast.success('ສ້າງທີມສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງທີມໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
