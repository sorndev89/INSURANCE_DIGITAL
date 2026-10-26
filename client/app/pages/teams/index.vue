<template>
  <div class="space-y-6">
    <PageHeader title="ໂຄງສ້າງທີມ" description="ຈັດການສາຍງານ ແລະ ໂຄງສ້າງຕົວແທນ.">
      <template #actions>
        <BaseButton icon="group_add" @click="toast.info('ຟອມສ້າງທີມຈະມາໃນໄວໆນີ້')"
          >ສ້າງທີມ</BaseButton
        >
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="ທີມທັງໝົດ" :value="format.number(total)" icon="diversity_3" />
      <StatCard label="ສະມາຊິກລວມ" :value="format.number(memberCount)" icon="groups" />
      <StatCard label="ຍອດຂາຍລວມ" :value="format.currency(salesTotal)" icon="payments" highlight />
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTeams } from '~/composables/api/useTeams'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ໂຄງສ້າງທີມ',
  permission: 'team.view',
})

const format = useFormat()
const toast = useToast()
const { items, total, pending, error, refresh } = useTeams()

const memberCount = computed(() =>
  items.value.reduce((sum, team) => sum + (Number(team.members) || 0), 0),
)
const salesTotal = computed(() =>
  items.value.reduce((sum, team) => sum + (Number(team.monthlySales) || 0), 0),
)
</script>
