<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      :title="policy?.policyNumber || 'ລາຍລະອຽດກົມມະທັນ'"
      :description="
        policy
          ? `${policy.productName} · ${policy.companyName || 'ບໍລິສັດຄູ່ຄ້າ'}`
          : 'ກຳລັງໂຫຼດຂໍ້ມູນ'
      "
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="router.back()">ກັບຄືນ</BaseButton>
        <BaseButton variant="secondary" icon="print" @click="printPolicy">ພິມໃບຢັ້ງຢືນ</BaseButton>
        <BaseButton v-if="policy" icon="autorenew" @click="renew">ຕໍ່ອາຍຸ</BaseButton>
      </template>
    </PageHeader>

    <div v-if="pending" class="grid gap-4 lg:grid-cols-3">
      <BaseSkeleton v-for="index in 3" :key="index" height="xl" class="lg:col-span-1" />
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="load" />

    <template v-else-if="policy">
      <!-- Header Banner Card -->
      <BaseCard flush>
        <div
          class="flex flex-col gap-3 p-3.5 sm:p-5 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3 sm:gap-4">
            <span
              class="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary-text"
            >
              <BaseIcon name="verified_user" size="xl" />
            </span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold">{{ policy.policyNumber }}</h2>
                <StatusBadge :status="policy.status" />
                <span
                  v-if="policy.insurerPolicyNumber"
                  class="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-mono font-bold text-primary-text"
                >
                  ເລກບໍລິສັດ: {{ policy.insurerPolicyNumber }}
                </span>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ policy.customerName }} · ຕົວແທນ: {{ policy.agentName || '—' }} · ຄູ່ຄ້າ:
                {{ policy.companyName }}
              </p>
            </div>
          </div>
          <div class="text-left md:text-right">
            <p class="text-xs text-muted">ເບ້ຍປະກັນລວມສຸດທິ</p>
            <p class="text-2xl font-bold tabular-nums text-primary-text">
              {{ format.currency(policy.totalPremium) }}
            </p>
          </div>
        </div>
      </BaseCard>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div class="space-y-4 sm:space-y-6 lg:col-span-2">
          <!-- ຂໍ້ມູນຜູ້ເອົາປະກັນ & ຜູ້ຮັບຜົນປະໂຫຍດ -->
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ຂໍ້ມູນຜູ້ເອົາປະກັນ ແລະ ຜູ້ຮັບຜົນປະໂຫຍດ</h2>
            </template>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-muted">ຊື່ຜູ້ເອົາປະກັນ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.customerName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ເບີໂທລະສັບ</dt>
                <dd class="mt-1 text-sm font-bold">{{ format.phone(policy.customerPhone) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ປະເພດລູກຄ້າ</dt>
                <dd class="mt-1 text-sm font-bold">
                  {{
                    policy.customerType === 'corporate' ? 'ນິຕິບຸກຄົນ / ບໍລິສັດ' : 'ບຸກຄົນທົ່ວໄປ'
                  }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ຕົວແທນຂາຍຜູ້ດູແລ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.agentName || '—' }}</dd>
              </div>
              <div
                v-if="policy.beneficiary?.name"
                class="sm:col-span-2 rounded-lg border border-line bg-surface-muted p-3"
              >
                <span class="text-xs text-muted font-semibold">ຜູ້ຮັບຜົນປະໂຫຍດ:</span>
                <span class="ml-2 text-sm font-bold">{{ policy.beneficiary.name }}</span>
                <span v-if="policy.beneficiary.relation" class="text-xs text-muted ml-1">
                  ({{ policy.beneficiary.relation }})
                </span>
              </div>
            </dl>
          </BaseCard>

          <!-- ລາຍລະອຽດຄວາມຄຸ້ມຄອງ & ຂໍ້ມູນລົດ -->
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ລາຍລະອຽດຄວາມຄຸ້ມຄອງ ແລະ ບໍລິສັດຄູ່ຄ້າ</h2>
            </template>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-muted">ບໍລິສັດປະກັນໄພຜູ້ຮັບປະກັນ</dt>
                <dd class="mt-1 text-sm font-bold text-primary-text">{{ policy.companyName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ເລກກົມມະທັນບໍລິສັດ (Insurer Policy No.)</dt>
                <dd class="mt-1 text-sm font-bold font-mono">
                  {{ policy.insurerPolicyNumber || 'ລໍຖ້າອອກເລກ' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ແຜນປະກັນໄພ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.productName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">ທະບຽນລົດ / ຊັບສິນ</dt>
                <dd class="mt-1 text-sm font-bold">{{ policy.vehiclePlate || '—' }}</dd>
              </div>
              <div v-if="policy.vehicle">
                <dt class="text-xs text-muted">ຍີ່ຫໍ້ / ລຸ້ນ</dt>
                <dd class="mt-1 text-sm font-bold">
                  {{ policy.vehicle.make }} {{ policy.vehicle.model }} ({{ policy.vehicle.year }})
                </dd>
              </div>
              <div v-if="policy.vehicle">
                <dt class="text-xs text-muted">ເລກຈັກ / ເລກຖັງ</dt>
                <dd class="mt-1 font-mono text-xs font-bold">
                  {{ policy.vehicle.engineNumber || '—' }} / {{ policy.vehicle.chassisNumber || '—' }}
                </dd>
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

          <!-- ການຄຳນວນເບ້ຍ ແລະ ໂຄງສ້າງຄ່ານາຍໜ້າ Broker -->
          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ການຄຳນວນເບ້ຍ ແລະ ໂຄງສ້າງລາຍຮັບ Broker & Agent</h2>
            </template>
            <div class="grid gap-6 md:grid-cols-2">
              <!-- ລູກຄ້າ -->
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-muted">ເບ້ຍສຸດທິ (Net Premium)</dt>
                  <dd class="font-bold tabular-nums">{{ format.currency(policy.netPremium) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-muted">ອາກອນມູນຄ່າເພີ່ມ (VAT 7%)</dt>
                  <dd class="font-bold tabular-nums">{{ format.currency(policy.vatAmount) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-muted">ຄ່າທະບຽນ</dt>
                  <dd class="font-bold tabular-nums">
                    {{ format.currency(policy.registrationFee) }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4 border-t border-line pt-3 text-base">
                  <dt class="font-bold">ລວມຍອດລູກຄ້າຈ່າຍ</dt>
                  <dd class="font-bold tabular-nums text-primary-text">
                    {{ format.currency(policy.totalPremium) }}
                  </dd>
                </div>
              </dl>

              <!-- Broker Financials -->
              <div
                class="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 text-xs space-y-2.5"
              >
                <h3 class="font-bold uppercase tracking-wider text-primary-text">
                  Broker Financial Splits
                </h3>
                <div class="flex justify-between">
                  <span class="text-muted">Broker Commission ຮັບຈາກບໍລິສັດ:</span>
                  <span class="font-bold text-success tabular-nums">
                    {{ format.currency(policy.brokerCommissionAmount || policy.netPremium * 0.15) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">ຍອດຕ້ອງນຳສົ່ງບໍລິສັດປະກັນ:</span>
                  <span class="font-bold tabular-nums">
                    {{
                      format.currency(
                        policy.netRemittanceToInsurer ||
                          policy.totalPremium - policy.netPremium * 0.15,
                      )
                    }}
                  </span>
                </div>
                <div class="flex justify-between border-t border-line pt-2">
                  <span class="text-muted">Agent Commission ຈ່າຍຕົວແທນ:</span>
                  <span class="font-bold text-warning tabular-nums">
                    {{ format.currency(policy.agentCommissionAmount || policy.netPremium * 0.05) }}
                  </span>
                </div>
                <div
                  class="flex justify-between font-bold text-primary-text border-t border-line pt-1 text-sm"
                >
                  <span>ກຳໄລສ່ວນຕ່າງ Broker:</span>
                  <span class="tabular-nums">
                    {{ format.currency(policy.brokerNetMargin || policy.netPremium * 0.1) }}
                  </span>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Sidebar / Actions -->
        <div class="space-y-4 sm:space-y-6">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold">Digital Certificate</h2>
                <BaseBadge tone="success">WEC</BaseBadge>
              </div>
            </template>
            <div class="flex flex-col items-center">
              <p class="font-mono text-sm font-bold text-primary-text">
                WEC-{{ String(policy.id).padStart(6, '0') }}
              </p>
              <img :src="qrImage" alt="QR ກວດສອບສັນຍາ" class="mt-2 w-32" />
              <p class="mt-1 text-center text-[11px] text-muted">
                ສະແກນເພື່ອກວດສອບສັນຍາ
              </p>
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <h2 class="text-sm font-bold">ສະຖານະກົມມະທັນ</h2>
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
              <h2 class="text-sm font-bold">ການດຳເນີນການ Broker</h2>
            </template>
            <div class="space-y-2">
              <BaseButton block variant="primary" icon="download" @click="printPolicy">
                ດາວໂຫຼດໃບຢັ້ງຢືນ
              </BaseButton>
              <BaseButton block variant="secondary" icon="print" @click="printPolicy">
                ພິມໃບຢັ້ງຢືນກົມມະທັນ
              </BaseButton>
              <BaseButton block variant="secondary" icon="share" @click="sharePolicy">
                ແຊຣ໌ໃຫ້ລູກຄ້າ
              </BaseButton>
              <BaseButton block variant="danger" icon="cancel" @click="cancelPolicy">
                ຍົກເລີກກົມມະທັນ
              </BaseButton>
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
import qrImage from '~/assets/img/qr-placeholder.svg'
import { usePolicies } from '~/composables/api/usePolicies'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍລະອຽດກົມມະທັນ',
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

const renew = () => toast.info('ເລີ່ມຂະບວນການຕໍ່ອາຍຸ')
const printPolicy = () => {
  if (import.meta.client) window.print()
}
const sharePolicy = () => toast.info('ກຳລັງກະກຽມລິ້ງແຊຣ໌')

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
