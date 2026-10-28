<template>
  <div class="space-y-6">
    <PageHeader
      :title="agent?.name || 'ລາຍລະອຽດຕົວແທນ'"
      :description="agent ? `${agent.code} · ${agent.teamName}` : 'ກຳລັງໂຫຼດຂໍ້ມູນ'"
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton icon="edit" @click="toast.info('ຟອມແກ້ໄຂຈະມາໃນໄວໆນີ້')">ແກ້ໄຂ</BaseButton>
      </template>
    </PageHeader>

    <BaseSkeleton v-if="pending" height="xl" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="agent">
      <div class="grid gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center gap-3">
              <BaseAvatar :name="agent.name" size="lg" />
              <div>
                <h2 class="text-lg font-bold">{{ agent.name }}</h2>
                <p class="text-sm text-muted">{{ agent.teamName }}</p>
              </div>
            </div>
          </template>
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted">ລະຫັດຕົວແທນ</dt>
              <dd class="mt-1 font-mono text-sm font-bold">{{ agent.code }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ລະດັບ</dt>
              <dd class="mt-1 text-sm font-bold">{{ agent.level }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເບີໂທ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.phone(agent.phone) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ອີເມວ</dt>
              <dd class="mt-1 text-sm font-bold">{{ agent.email }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ຄອມມິດຊັ່ນ</dt>
              <dd class="mt-1 text-sm font-bold text-success">{{ agent.commissionRate }}%</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ວົງເງິນສິນເຊື່ອ</dt>
              <dd class="mt-1 text-sm font-bold">{{ format.currency(agent.creditLimit) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ຄະແນນສະສົມ</dt>
              <dd class="mt-1 text-sm font-bold text-primary-text">
                {{ format.number(agent.points || 0) }} Point
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ຄອມມິດຊັ່ນຄ້າງຈ່າຍ</dt>
              <dd class="mt-1 text-sm font-bold text-warning">
                {{ format.currency(agent.commissionBalance || 0) }}
              </dd>
            </div>
          </dl>
        </BaseCard>

        <div class="space-y-6">
          <StatCard
            label="ຍອດຂາຍສະສົມ"
            :value="format.currency(agent.salesYtd)"
            icon="payments"
            highlight
          />
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ເປົ້າໝາຍຍອດຂາຍ</h2>
            </template>
            <p class="text-sm font-bold tabular-nums">
              {{ format.currency(agent.salesYtd) }} / {{ format.currency(agent.salesTarget) }}
            </p>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${progress}%` }" />
            </div>
            <p class="mt-2 text-xs text-muted">{{ progress }}% ຂອງເປົ້າໝາຍ</p>
          </BaseCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAgents } from '~/composables/api/useAgents'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດຕົວແທນ',
  permission: 'agent.view',
})

const route = useRoute()
const router = useRouter()
const format = useFormat()
const toast = useToast()
const { getById } = useAgents({ immediate: false })

const agent = ref(null)
const pending = ref(true)
const error = ref('')

const progress = computed(() => {
  if (!agent.value?.salesTarget) return 0
  return Math.min(100, Math.round((agent.value.salesYtd / agent.value.salesTarget) * 100))
})

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    agent.value = await getById(route.params.id)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

onMounted(load)
</script>
