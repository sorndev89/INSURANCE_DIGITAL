<template>
  <BaseModal
    :model-value="modelValue"
    title=""
    size="sm"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4 text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
      >
        <BaseIcon name="celebration" size="2xl" />
      </div>
      <div>
        <h2 class="text-xl font-bold">ຂໍສະແດງຄວາມຍິນດີ!</h2>
        <p class="mt-1 text-sm text-muted">You get commission 5% ຈາກການຂາຍປະກັນໄພ</p>
      </div>

      <div class="rounded-xl border border-success/30 bg-success/5 p-4">
        <p class="text-xs text-muted">ຮັບເງິນຈາກການຂາຍປະກັນໄພ</p>
        <p class="mt-1 text-3xl font-bold tabular-nums text-success">
          {{ format.currency(commission) }}
        </p>
        <p class="mt-1 text-xs text-muted">ໂອນເຂົ້າບັນຊີ BCEL ອັດຕະໂນມັດ</p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-left text-sm">
        <div class="rounded-lg border border-line p-3">
          <p class="text-xs text-muted">ສັນຍາ</p>
          <p class="mt-0.5 font-mono font-bold">{{ policy?.policyNumber || '—' }}</p>
        </div>
        <div class="rounded-lg border border-line p-3">
          <p class="text-xs text-muted">ຄະແນນສະສົມ</p>
          <p class="mt-0.5 font-bold text-primary-text">+{{ format.number(points) }} Point</p>
        </div>
      </div>

      <p class="text-xs text-muted">
        Transfer money commission 5% to USER Customer · ໂໝດ Mockup ຈຳລອງການໂອນເງິນ
      </p>
    </div>

    <template #footer>
      <BaseButton block icon="check" @click="$emit('update:modelValue', false)">
        ຮັບຊາບ
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { useFormat } from '~/utils/format'
import { POINTS_PER_POLICY } from '~/utils/points'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  policy: { type: Object, default: null },
  rate: { type: Number, default: 5 },
  points: { type: Number, default: POINTS_PER_POLICY },
})

defineEmits(['update:modelValue'])

const format = useFormat()

const commission = computed(() => {
  const policy = props.policy
  if (!policy) return 0
  if (policy.agentCommissionAmount) return policy.agentCommissionAmount
  return Math.round(((policy.netPremium || 0) * props.rate) / 100)
})
</script>
