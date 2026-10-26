<template>
  <div class="space-y-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <BaseSelect
        v-model="symbol"
        label="ສັນຍາລັກເງິນ"
        :options="CURRENCY_SYMBOL_OPTIONS"
        hint="ເລືອກລະຫວ່າງ ₭ ຫຼື LAK"
      />
      <div class="space-y-2">
        <p class="text-sm font-bold text-foreground">ຕຳແໜ່ງສັນຍາລັກ</p>
        <div class="space-y-2 rounded-lg border border-line bg-surface-muted p-3">
          <BaseRadio
            v-model="position"
            value="prefix"
            name="currency-display-position"
            label="ທາງໜ້າ"
            :description="`${label} ${previewNumber}`"
          />
          <BaseRadio
            v-model="position"
            value="suffix"
            name="currency-display-position"
            label="ທາງຫຼັງ"
            :description="`${previewNumber} ${label}`"
          />
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-line bg-surface-muted p-4">
      <p class="text-xs font-bold uppercase tracking-wider text-muted">ຕົວຢ່າງການສະແດງ</p>
      <p class="mt-1 text-xl font-bold tabular-nums text-primary-text">
        {{ formattedPreview }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { CURRENCY_SYMBOL_OPTIONS, formatCurrency } from '~/utils/currencyDisplay'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ symbol: 'kip', position: 'prefix' }),
  },
  previewValue: { type: Number, default: 12850000 },
})

const emit = defineEmits(['update:modelValue'])

const symbol = computed({
  get: () => props.modelValue.symbol,
  set: (value) => emit('update:modelValue', { ...props.modelValue, symbol: value }),
})

const position = computed({
  get: () => props.modelValue.position,
  set: (value) => emit('update:modelValue', { ...props.modelValue, position: value }),
})

const label = computed(() => (props.modelValue.symbol === 'lak' ? 'LAK' : '₭'))
const previewNumber = computed(() => new Intl.NumberFormat('en-US').format(props.previewValue))
const formattedPreview = computed(() => formatCurrency(props.previewValue, props.modelValue))
</script>
