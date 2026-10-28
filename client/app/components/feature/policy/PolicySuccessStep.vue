<template>
  <div class="space-y-5">
    <div class="text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
      >
        <BaseIcon name="check_circle" size="2xl" />
      </div>
      <h2 class="mt-3 text-2xl font-bold">ອອກປະກັນໄພສຳເລັດ</h2>
      <p class="mt-1 text-sm text-muted">
        ໃບຢັ້ງຢືນສັນຍາ Digital Certificate ຖືກອອກຮຽບຮ້ອຍແລ້ວ
      </p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-primary/30 bg-surface shadow-card">
      <div class="bg-primary px-5 py-4 text-white">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-on-primary">
              Digital Certificate
            </p>
            <p class="mt-1 text-lg font-bold">ໃບຢັ້ງຢືນສັນຍາປະກັນໄພ</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-on-primary">ເລກໃບຢັ້ງຢືນ</p>
            <p class="font-mono text-lg font-bold">{{ certificateNumber }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-5 p-5 md:grid-cols-[1fr_180px]">
        <div class="space-y-4 text-sm">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted">ເລກສັນຍາ Broker</p>
              <p class="font-mono font-bold text-primary-text">{{ policy?.policyNumber || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ເລກສັນຍາບໍລິສັດ</p>
              <p class="font-mono font-bold">{{ policy?.insurerPolicyNumber || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ຜູ້ເອົາປະກັນ</p>
              <p class="font-bold">{{ policy?.customerName || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ເບີໂທ</p>
              <p class="font-bold">{{ format.phone(policy?.customerPhone) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ບໍລິສັດປະກັນໄພ</p>
              <p class="font-bold">{{ policy?.companyName || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ແຜນປະກັນໄພ</p>
              <p class="font-bold">{{ policy?.productName || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ຍານພາຫະນະ</p>
              <p class="font-bold">
                {{ vehicleLabel }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted">ທະບຽນ</p>
              <p class="font-bold">{{ policy?.vehiclePlate || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ວັນເລີ່ມຄຸ້ມຄອງ</p>
              <p class="font-bold">{{ format.date(policy?.startDate) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">ວັນໝົດອາຍຸ</p>
              <p class="font-bold">{{ format.date(policy?.endDate) }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-line bg-surface-muted p-3">
            <div class="flex justify-between text-sm">
              <span class="text-muted">ເບ້ຍປະກັນສຸດທິ</span>
              <span class="font-bold tabular-nums">{{ format.currency(policy?.netPremium || 0) }}</span>
            </div>
            <div class="mt-1 flex justify-between text-sm">
              <span class="text-muted">VAT 7%</span>
              <span class="font-bold tabular-nums">{{ format.currency(policy?.vatAmount || 0) }}</span>
            </div>
            <div class="mt-1 flex justify-between text-sm">
              <span class="text-muted">ຄ່າທະບຽນ</span>
              <span class="font-bold tabular-nums">{{
                format.currency(policy?.registrationFee || 0)
              }}</span>
            </div>
            <div class="mt-2 flex justify-between border-t border-line pt-2 text-base">
              <span class="font-bold">ຍອດລວມສຸດທິ</span>
              <span class="font-bold tabular-nums text-primary-text">{{
                format.currency(policy?.totalPremium || 0)
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-muted p-3">
          <img :src="qrImage" alt="QR ກວດສອບສັນຍາ" class="w-32" />
          <p class="text-center text-[11px] font-bold text-muted">ສະແກນເພື່ອກວດສອບສັນຍາ</p>
          <p class="font-mono text-[11px] text-muted">{{ policy?.policyNumber || '—' }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col justify-center gap-2 sm:flex-row">
      <BaseButton variant="secondary" icon="print" @click="printCertificate">ພິມ / ດາວໂຫຼດ</BaseButton>
      <BaseButton
        v-if="policy?.id"
        icon="visibility"
        @click="navigateTo(`/policies/${policy.id}`)"
      >
        ເບິ່ງລາຍລະອຽດສັນຍາ
      </BaseButton>
      <BaseButton variant="secondary" icon="add" @click="navigateTo('/policies/create')">
        ອອກປະກັນໄພໃໝ່
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { navigateTo } from '#app'
import qrImage from '~/assets/img/qr-placeholder.svg'
import { useFormat } from '~/utils/format'
import { getVehicleCategory } from '~/utils/vehiclePricing'

const props = defineProps({
  policy: { type: Object, default: null },
  certificateNumber: { type: String, default: '' },
})

const format = useFormat()

const certificateNumber = computed(
  () => props.certificateNumber || `WEC-${String(props.policy?.id || Date.now()).slice(-6)}`,
)

const vehicleLabel = computed(() => {
  const vehicle = props.policy?.vehicle
  if (!vehicle) return '—'
  const category = getVehicleCategory(vehicle.category).label
  return `${vehicle.make || ''} ${vehicle.model || ''} (${category})`.trim()
})

const printCertificate = () => {
  if (import.meta.client) window.print()
}
</script>
