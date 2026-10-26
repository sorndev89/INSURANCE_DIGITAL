<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      :title="policy?.policyNumber || 'ລາຍລະອຽດປະກັນໄພ'"
      :description="policy ? `${policy.productName} · ${policy.companyName}` : 'ກຳລັງໂຫຼດຂໍ້ມູນ'"
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton v-if="policy" icon="autorenew" @click="renew">ຕໍ່ອາຍຸ</BaseButton>
      </template>
    </PageHeader>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-3">
      <BaseSkeleton v-for="index in 3" :key="index" height="xl" class="lg:col-span-1" />
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="policy">
      <BaseCard flush>
        <div
          class="flex flex-col gap-3 p-3.5 sm:p-5 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3 sm:gap-4">
            <span
              class="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary-text"
            >
              <BaseIcon name="description" size="lg" class="sm:hidden" />
              <BaseIcon name="description" size="xl" class="hidden sm:inline-block" />
            </span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold">{{ policy.policyNumber }}</h2>
                <StatusBadge :status="policy.status" />
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ policy.customerName }} · {{ policy.agentName }}
              </p>
            </div>
          </div>
          <div class="text-left md:text-right">
            <p class="text-xs text-muted">ເບ້ຍປະກັນລວມ</p>
            <p class="text-2xl font-bold tabular-nums text-primary-text">
              {{ format.currency(policy.totalPremium) }}
            </p>
          </div>
        </div>
      </BaseCard>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div class="space-y-4 sm:space-y-6 lg:col-span-2">
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ຂໍ້ມູນຜູ້ເອົາປະກັນ</h2>
            </template>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-muted">ຊື່</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.customerName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ເບີໂທ</dt>
                <dd class="mt-1 text-sm font-bold">{{ format.phone(policy.customerPhone) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ຕົວແທນ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.agentName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ບໍລິສັດ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.companyName }}</dd>
              </div>
            </dl>
          </BaseCard>

          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ລາຍລະອຽດຄຸ້ມຄອງ</h2>
            </template>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-muted">ປະເພດປະກັນໄພ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.productName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ທະບຽນລົດ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.vehiclePlate || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ວັນເລີ່ມມີຜົນ</dt>
                <dd class="mt-1 text-sm font-bold">{{ format.date(policy.startDate) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ວັນໝົດອາຍຸ</dt>
                <dd class="mt-1 text-sm font-bold">{{ format.date(policy.endDate) }}</dd>
              </div>
            </dl>
          </BaseCard>

          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ການຄຳນວນເບ້ຍປະກັນ</h2>
            </template>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-muted">ເບ້ຍພື້ນຖານ</dt>
                <dd class="font-bold tabular-nums">{{ format.currency(policy.netPremium) }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-muted">ອາກອນມູນຄ່າເພີ່ມ (7%)</dt>
                <dd class="font-bold tabular-nums">{{ format.currency(policy.vatAmount) }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-muted">ຄ່າທະບຽນ</dt>
                <dd class="font-bold tabular-nums">
                  {{ format.currency(policy.registrationFee) }}
                </dd>
              </div>
              <div class="flex justify-between gap-4 border-t border-line pt-3 text-base">
                <dt class="font-bold">ລວມທັງໝົດ</dt>
                <dd class="font-bold tabular-nums text-primary-text">
                  {{ format.currency(policy.totalPremium) }}
                </dd>
              </div>
            </dl>
          </BaseCard>
        </div>

        <div class="space-y-4 sm:space-y-6">
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ສະຖານະ</h2>
            </template>
            <div class="space-y-4">
              <StatusBadge :status="policy.status" />
              <div>
                <div class="flex justify-between text-xs text-muted">
                  <span>ເຫຼືອ {{ daysLeft }} ວັນ</span>
                  <span>{{ progress }}%</span>
                </div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${progress}%` }" />
                </div>
              </div>
              <p class="text-xs text-muted">ສ້າງເມື່ອ {{ format.date(policy.createdAt) }}</p>
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ການດຳເນີນການ</h2>
            </template>
            <div class="space-y-2">
              <BaseButton block variant="secondary" icon="print" @click="printPolicy"
                >ພິມປະກັນໄພ</BaseButton
              >
              <BaseButton block variant="secondary" icon="share" @click="sharePolicy"
                >ແຊຣ໌</BaseButton
              >
              <BaseButton block variant="danger" icon="cancel" @click="cancelPolicy"
                >ຍົກເລີກ</BaseButton
              >
            </div>
          </BaseCard>
        </div>
      </div>
    </template>

    <EmptyState
      v-else
      icon="search_off"
      title="ບໍ່ພົບປະກັນໄພ"
      description="ປະກັນໄພນີ້ອາດຖືກລຶບ ຫຼື ບໍ່ມີໃນລະບົບ."
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from '#app'
import { usePolicies } from '~/composables/api/usePolicies'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດປະກັນໄພ',
  permission: 'policy.view',
})

const route = useRoute()
const router = useRouter()
const format = useFormat()
const toast = useToast()
const { confirm } = useConfirm()
const { getById, updateStatus, refresh } = usePolicies({ immediate: false })

const policy = ref(null)
const pending = ref(true)
const error = ref('')

const daysLeft = computed(() => {
  if (!policy.value) return 0
  const end = new Date(policy.value.endDate)
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

const progress = computed(() => {
  if (!policy.value) return 0
  const start = new Date(policy.value.startDate).getTime()
  const end = new Date(policy.value.endDate).getTime()
  const now = Date.now()
  if (end <= start) return 0
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
})

const load = async () => {
  pending.value = true
  error.value = ''
  try {
    policy.value = await getById(route.params.id)
  } catch (requestError) {
    error.value = requestError?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    pending.value = false
  }
}

const renew = () => toast.info('ເລີ່ມຂະບວນການຕໍ່ອາຍຸ (mock)')
const printPolicy = () => toast.info('ກຳລັງກະກຽມເອກະສານພິມ (mock)')
const sharePolicy = () => toast.info('ກຳລັງກະກຽມລິ້ງແຊຣ໌ (mock)')

const cancelPolicy = async () => {
  const accepted = await confirm({
    title: 'ຍົກເລີກປະກັນໄພ',
    message: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກປະກັນໄພນີ້?',
    confirmLabel: 'ຍົກເລີກປະກັນໄພ',
    tone: 'danger',
  })
  if (!accepted) return
  await updateStatus(policy.value.id, 'cancelled')
  policy.value.status = 'cancelled'
  toast.success('ຍົກເລີກປະກັນໄພສຳເລັດ')
  refresh()
}

onMounted(load)
</script>
