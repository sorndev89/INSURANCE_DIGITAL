<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader :title="greeting" :description="description">
      <template #actions>
        <BaseButton v-if="canCreatePolicy" icon="add" @click="navigateTo('/policies/create')">
          ເຮັດປະກັນໄພໃໝ່
        </BaseButton>
      </template>
    </PageHeader>

    <ErrorState v-if="error" message="ກະລຸນາລອງໃໝ່" @retry="refresh" />

    <template v-else>
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="ຍອດຂາຍເດືອນນີ້"
          :value="format.currency(data?.kpis?.revenueThisMonth || 0)"
          icon="payments"
          :trend="`+${data?.kpis?.revenueTrend || 0}%`"
          :loading="pending"
        />
        <StatCard
          label="ປະກັນໄພມີຜົນ"
          :value="format.number(data?.kpis?.activePolicies || 0)"
          icon="verified_user"
          :trend="`+${data?.kpis?.activePoliciesTrend || 0}%`"
          :loading="pending"
        />
        <StatCard
          label="ເຄມລໍຖ້າດຳເນີນການ"
          :value="format.number(data?.kpis?.pendingApprovals || 0)"
          icon="assignment_late"
          trend="ຕ້ອງຕິດຕາມ"
          trend-tone="warning"
          :loading="pending"
        />
        <StatCard
          label="ອັດຕາເຄມ"
          :value="format.percent(data?.kpis?.claimsRatio || 0)"
          icon="pie_chart"
          trend="ຄວບຄຸມຄວາມສ່ຽງ"
          trend-tone="danger"
          :loading="pending"
        />
      </div>

      <section class="space-y-2.5 sm:space-y-3">
        <h2 class="text-base sm:text-lg font-bold">ທາງລັດ</h2>
        <div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="flex items-center gap-2 sm:gap-3 rounded-xl border border-line bg-surface p-2.5 sm:p-4 shadow-card transition-all duration-150 active:scale-[0.98] hover:border-primary"
          >
            <span
              class="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary-text"
            >
              <BaseIcon :name="action.icon" size="md" class="sm:hidden" />
              <BaseIcon :name="action.icon" size="lg" class="hidden sm:inline-block" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-xs sm:text-sm font-bold text-foreground">{{
                action.label
              }}</span>
              <span class="mt-0.5 block truncate text-xs text-muted">{{ action.description }}</span>
            </span>
          </NuxtLink>
        </div>
      </section>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ປະກັນໄພໃກ້ໝົດອາຍຸ</h2>
              <NuxtLink to="/policies" class="text-xs font-bold text-primary-text hover:underline">
                ເບິ່ງທັງໝົດ
              </NuxtLink>
            </div>
          </template>
          <div v-if="pending" class="space-y-3 p-4">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ul v-else class="divide-y divide-line">
            <li
              v-for="policy in data?.expiringPolicies || []"
              :key="policy.id"
              class="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-bold">{{ policy.customerName }}</p>
                <p class="text-xs text-muted">
                  {{ policy.policyNumber }} · {{ policy.productName }}
                </p>
              </div>
              <span class="shrink-0 text-xs font-bold text-warning">{{
                format.date(policy.endDate)
              }}</span>
            </li>
          </ul>
        </BaseCard>

        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold">ເຄມລ່າສຸດ</h2>
              <NuxtLink to="/claims" class="text-xs font-bold text-primary-text hover:underline">
                ເບິ່ງທັງໝົດ
              </NuxtLink>
            </div>
          </template>
          <div v-if="pending" class="space-y-3 p-4">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ul v-else class="divide-y divide-line">
            <li
              v-for="claim in data?.recentClaims || []"
              :key="claim.id"
              class="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-bold">{{ claim.claimant }}</p>
                <p class="text-xs text-muted">
                  {{ claim.claimNumber }} · {{ format.currency(claim.amount) }}
                </p>
              </div>
              <StatusBadge :status="claim.status" />
            </li>
          </ul>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useDashboard } from '~/composables/api/useDashboard'
import { useAuthStore } from '~/stores/auth'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ໜ້າຫຼັກ',
  permission: 'profile.view',
})

const auth = useAuthStore()
const format = useFormat()
const { data, pending, error, refresh } = useDashboard()

const canCreatePolicy = computed(() => auth.can('policy.create'))

const greeting = computed(() => {
  const name = auth.displayName
  return `ສະບາຍດີ, ${name}`
})

const description = computed(() => {
  if (auth.role === 'customer') return 'ສະຫຼຸບປະກັນໄພ, ເຄມ ແລະ ການຊຳລະຂອງທ່ານ.'
  if (auth.role === 'agent') return 'ຕິດຕາມຍອດຂາຍ, ລູກຄ້າ ແລະ ຄອມມິດຊັ່ນຂອງທ່ານ.'
  return 'ສະຫຼຸບຂໍ້ມູນທຸລະກິດ ແລະ ວຽກທີ່ຕ້ອງຕິດຕາມ.'
})

const quickActions = computed(() => {
  if (auth.role === 'agent') {
    return [
      {
        label: 'ຂາຍປະກັນໄພ',
        description: 'ສ້າງປະກັນໄພໃໝ່',
        icon: 'add_circle',
        to: '/policies/create',
      },
      {
        label: 'ປະກັນໄພຂອງຂ້ອຍ',
        description: 'ຕິດຕາມສະຖານະ',
        icon: 'description',
        to: '/policies',
      },
      { label: 'ລູກຄ້າ', description: 'ຈັດການຂໍ້ມູນລູກຄ້າ', icon: 'people_alt', to: '/customers' },
      { label: 'ຄອມມິດຊັ່ນ', description: 'ເບິ່ງລາຍໄດ້', icon: 'payments', to: '/commissions' },
    ]
  }
  if (auth.role === 'customer') {
    return [
      {
        label: 'ຊື້ປະກັນໄພ',
        description: 'ເລີ່ມຕົ້ນສະເໜີລາຄາ',
        icon: 'add_circle',
        to: '/policies/create',
      },
      {
        label: 'ປະກັນໄພຂອງຂ້ອຍ',
        description: 'ເບິ່ງການຄຸ້ມຄອງ',
        icon: 'description',
        to: '/policies',
      },
      { label: 'ແຈ້ງເຄມ', description: 'ສົ່ງຄຳຮ້ອງ', icon: 'assignment_late', to: '/claims' },
      { label: 'ໂປຣໄຟລ໌', description: 'ຂໍ້ມູນສ່ວນຕົວ', icon: 'person', to: '/profile' },
    ]
  }
  return [
    { label: 'ປະກັນໄພ', description: 'ຈັດການທັງໝົດ', icon: 'description', to: '/policies' },
    { label: 'ລູກຄ້າ', description: 'ຂໍ້ມູນລູກຄ້າ', icon: 'people_alt', to: '/customers' },
    { label: 'ເຄມ', description: 'ກວດສອບ ແລະ ອະນຸມັດ', icon: 'assignment_late', to: '/claims' },
    { label: 'ລາຍງານ', description: 'ສະຖິຕິທຸລະກິດ', icon: 'analytics', to: '/reports' },
  ]
})
</script>
