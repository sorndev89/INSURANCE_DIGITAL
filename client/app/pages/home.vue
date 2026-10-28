<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader :title="greeting" :description="description">
      <template #actions>
        <BaseButton icon="add_circle" @click="navigateTo('/policies/create')">
          ອອກປະກັນໄພໃໝ່
        </BaseButton>
      </template>
    </PageHeader>

    <template v-if="isAgent">
      <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-primary-text">
              ຕົວແທນຂາຍຍ່ອຍ · {{ myAgent?.code || '—' }}
            </p>
            <p class="mt-1 text-lg font-bold">ຄອມມິດຊັ່ນ 5% ອັດຕະໂນມັດ</p>
            <p class="mt-0.5 text-xs text-muted">
              ທຸກສັນຍາທີ່ຂາຍໄດ້ ຈະໄດ້ຮັບຄອມມິດຊັ່ນ ແລະ ຄະແນນ 5,000 Point
            </p>
          </div>
          <BaseBadge tone="success" dot>ໃຊ້ງານຢູ່</BaseBadge>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="ຍອດຂາຍສະສົມ"
          :value="format.currency(myAgent?.salesYtd || 0)"
          icon="payments"
          highlight
        />
        <StatCard
          label="ສັນຍາທີ່ຂາຍໄດ້"
          :value="format.number(myPolicies.length)"
          icon="description"
        />
        <StatCard
          label="ຄອມມິດຊັ່ນຄ້າງຈ່າຍ"
          :value="format.currency(myAgent?.commissionBalance || 0)"
          icon="account_balance_wallet"
        />
        <StatCard
          label="ຄະແນນສະສົມ"
          :value="format.number(myAgent?.points || 0)"
          icon="stars"
        />
      </div>

      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold">ເປົ້າໝາຍຍອດຂາຍປີນີ້</h2>
            <span class="text-xs text-muted">{{ progress }}%</span>
          </div>
        </template>
        <div class="h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${progress}%` }" />
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted">
          <span>{{ format.currency(myAgent?.salesYtd || 0) }}</span>
          <span>{{ format.currency(myAgent?.salesTarget || 0) }}</span>
        </div>
      </BaseCard>
    </template>

    <template v-else>
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="ປະກັນໄພຂອງຂ້ອຍ"
          :value="format.number(myPolicies.length)"
          icon="description"
        />
        <StatCard
          label="ມີຜົນຢູ່"
          :value="format.number(activePolicies.length)"
          icon="verified_user"
          trend="ຄຸ້ມຄອງຢູ່"
        />
        <StatCard
          label="ເບ້ຍປະກັນລວມ"
          :value="format.currency(totalPremium)"
          icon="payments"
          highlight
        />
        <StatCard label="ຄະແນນສະສົມ" :value="format.number(10_000)" icon="stars" />
      </div>
    </template>

    <section class="space-y-2.5 sm:space-y-3">
      <h2 class="text-base font-bold sm:text-lg">ທາງລັດ</h2>
      <div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5 shadow-card transition-all duration-150 hover:border-primary active:scale-[0.98] sm:gap-3 sm:p-4"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text sm:h-11 sm:w-11 sm:rounded-xl"
          >
            <BaseIcon :name="action.icon" size="md" />
          </span>
          <span class="min-w-0">
            <span class="block truncate text-xs font-bold sm:text-sm">{{ action.label }}</span>
            <span class="mt-0.5 block truncate text-xs text-muted">{{ action.description }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <BaseCard flush>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold">ສັນຍາຂອງຂ້ອຍ</h2>
            <NuxtLink
              :to="isAgent ? '/policies' : '/my-policies'"
              class="text-xs font-bold text-primary-text hover:underline"
            >
              ເບິ່ງທັງໝົດ
            </NuxtLink>
          </div>
        </template>
        <ul class="divide-y divide-line">
          <li
            v-for="policy in myPolicies.slice(0, 4)"
            :key="policy.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ policy.customerName }}</p>
              <p class="text-xs text-muted">
                {{ policy.policyNumber }} · {{ policy.companyCode }} · {{ policy.productName }}
              </p>
            </div>
            <StatusBadge :status="policy.status" />
          </li>
          <li v-if="!myPolicies.length" class="px-4 py-6 text-center text-sm text-muted">
            ຍັງບໍ່ມີສັນຍາ
          </li>
        </ul>
      </BaseCard>

      <BaseCard flush>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold">ໂປຣໂມຊັ່ນ ແລະ ຂ່າວສານ</h2>
            <NuxtLink
              to="/marketing-banners"
              class="text-xs font-bold text-primary-text hover:underline"
            >
              ຈັດການ
            </NuxtLink>
          </div>
        </template>
        <ul class="divide-y divide-line">
          <li v-for="banner in activeBanners.slice(0, 3)" :key="banner.id" class="p-4">
            <div class="flex items-start gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text"
              >
                <BaseIcon name="campaign" size="sm" />
              </span>
              <div class="min-w-0">
                <p class="text-sm font-bold">{{ banner.title }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ banner.subtitle }}</p>
                <NuxtLink
                  :to="banner.ctaTo"
                  class="mt-1 inline-block text-xs font-bold text-primary-text hover:underline"
                >
                  {{ banner.ctaLabel }} →
                </NuxtLink>
              </div>
            </div>
          </li>
        </ul>
      </BaseCard>
    </div>

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold">ແຈ້ງເຕືອນວັນເກີດ ແລະ ສັນຍາໃກ້ໝົດອາຍຸ</h2>
          <BaseBadge tone="warning">{{ notifications.length }} ລາຍການ</BaseBadge>
        </div>
      </template>
      <ul class="divide-y divide-line">
        <li
          v-for="item in notifications.slice(0, 4)"
          :key="item.id"
          class="flex items-center gap-3 px-1 py-3"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text"
          >
            <BaseIcon :name="item.icon" size="sm" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold">{{ item.title }}</p>
            <p class="truncate text-xs text-muted">{{ item.message }}</p>
          </div>
          <span class="shrink-0 text-xs font-bold text-warning">{{ format.date(item.date) }}</span>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'
