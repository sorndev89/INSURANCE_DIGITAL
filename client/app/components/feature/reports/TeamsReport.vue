<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ທີມທັງໝົດ" :value="format.number(data?.total)" icon="diversity_3" />
      <StatCard label="ສະມາຊິກ" :value="format.number(data?.members)" icon="groups" />
      <StatCard label="ຍອດຂາຍ" :value="format.currency(data?.sales)" icon="payments" highlight />
      <StatCard
        label="ບັນລຸເປົ້າໝາຍ"
        :value="format.percent(data?.salesTargetAchievement, 1)"
        icon="target"
      />
    </div>

    <ReportSection
      title="ຜົນງານທີມ"
      description="ຍອດຂາຍ ສະມາຊິກ ແລະ ເປົ້າໝາຍ"
      :loading="pending"
      :error="error"
      @retry="refresh"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <th class="pb-2 pr-3 font-bold">ທີມ</th>
              <th class="pb-2 pr-3 text-right font-bold">ສະມາຊິກ</th>
              <th class="pb-2 pr-3 text-right font-bold">ຕົວແທນ</th>
              <th class="pb-2 pr-3 text-right font-bold">ຍອດຂາຍ</th>
              <th class="pb-2 pr-3 text-right font-bold">ເປົ້າໝາຍ</th>
              <th class="pb-2 text-right font-bold">ບັນລຸ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in data?.ranking || []" :key="item.id">
              <td class="py-2 pr-3">
                <p class="font-bold">{{ item.name }}</p>
                <p class="text-xs text-muted">{{ item.location }} · {{ item.headName }}</p>
              </td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.number(item.members) }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">
                {{ format.number(item.agentCount) }}
              </td>
              <td class="py-2 pr-3 text-right font-bold tabular-nums">
                {{ format.currency(item.sales) }}
              </td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ format.currency(item.target) }}</td>
              <td class="py-2 text-right tabular-nums">
                {{ format.percent(item.achievement, 1) }}
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-if="!data?.ranking?.length" title="ບໍ່ມີທີມ" />
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
const { data, pending, error, refresh } = useReport('teams', props.range)
</script>
