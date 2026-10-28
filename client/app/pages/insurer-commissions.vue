<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ຜະລິດຕະພັນ & ອັດຕາຄອມມິດຊັ່ນ"
      description="ກຳນົດອັດຕາຄອມມິດຊັ່ນທີ່ Broker ໄດ້ຮັບຈາກແຕ່ລະບໍລິສັດ ແລະ ປະເພດປະກັນໄພ."
    >
      <template #actions>
        <BaseButton variant="secondary" icon="arrow_back" @click="navigateTo('/insurers')">
          ກັບຄືນ
        </BaseButton>
        <BaseButton icon="save" @click="saveAll">ບັນທຶກທັງໝົດ</BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ບໍລິສັດ" :value="format.number(insurers.length)" icon="apartment" />
      <StatCard
        label="ຄອມມິດຊັ່ນສູງສຸດ"
        :value="`${maxRate}%`"
        icon="trending_up"
        highlight
      />
      <StatCard label="ຄອມມິດຊັ່ນຕ່ຳສຸດ" :value="`${minRate}%`" icon="trending_down" />
      <StatCard label="ປະເພດປະກັນໄພ" :value="format.number(productTypes.length)" icon="category" />
    </div>

    <BaseCard flush>
      <div class="overflow-x-auto" tabindex="0" role="region" aria-label="ອັດຕາຄອມມິດຊັ່ນແຕ່ລະບໍລິສັດ">
        <table class="w-full min-w-[820px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="sticky left-0 z-10 bg-surface-muted px-4 py-3 font-bold">ບໍລິສັດ</th>
              <th
                v-for="type in productTypes"
                :key="type"
                class="px-3 py-3 text-center font-bold"
              >
                {{ type }}
              </th>
              <th class="px-4 py-3 text-right font-bold">ສະເລ່ຍ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="insurer in insurers" :key="insurer.id" class="hover:bg-surface-muted/40">
              <td class="sticky left-0 z-10 bg-surface px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary-text"
                  >
                    {{ insurer.code }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold">{{ insurer.shortName }}</p>
                    <p class="truncate text-[11px] text-muted">{{ insurer.name }}</p>
                  </div>
                </div>
              </td>
              <td v-for="type in productTypes" :key="type" class="px-2 py-2 text-center">
                <div class="mx-auto flex w-20 items-center gap-1 rounded-lg border border-line bg-surface px-2">
                  <input
                    v-model.number="insurer.commissionRates[type]"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    :aria-label="`${insurer.code} ${type} commission`"
                    class="h-9 w-full bg-transparent text-right text-sm font-bold tabular-nums outline-none"
                  />
                  <span class="text-xs text-muted">%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-bold text-success tabular-nums">
                {{ averageFor(insurer) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted">
      <p class="font-bold text-primary-text">ໝາຍເຫດ</p>
      <p class="mt-1">
        ອັດຕານີ້ແມ່ນຄອມມິດຊັ່ນທີ່ Broker ໄດ້ຮັບຈາກບໍລິສັດ. ຕົວແທນຂາຍຍ່ອຍຈະໄດ້ຮັບ 5% ຈາກເບ້ຍສຸດທິ
        ຕາມທີ່ກຳນົດໃນລະບົບ.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import { insurers } from '~/mocks/insurers'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ຜະລິດຕະພັນ & ຄອມມິດຊັ່ນ',
  permission: 'insurer.view',
})

const toast = useToast()
const format = useFormat()

const productTypes = ['Motor', 'Health', 'Fire', 'Accident', 'Travel']

const averageFor = (insurer) => {
  const values = productTypes.map((type) => Number(insurer.commissionRates?.[type]) || 0)
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

const maxRate = computed(() =>
  Math.max(
    ...insurers.flatMap((insurer) =>
      productTypes.map((type) => Number(insurer.commissionRates?.[type]) || 0),
    ),
  ),
)
const minRate = computed(() =>
  Math.min(
    ...insurers.flatMap((insurer) =>
      productTypes.map((type) => Number(insurer.commissionRates?.[type]) || 0),
    ),
  ),
)

const saveAll = () => {
  toast.success('ບັນທຶກອັດຕາຄອມມິດຊັ່ນທັງໝົດແລ້ວ (Mockup)')
}
</script>