import { useNotifications } from '~/composables/useNotifications'
import { useBanners } from '~/composables/useBanners'
import { agents } from '~/mocks/agents'
import { policies } from '~/mocks/policies'

definePageMeta({
  layout: 'admin',
  title: 'ໜ້າຫຼັກ',
  permission: 'profile.view',
})

const auth = useAuthStore()
const format = useFormat()
const { notifications } = useNotifications()
const { activeBanners } = useBanners()

const isAgent = computed(() => auth.role === 'agent')
const myAgent = computed(() =>
  agents.find((agent) => agent.userId && String(agent.userId) === String(auth.user?.id)),
)

const myPolicies = computed(() => {
  if (isAgent.value) {
    return policies.filter((policy) => policy.agentId === myAgent.value?.id)
  }
  if (auth.role === 'customer') {
    return policies.filter((policy) => policy.customerId === auth.user?.id)
  }
  return policies
})

const activePolicies = computed(() =>
  myPolicies.value.filter((policy) => policy.status === 'active'),
)
const totalPremium = computed(() =>
  myPolicies.value.reduce((sum, policy) => sum + (policy.totalPremium || 0), 0),
)
const progress = computed(() => {
  if (!myAgent.value?.salesTarget) return 0
  return Math.min(
    100,
    Math.round(((myAgent.value.salesYtd || 0) / myAgent.value.salesTarget) * 100),
  )
})

const greeting = computed(() => `ສະບາຍດີ, ${auth.displayName}`)
const description = computed(() => {
  if (isAgent.value) return 'ຕິດຕາມຍອດຂາຍ, ຄອມມິດຊັ່ນ ແລະ ຄະແນນຂອງທ່ານ.'
  if (auth.role === 'customer') return 'ສະຫຼຸບປະກັນໄພ ແລະ ຄະແນນຂອງທ່ານ.'
  return 'ພາບລວມທຸລະກິດ ແລະ ວຽກທີ່ຕ້ອງຕິດຕາມ.'
})

const quickActions = computed(() => {
  if (isAgent.value) {
    return [
      {
        label: 'ຂາຍປະກັນໄພ',
        description: 'ສ້າງສັນຍາໃໝ່',
        icon: 'add_circle',
        to: '/policies/create',
      },
      {
        label: 'ປະກັນໄພຂອງຂ້ອຍ',
        description: 'ຕິດຕາມສະຖານະ',
        icon: 'description',
        to: '/my-policies',
      },
      { label: 'ຄອມມິດຊັ່ນ', description: 'ເບິ່ງລາຍໄດ້', icon: 'payments', to: '/commissions' },
      { label: 'ໂປຣໄຟລ໌', description: 'ຄະແນນ & ຂໍ້ມູນ', icon: 'person', to: '/profile' },
    ]
  }
  return [
    { label: 'ຊື້ປະກັນໄພ', description: 'ອອກສັນຍາໃໝ່', icon: 'add_circle', to: '/policies/create' },
    {
      label: 'ປະກັນໄພຂອງຂ້ອຍ',
      description: 'ເບິ່ງໃບຢັ້ງຢືນ',
      icon: 'verified_user',
      to: '/my-policies',
    },
    { label: 'ແຈ້ງເຕືອນ', description: 'ວັນເກີດ & ໝົດອາຍຸ', icon: 'notifications', to: '/my-policies' },
    { label: 'ໂປຣໄຟລ໌', description: 'ຄະແນນ & ຂໍ້ມູນ', icon: 'person', to: '/profile' },
  ]
})
</script>
