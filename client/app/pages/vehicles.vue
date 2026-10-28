<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader
      title="ທະບຽນລົດ"
      description="ຄົ້ນຫາ ແລະ ຈັດການຂໍ້ມູນລົດທີ່ລົງທະບຽນ: ເລກຈັກ, ເລກຖັງ, ທະບຽນ, ຮຸ່ນ ແລະ ການນຳໃຊ້."
    >
      <template #actions>
        <BaseButton icon="add_circle" @click="navigateTo('/policies/create')">
          ລົງທະບຽນລົດໃໝ່
        </BaseButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
      <StatCard label="ລົດທັງໝົດ" :value="format.number(vehicles.length)" icon="directions_car" />
      <StatCard
        label="ລົດສ່ວນຕົວ"
        :value="format.number(privateCount)"
        icon="person_pin_circle"
      />
      <StatCard
        label="ລົດຮັບຈ້າງ"
        :value="format.number(commercialCount)"
        icon="local_shipping"
        trend="ຄວາມສ່ຽງສູງ"
        trend-tone="warning"
      />
      <StatCard label="ມີປະກັນໄພຢູ່" :value="format.number(activeCount)" icon="verified_user" />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="categoryFilter" :items="categoryTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="search"
            label="ຄົ້ນຫາລົດ"
            placeholder="ທະບຽນ, ຍີ່ຫໍ້, ລຸ້ນ, ເລກຈັກ..."
          />
        </div>
      </template>
    </FilterBar>

    <BaseCard flush>
      <div class="overflow-x-auto" tabindex="0" role="region" aria-label="ຕາຕະລາງທະບຽນລົດ">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-line bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <th class="px-4 py-3 font-bold">ທະບຽນ / ລົດ</th>
              <th class="px-4 py-3 font-bold">ຜູ້ເອົາປະກັນ</th>
              <th class="px-4 py-3 font-bold">ປະເພດ</th>
              <th class="px-4 py-3 font-bold">ການນຳໃຊ້</th>
              <th class="px-4 py-3 font-bold">ບໍລິສັດ</th>
              <th class="px-4 py-3 text-right font-bold">ໝົດອາຍຸ</th>
              <th class="px-4 py-3 text-right font-bold"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="vehicle in filteredVehicles" :key="vehicle.key" class="hover:bg-surface-muted/40">
              <td class="px-4 py-3">
                <p class="font-mono font-bold">{{ vehicle.plateNumber }}</p>
                <p class="text-xs text-muted">{{ vehicle.make }} {{ vehicle.model }} · {{ vehicle.year }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="font-bold">{{ vehicle.customerName }}</p>
                <p class="text-xs text-muted">{{ format.phone(vehicle.customerPhone) }}</p>
              </td>
              <td class="px-4 py-3">
                <BaseBadge tone="neutral">{{ vehicle.categoryLabel }}</BaseBadge>
              </td>
              <td class="px-4 py-3">
                <BaseBadge :tone="vehicle.usageType === 'commercial' ? 'warning' : 'success'">
                  {{ vehicle.usageLabel }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">
                <p class="text-sm font-bold">{{ vehicle.companyCode }}</p>
                <p class="text-xs text-muted">{{ vehicle.policyNumber }}</p>
              </td>
              <td class="px-4 py-3 text-right text-xs font-bold text-warning">
                {{ format.date(vehicle.endDate) }}
              </td>
              <td class="px-4 py-3 text-right">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  icon="visibility"
                  @click="selectedVehicle = vehicle"
                >
                  ເບິ່ງ
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-if="!filteredVehicles.length" title="ບໍ່ພົບຂໍ້ມູນລົດ" />
    </BaseCard>

    <BaseModal
      :model-value="Boolean(selectedVehicle)"
      title="ລາຍລະອຽດລົດ"
      size="md"
      @update:model-value="selectedVehicle = null"
    >
      <div v-if="selectedVehicle" class="space-y-3 text-sm">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs text-muted">ທະບຽນ</p>
            <p class="font-mono font-bold">{{ selectedVehicle.plateNumber }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຍີ່ຫໍ້ / ລຸ້ນ</p>
            <p class="font-bold">{{ selectedVehicle.make }} {{ selectedVehicle.model }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ເລກຈັກ</p>
            <p class="font-mono font-bold">{{ selectedVehicle.engineNumber || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ເລກຖັງ</p>
            <p class="font-mono font-bold">{{ selectedVehicle.chassisNumber || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຄວາມຈຸກະບອກສູບ</p>
            <p class="font-bold">{{ selectedVehicle.engineCapacity || '—' }} cc</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຈຳນວນບ່ອນນັ່ງ</p>
            <p class="font-bold">{{ selectedVehicle.seats || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ປະເພດລົດ</p>
            <p class="font-bold">{{ selectedVehicle.categoryLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ການນຳໃຊ້</p>
            <p class="font-bold">{{ selectedVehicle.usageLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ຜູ້ເອົາປະກັນ</p>
            <p class="font-bold">{{ selectedVehicle.customerName }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ເບີໂທ</p>
            <p class="font-bold">{{ format.phone(selectedVehicle.customerPhone) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ບໍລິສັດ</p>
            <p class="font-bold">{{ selectedVehicle.companyCode }}</p>
          </div>
          <div>
            <p class="text-xs text-muted">ໝົດອາຍຸ</p>
            <p class="font-bold text-warning">{{ format.date(selectedVehicle.endDate) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton block icon="check" @click="selectedVehicle = null">ປິດ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { policies } from '~/mocks/policies'
import { getVehicleCategory, getVehicleUsage } from '~/utils/vehiclePricing'
import { useFormat } from '~/utils/format'

definePageMeta({
  layout: 'admin',
  title: 'ທະບຽນລົດ',
  permission: 'vehicle.view',
})

const format = useFormat()
const search = ref('')
const categoryFilter = ref('ALL')
const selectedVehicle = ref(null)

const vehicles = computed(() =>
  policies
    .filter((policy) => policy.vehicle && policy.vehiclePlate)
    .map((policy) => {
      const vehicle = policy.vehicle
      return {
        key: `${policy.id}-${vehicle.plateNumber}`,
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        customerName: policy.customerName,
        customerPhone: policy.customerPhone,
        companyCode: policy.companyCode,
        companyName: policy.companyName,
        endDate: policy.endDate,
        status: policy.status,
        ...vehicle,
        categoryLabel: getVehicleCategory(vehicle.category).label,
        usageLabel: getVehicleUsage(vehicle.usageType).label.split(' (')[0],
      }
    }),
)

const categoryTabs = computed(() => [
  { key: 'ALL', label: 'ທັງໝົດ', count: vehicles.value.length },
  ...['sedan', 'pickup', 'suv', 'van', 'truck', 'bus'].map((value) => ({
    key: value,
    label: getVehicleCategory(value).label,
    count: vehicles.value.filter((vehicle) => vehicle.category === value).length,
  })),
])

const filteredVehicles = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return vehicles.value.filter((vehicle) => {
    if (categoryFilter.value !== 'ALL' && vehicle.category !== categoryFilter.value) return false
    if (!keyword) return true
    return [
      vehicle.plateNumber,
      vehicle.make,
      vehicle.model,
      vehicle.engineNumber,
      vehicle.chassisNumber,
      vehicle.customerName,
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const activeCount = computed(
  () => vehicles.value.filter((vehicle) => vehicle.status === 'active').length,
)
const privateCount = computed(
  () => vehicles.value.filter((vehicle) => vehicle.usageType !== 'commercial').length,
)
const commercialCount = computed(
  () => vehicles.value.filter((vehicle) => vehicle.usageType === 'commercial').length,
)
</script>
