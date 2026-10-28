<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ປະກັນໄພຂອງຂ້ອຍ"
      description="ສັນຍາທັງໝົດທີ່ອອກແລ້ວ ພ້ອມໃບຢັ້ງຢືນ Digital Certificate ແລະ QR ກວດສອບ."
    >
      <template #actions>
        <BaseButton icon="add_circle" @click="navigateTo('/policies/create')">
          ຊື້ປະກັນໄພໃໝ່
        </BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ສັນຍາທັງໝົດ" :value="format.number(myPolicies.length)" icon="description" />
      <StatCard label="ມີຜົນຢູ່" :value="format.number(activeCount)" icon="verified_user" />
      <StatCard
        label="ໃກ້ໝົດອາຍຸ"
        :value="format.number(expiringCount)"
        icon="schedule"
        trend="30 ວັນ"
        trend-tone="warning"
      />
      <StatCard
        label="ເບ້ຍປະກັນລວມ"
        :value="format.currency(totalPremium)"
        icon="payments"
        highlight
      />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="statusFilter" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="search"
            label="ຄົ້ນຫາສັນຍາ"
            placeholder="ເລກສັນຍາ, ບໍລິສັດ, ລົດ..."
          />
        </div>
      </template>
    </FilterBar>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="list">
      <article
        v-for="policy in filteredPolicies"
        :key="policy.id"
        role="listitem"
        class="rounded-xl border border-line bg-surface p-4 shadow-card transition-all hover:border-primary"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-mono text-xs font-bold text-primary-text">{{ policy.policyNumber }}</p>
            <p class="mt-1 truncate text-sm font-bold">{{ policy.productName }}</p>
            <p class="text-xs text-muted">{{ policy.companyCode }} · {{ policy.companyName }}</p>
          </div>
          <StatusBadge :status="policy.status" />
        </div>

        <dl class="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
          <div class="flex justify-between gap-2">
            <dt class="text-muted">ຜູ້ເອົາປະກັນ</dt>
            <dd class="truncate font-bold">{{ policy.customerName }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-muted">ລົດ / ທະບຽນ</dt>
            <dd class="truncate font-bold">{{ policy.vehiclePlate || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-muted">ໄລຍະຄຸ້ມຄອງ</dt>
            <dd class="font-bold">{{ format.date(policy.startDate) }} – {{ format.date(policy.endDate) }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-muted">ເບ້ຍລວມສຸດທິ</dt>
            <dd class="font-bold tabular-nums text-primary-text">
              {{ format.currency(policy.totalPremium) }}
            </dd>
          </div>
        </dl>

        <div class="mt-3 flex justify-end gap-1">
          <BaseButton variant="ghost" size="sm" icon="qr_code_2" @click="openCertificate(policy)">
            ໃບຢັ້ງຢືນ
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            icon="visibility"
            @click="navigateTo(`/policies/${policy.id}`)"
          >
            ລາຍລະອຽດ
          </BaseButton>
        </div>
      </article>
    </div>

    <EmptyState v-if="!filteredPolicies.length" title="ບໍ່ພົບສັນຍາ" />

    <BaseModal
      :model-value="Boolean(certificatePolicy)"
      title="ໃບຢັ້ງຢືນສັນຍາ"
      size="md"
      @update:model-value="certificatePolicy = null"
    >
      <div v-if="certificatePolicy" class="space-y-4">
        <div class="rounded-xl bg-primary p-4 text-white">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-xs text-white/80">Digital Certificate</p>
              <p class="text-lg font-bold">ໃບຢັ້ງຢືນສັນຍາປະກັນໄພ</p>
            </div>
            <p class="font-mono text-sm font-bold">{{ certificateNo(certificatePolicy) }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-[1fr_130px]">
          <dl class="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted">ເລກສັນຍາ</dt>
              <dd class="font-mono font-bold">{{ certificatePolicy.policyNumber }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ຜູ້ເອົາປະກັນ</dt>
              <dd class="font-bold">{{ certificatePolicy.customerName }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ບໍລິສັດ</dt>
              <dd class="font-bold">{{ certificatePolicy.companyCode }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ແຜນ</dt>
              <dd class="font-bold">{{ certificatePolicy.productName }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ລົດ</dt>
              <dd class="font-bold">
                {{ certificatePolicy.vehicle?.make }} {{ certificatePolicy.vehicle?.model }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ທະບຽນ</dt>
              <dd class="font-bold">{{ certificatePolicy.vehiclePlate || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ເລີ່ມຄຸ້ມຄອງ</dt>
              <dd class="font-bold">{{ format.date(certificatePolicy.startDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">ໝົດອາຍຸ</dt>
              <dd class="font-bold">{{ format.date(certificatePolicy.endDate) }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-xs text-muted">ຍອດລວມສຸດທິ</dt>
              <dd class="text-lg font-bold text-primary-text">
                {{ format.currency(certificatePolicy.totalPremium) }}
              </dd>
            </div>
          </dl>
          <div class="flex flex-col items-center justify-center rounded-xl border border-line bg-surface-muted p-3">
            <img :src="qrImage" alt="QR ກວດສອບ" class="w-28" />
            <p class="mt-1 text-center text-[10px] font-bold text-muted">ສະແກນກວດສອບ</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" icon="print" @click="printCertificate">ພິມ</BaseButton>
          <BaseButton icon="check" @click="certificatePolicy = null">ປິດ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import qrImage from '~/assets/img/qr-placeholder.svg'
import { policies } from '~/mocks/policies'
import { agents } from '~/mocks/agents'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ປະກັນໄພຂອງຂ້ອຍ',
  permission: 'policy.view',
})

const auth = useAuthStore()
const format = useFormat()

const search = ref('')
const statusFilter = ref('')
const certificatePolicy = ref(null)

const myAgent = computed(() =>
  agents.find((agent) => agent.userId && String(agent.userId) === String(auth.user?.id)),
)

const myPolicies = computed(() => {
  if (auth.role === 'agent') {
    return policies.filter((policy) => policy.agentId === myAgent.value?.id)
  }
  if (auth.role === 'customer') {
    return policies.filter((policy) => policy.customerId === auth.user?.id)
  }
  return policies
})

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: myPolicies.value.length },
  { key: 'active', label: 'ມີຜົນ' },
  { key: 'pending', label: 'ລໍຖ້າ' },
  { key: 'expired', label: 'ໝົດອາຍຸ' },
])

const filteredPolicies = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return myPolicies.value.filter((policy) => {
    if (statusFilter.value && policy.status !== statusFilter.value) return false
    if (!keyword) return true
    return [
      policy.policyNumber,
      policy.customerName,
      policy.companyCode,
      policy.productName,
      policy.vehiclePlate,
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const activeCount = computed(
  () => myPolicies.value.filter((policy) => policy.status === 'active').length,
)
const expiringCount = computed(() => {
  const now = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 30)
  return myPolicies.value.filter((policy) => {
    const date = new Date(`${policy.endDate}T12:00:00`)
    return date >= now && date <= end
  }).length
})
const totalPremium = computed(() =>
  myPolicies.value.reduce((sum, policy) => sum + (policy.totalPremium || 0), 0),
)

const certificateNo = (policy) => `WEC-${String(policy.id).padStart(6, '0')}`
const openCertificate = (policy) => {
  certificatePolicy.value = policy
}
const printCertificate = () => {
  if (import.meta.client) window.print()
}
</script>
