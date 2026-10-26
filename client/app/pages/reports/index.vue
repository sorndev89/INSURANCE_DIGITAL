<template>
  <div class="space-y-6">
    <PageHeader title="ລາຍງານທຸລະກິດ" description="ສະຫຼຸບຜົນການດຳເນີນງານ ແລະ ຕົວຊີ້ວັດສຳຄັນ.">
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="file_download"
          @click="toast.info('ກຳລັງກະກຽມ PDF (mock)')"
          >Export PDF</BaseButton
        >
      </template>
    </PageHeader>

    <BaseCard>
      <DateRangePicker v-model:from="range.from" v-model:to="range.to" label="ໄລຍະລາຍງານ" />
    </BaseCard>

    <ErrorState v-if="error" message="ກະລຸນາລອງໃໝ່" @retry="refresh" />

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ຍອດຂາຍ"
          :value="format.currency(data?.kpis?.revenueThisMonth || 0)"
          icon="payments"
          highlight
          :loading="pending"
        />
        <StatCard
          label="ປະກັນໄພມີຜົນ"
          :value="format.number(data?.kpis?.activePolicies || 0)"
          icon="verified_user"
          :loading="pending"
        />
        <StatCard
          label="ອັດຕາເຄມ"
          :value="format.percent(data?.kpis?.claimsRatio || 0, 0)"
          icon="pie_chart"
          trend-tone="danger"
          :loading="pending"
        />
        <StatCard
          label="ລໍຖ້າອະນຸມັດ"
          :value="format.number(data?.kpis?.pendingApprovals || 0)"
          icon="assignment"
          trend-tone="warning"
          :loading="pending"
        />
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ຍອດຂາຍປະຈຳເດືອນ</h2>
          </template>
          <div v-if="pending" class="flex h-56 items-end gap-2">
            <BaseSkeleton v-for="index in 12" :key="index" class="flex-1" height="xl" />
          </div>
          <div v-else class="flex h-56 items-end gap-2">
            <div
              v-for="item in data?.monthlySales || []"
              :key="item.label"
              class="flex h-full flex-1 flex-col justify-end gap-2"
            >
              <div
                class="rounded-t-lg bg-primary/80"
                :style="{ height: `${barHeight(item.value)}%` }"
                :title="format.currency(item.value)"
              />
              <span class="text-center text-xs text-muted">{{ item.label }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h2 class="text-sm font-bold">ສັດສ່ວນປະເພດປະກັນໄພ</h2>
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
              class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-text"
              >#{{ index + 1 }}</span
            >
            <BaseAvatar :src="agent.avatar" :name="agent.name" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">{{ agent.name }}</p>
              <p class="text-xs text-muted">{{ agent.teamName }}</p>
            </div>
            <p class="text-sm font-bold tabular-nums">{{ format.currency(agent.sales) }}</p>
          </li>
        </ol>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useDashboard } from '~/composables/api/useDashboard'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ລາຍງານທຸລະກິດ',
  permission: 'report.view',
})

const format = useFormat()
const toast = useToast()
const { data, pending, error, refresh } = useDashboard()

const range = reactive({ from: '', to: '' })

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
</script>
