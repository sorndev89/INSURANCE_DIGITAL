<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ສັນຍາທັງໝົດ" :value="format.number(data?.total)" icon="description" />
      <StatCard label="ມີຜົນ" :value="format.number(data?.active)" icon="verified_user" />
      <StatCard
        label="ໝົດອາຍຸ 30 ວັນ"
        :value="format.number(data?.expiring30)"
        icon="schedule"
        trend-tone="warning"
      />
      <StatCard
        label="ເບ້ຍປະກັນລວມ"
        :value="format.currency(data?.premium)"
        icon="payments"
        highlight
      />
    </div>

    <div class="grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ReportSection title="ສະຖານະສັນຍາທັງໝົດ" :loading="pending" :error="error" @retry="refresh">
        <div class="space-y-3">
          <div
            v-for="item in data?.portfolioByStatus || []"
            :key="item.key"
            class="flex items-center justify-between gap-3"
          >
            <StatusBadge :status="item.key" />
            <span class="flex-1 text-right text-sm tabular-nums">{{
              format.number(item.count)
            }}</span>
            <span class="w-28 text-right text-sm font-bold tabular-nums">
              {{ format.currency(item.value) }}
            </span>
          </div>
          <EmptyState v-if="!data?.portfolioByStatus?.length" title="ບໍ່ມີສັນຍາ" />
        </div>
      </ReportSection>

      <ReportSection
        title="ສັນຍາທີ່ອອກໃນໄລຍະ"
        :description="`${format.number(data?.issuedInPeriod?.count)} ສັນຍາ`"
        :loading="pending"
        :error="error"
        @retry="refresh"
      >
        <div class="space-y-3">
          <div
            v-for="item in data?.issuedInPeriod?.byStatus || []"
            :key="item.key"
            class="flex items-center justify-between gap-3"
          >
            <StatusBadge :status="item.key" />
            <span class="flex-1 text-right text-sm tabular-nums">{{
              format.number(item.count)
            }}</span>
            <span class="w-28 text-right text-sm font-bold tabular-nums">
              {{ format.currency(item.value) }}
            </span>
          </div>
          <div class="flex items-center justify-between border-t border-line pt-3 text-sm">
            <span class="font-bold text-muted">ຍອດລວມ</span>
            <span class="font-bold tabular-nums">{{
              format.currency(data?.issuedInPeriod?.value)
            }}</span>
          </div>
          <EmptyState v-if="!data?.issuedInPeriod?.byStatus?.length" title="ບໍ່ມີສັນຍາໃນໄລຍະນີ້" />
        </div>
      </ReportSection>
    </div>

    <ReportSection
      title="ປະກັນໄພໃກ້ໝົດອາຍຸ"
      description="ພາຍໃນ 30 ວັນ ເພື່ອຕິດຕໍ່ຕໍ່ອາຍຸ"
      :loading="pending"
      :error="error"
      @retry="refresh"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ປະກັນໄພ</th>
              <th class="pb-2 pr-3 font-bold">ລູກຄ້າ</th>
              <th class="pb-2 pr-3 font-bold">ຜະລິດຕະພັນ</th>
              <th class="pb-2 pr-3 text-right font-bold">ໝົດອາຍຸ</th>
              <th class="pb-2 text-right font-bold">ເບ້ຍປະກັນ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.expiringList || []" :key="item.id">
              <td class="py-2 pr-3 font-bold">{{ item.policyNumber }}</td>
              <td class="py-2 pr-3">
                <p class="font-bold">{{ item.customerName }}</p>
                <p class="text-xs text-muted">{{ format.phone(item.customerPhone) }}</p>
              </td>
              <td class="py-2 pr-3">{{ item.productName }}</td>
              <td class="py-2 pr-3 text-right text-xs font-bold text-warning">
                {{ format.date(item.endDate) }}
              </td>
              <td class="py-2 text-right font-bold tabular-nums">
                {{ format.currency(item.totalPremium) }}
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.expiringList?.length" title="ບໍ່ມີສັນຍາໃກ້ໝົດອາຍຸ" />
      </div>
    </ReportSection>
  </div>
</template>

<script setup>
import { useReport } from '~/composables/api/useReports'
import { useFormat } from '~/utils/format'
import ReportSection from './ReportSection.vue'

const props = defineProps({
  range: { type: Object, required: true },
})

const format = useFormat()
const { data, pending, error, refresh } = useReport('policies', props.range)
</script>
