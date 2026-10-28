<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-lg font-bold">5. ຊຳລະເງິນຜ່ານ BCEL One (OnePay QR)</h2>
      <p class="mt-0.5 text-xs text-muted">
        ສະແກນ QR ດ້ວຍແອັບ BCEL One ເພື່ອຊຳລະຄ່າປະກັນໄພ. ລະບົບຈະຢືນຢັນອັດຕະໂນມັດ.
      </p>
    </div>

    <div class="rounded-xl border border-line bg-surface-muted p-4">
      <p class="text-xs text-muted">ຍອດທີ່ລູກຄ້າຕ້ອງຊຳລະ</p>
      <p class="mt-1 text-3xl font-bold tabular-nums text-primary-text">
        {{ format.currency(amount) }}
      </p>
      <p class="mt-1 text-xs text-muted">ລວມ VAT 7% ແລະ ຄ່າທະບຽນ 20,000 ກີບ</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-[240px_1fr]">
      <div class="mx-auto w-full max-w-[240px] rounded-2xl border border-line bg-white p-4 shadow-card">
        <img :src="qrImage" alt="OnePay QR Code" class="h-auto w-full" />
        <p class="mt-2 text-center text-[11px] font-bold text-neutral-500">BCEL One · OnePay</p>
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span class="text-muted">ຊ່ອງທາງຊຳລະ</span>
          <span class="font-bold text-primary-text">BCEL One (OnePay)</span>
        </div>
        <div class="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span class="text-muted">ເລກອ້າງອີງ</span>
          <span class="font-mono font-bold">{{ reference }}</span>
        </div>
        <div class="flex items-center justify-between gap-3 border-b border-line pb-2">
          <span class="text-muted">ເວລານັບຖອຍ</span>
          <span class="font-bold tabular-nums" :class="secondsLeft <= 60 ? 'text-danger' : ''">
            {{ countdown }}
          </span>
        </div>
        <div class="rounded-lg bg-primary/5 p-3 text-xs text-muted">
          <p class="font-bold text-primary-text">ຂັ້ນຕອນຊຳລະ</p>
          <ol class="mt-1 list-decimal space-y-1 pl-4">
            <li>ເປີດແອັບ BCEL One ແລ້ວເລືອກ OnePay</li>
            <li>ສະແກນ QR ດ້ານຊ້າຍ</li>
            <li>ກວດສອບຈຳນວນເງິນ ແລ້ວຢືນຢັນ</li>
          </ol>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <BaseButton
        icon="qr_code_scanner"
        size="lg"
        :loading="submitting"
        @click="$emit('pay')"
      >
        ກົດຊຳລະຄ່າປະກັນໄພ
      </BaseButton>
    </div>

    <p class="text-center text-xs text-muted">
      ໂໝດ Mockup: ການກົດຊຳລະຈະຈຳລອງການຢືນຢັນສຳເລັດ ໂດຍບໍ່ຕັດເງິນຈິງ
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import qrImage from '~/assets/img/qr-placeholder.svg'
import { useFormat } from '~/utils/format'

defineProps({
  amount: { type: Number, default: 0 },
  reference: { type: String, default: 'ONEPAY-MOCK-0001' },
  submitting: { type: Boolean, default: false },
})

defineEmits(['pay'])

const format = useFormat()
const secondsLeft = ref(15 * 60)
let timer = null

const countdown = computed(() => {
  const minutes = String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')
  const seconds = String(secondsLeft.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

onMounted(() => {
  timer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
