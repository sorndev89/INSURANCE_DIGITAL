<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ພາບລວມລະບົບ"
      description="ສະຫຼຸບຂໍ້ມູນທຸລະກິດ, ວຽກທີ່ຕ້ອງເຮັດ ແລະ ສະຖິຕິສຳຄັນ."
    >
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="calendar_today"
          @click="toast.info(format.date(new Date()))"
        >
          {{ format.date(new Date()) }}
        </BaseButton>
        <BaseButton icon="add" @click="navigateTo('/policies/create')">ເຮັດປະກັນໄພ</BaseButton>
      </template>
    </PageHeader>

    <ErrorState v-if="error" message="ກະລຸນາລອງໃໝ່" @retry="refresh" />

    <template v-else>
      <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="ຍອດຂາຍເດືອນນີ້"
          :value="format.currency(data?.kpis?.revenueThisMonth || 0)"
          icon="payments"
          :trend="`+${data?.kpis?.revenueTrend || 0}%`"
          hint="ທຽບກັບເດືອນກ່ອນ"
          highlight
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
          label="ອັດຕາເຄມ"
          :value="format.percent(data?.kpis?.claimsRatio || 0, 0)"
          icon="pie_chart"
          trend="ຄວບຄຸມຄວາມສ່ຽງ"
          trend-tone="danger"
          :loading="pending"
        />
        <StatCard
          label="ລໍຖ້າອະນຸມັດ"
          :value="format.number(data?.kpis?.pendingApprovals || 0)"
          icon="assignment"
          trend="ຕ້ອງຕິດຕາມ"
          trend-tone="warning"
          :loading="pending"
        />
      </div>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <BaseCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ສະຖິຕິຍອດຂາຍປະຈຳປີ</h2>
                <p class="mt-0.5 text-xs text-muted">ຍອດຂາຍແຕ່ລະເດືອນ</p>
              </div>
              <BaseBadge tone="neutral">2026</BaseBadge>
            </div>
          </template>
          <div v-if="pending" class="flex h-56 items-end gap-2">
            <BaseSkeleton v-for="index in 12" :key="index" class="flex-1" height="xl" />
          </div>
          <div v-else class="overflow-x-auto no-scrollbar pb-1">
            <div class="flex h-56 min-w-[320px] sm:min-w-0 items-end gap-1.5 sm:gap-2">
              <div
                v-for="item in data?.monthlySales || []"
                :key="item.label"
                class="group flex h-full flex-1 flex-col justify-end gap-2"
              >
                <div
                  class="rounded-t-lg bg-primary/80 transition-all duration-300 group-hover:bg-primary"
                  :style="{ height: `${barHeight(item.value)}%` }"
                  :title="format.currency(item.value)"
                />
                <span class="text-center text-xs text-muted">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ສັດສ່ວນຜະລິດຕະພັນ</h2>
          </template>
          <div v-if="pending" class="space-y-4">
            <BaseSkeleton v-for="index in 4" :key="index" height="lg" />
          </div>
          <div v-else class="space-y-5">
            <div v-for="item in data?.productMix || []" :key="item.key">
              <div class="flex justify-between text-xs font-bold">
                <span class="text-muted">{{ item.label }}</span>
                <span>{{ item.value }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  class="h-full rounded-full"
                  :class="toneClass(item.tone)"
                  :style="{ width: `${item.value}%` }"
                />
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ປະກັນໄພໃກ້ໝົດອາຍຸ</h2>
                <p class="mt-0.5 text-xs text-muted">ໂອກາດຕໍ່ອາຍຸ 30 ວັນ</p>
              </div>
              <NuxtLink to="/policies" class="text-xs font-bold text-primary-text hover:underline"
                >ເບິ່ງທັງໝົດ</NuxtLink
              >
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
              <div class="shrink-0 text-right">
                <p class="text-xs font-bold text-warning">{{ format.date(policy.endDate) }}</p>
                <p class="text-xs text-muted">{{ format.phone(policy.phone) }}</p>
              </div>
            </li>
          </ul>
        </BaseCard>

        <BaseCard flush>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold">ເຄມລ່າສຸດ</h2>
                <p class="mt-0.5 text-xs text-muted">ສະຖານະການດຳເນີນການ</p>
              </div>
              <NuxtLink to="/claims" class="text-xs font-bold text-primary-text hover:underline"
                >ເບິ່ງທັງໝົດ</NuxtLink
              >
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

      <div class="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ຕົວແທນຍອດດີ</h2>
          </template>
          <div v-if="pending" class="space-y-3">
            <BaseSkeleton v-for="index in 3" :key="index" height="lg" />
          </div>
          <ol v-else class="space-y-4">
            <li
              v-for="(agent, index) in data?.topAgents || []"
              :key="agent.id"
              class="flex items-center gap-3"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-text"
              >
                #{{ index + 1 }}
              </span>
              <BaseAvatar :src="agent.avatar" :name="agent.name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold">{{ agent.name }}</p>
                <p class="text-xs text-muted">{{ agent.teamName }}</p>
              </div>
              <p class="text-sm font-bold tabular-nums">{{ format.currency(agent.sales) }}</p>
            </li>
          </ol>
        </BaseCard>

        <BaseCard class="lg:col-span-2" flush>
          <template #header>
            <h2 class="text-sm font-bold">ລາຍການເຄື່ອນໄຫວລ່າສຸດ</h2>
          </template>
          <DataTable
            :bordered="false"
            :columns="transactionColumns"
            :rows="data?.recentTransactions || []"
            :loading="pending"
            :total="data?.recentTransactions?.length || 0"
            :page-size="5"
            caption="ລາຍການເຄື່ອນໄຫວລ່າສຸດ"
          >
            <template #cell-amount="{ value }">
              <span class="font-bold tabular-nums">{{ format.currency(value) }}</span>
            </template>
            <template #cell-status="{ value }">
              <StatusBadge :status="value" />
            </template>
          </DataTable>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { useDashboard } from '~/composables/api/useDashboard'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ພາບລວມລະບົບ',
  permission: 'dashboard.view',
})

const format = useFormat()
const toast = useToast()
const { data, pending, error, refresh } = useDashboard()

const maxSales = computed(() =>
  Math.max(...(data.value?.monthlySales || []).map((item) => item.value), 1),
)

const barHeight = (value) => Math.max(4, Math.round((value / maxSales.value) * 100))

const toneClass = (tone) => {
  if (tone === 'danger') return 'bg-danger'
  if (tone === 'warning') return 'bg-warning'
  if (tone === 'neutral') return 'bg-muted'
  return 'bg-primary'
}

const transactionColumns = [
  { key: 'id', label: 'ເລກທີ' },
  { key: 'customerName', label: 'ລູກຄ້າ', hideOn: ['mobile'] },
  { key: 'type', label: 'ປະເພດ', hideOn: ['mobile'] },
  { key: 'date', label: 'ວັນທີ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right' },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]
</script>
