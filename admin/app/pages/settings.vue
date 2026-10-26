<script setup>
import { computed, reactive, ref } from 'vue'
import {
  CURRENCY_SYMBOL_OPTIONS,
  DEFAULT_CURRENCY_DISPLAY,
  adminCurrencyDisplay,
  formatCurrency,
  resetCurrencyDisplay,
  setCurrencyDisplay,
} from '~/utils/currencyDisplay'

useHead({ title: 'Settings' })

const form = reactive({ ...adminCurrencyDisplay.value })
const saved = ref(false)

const preview = computed(() => formatCurrency(12850000, form))
const prefixPreview = computed(() =>
  formatCurrency(12850000, { ...form, position: 'prefix' }),
)
const suffixPreview = computed(() =>
  formatCurrency(12850000, { ...form, position: 'suffix' }),
)

const flashSaved = () => {
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2500)
}

const save = () => {
  setCurrencyDisplay({ ...form })
  flashSaved()
}

const reset = () => {
  resetCurrencyDisplay()
  Object.assign(form, DEFAULT_CURRENCY_DISPLAY)
  flashSaved()
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="ຕັ້ງຄ່າການສະແດງຜົນ"
      description="ກຳນົດຮູບແບບການສະແດງຈຳນວນເງິນ ສຳລັບ Platform Console ເທົ່ານັ້ນ."
      :breadcrumbs="[{ label: 'Settings' }]"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="sf-card p-5">
        <div>
          <h2 class="text-base font-extrabold text-foreground">ການສະແດງຈຳນວນເງິນ</h2>
          <p class="mt-1 text-xs text-muted">
            ການຕັ້ງຄ່ານີ້ແຍກຈາກ Tenant app ແລະ ບໍ່ສົ່ງຜົນຕໍ່ການສະແດງເງິນຂອງ tenant.
          </p>
        </div>

        <div class="mt-5 space-y-4">
          <div>
            <label class="sf-label" for="currency-symbol">ສັນຍາລັກເງິນ</label>
            <select id="currency-symbol" v-model="form.symbol" class="sf-input">
              <option v-for="option in CURRENCY_SYMBOL_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <fieldset>
            <legend class="sf-label">ຕຳແໜ່ງສັນຍາລັກ</legend>
            <div class="space-y-2 rounded-xl border border-line bg-surface-muted p-3">
              <label class="flex cursor-pointer items-start gap-3">
                <input
                  v-model="form.position"
                  type="radio"
                  value="prefix"
                  class="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span class="block text-sm font-bold text-foreground">ທາງໜ້າ</span>
                  <span class="block text-xs text-muted">{{ prefixPreview }}</span>
                </span>
              </label>
              <label class="flex cursor-pointer items-start gap-3">
                <input
                  v-model="form.position"
                  type="radio"
                  value="suffix"
                  class="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span class="block text-sm font-bold text-foreground">ທາງຫຼັງ</span>
                  <span class="block text-xs text-muted">{{ suffixPreview }}</span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div class="mt-4 rounded-xl border border-line bg-surface-muted p-4">
          <p class="text-[11px] font-bold uppercase tracking-wider text-muted">ຕົວຢ່າງ</p>
          <p class="mt-1 text-2xl font-black tabular-nums text-primary">{{ preview }}</p>
        </div>

        <div class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {{ saved ? 'ບັນທຶກແລ້ວ' : '' }}
          </span>
          <div class="flex gap-2">
            <button type="button" class="sf-btn sf-btn-secondary" @click="reset">
              ຄືນຄ່າເລີ່ມຕົ້ນ
            </button>
            <button type="button" class="sf-btn sf-btn-primary" @click="save">ບັນທຶກ</button>
          </div>
        </div>
      </section>

      <section class="sf-card p-5">
        <h2 class="text-base font-extrabold text-foreground">ຂໍ້ມູນການຕັ້ງຄ່າ</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex items-center justify-between gap-3 border-b border-line pb-3">
            <dt class="text-muted">ຂອບເຂດ</dt>
            <dd class="font-bold text-foreground">Platform Console</dd>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-line pb-3">
            <dt class="text-muted">ບັນທຶກໃນ</dt>
            <dd class="font-bold text-foreground">Browser ນີ້</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-muted">ການຈັດກຸ່ມເລກ</dt>
            <dd class="font-bold text-foreground">x,xxx ເປີດຕະຫຼອດ</dd>
          </div>
        </dl>
        <p class="mt-4 rounded-lg border border-line bg-surface-muted p-3 text-xs text-muted">
          ການຕັ້ງຄ່າຂອງ Tenant app ຈັດການຢູ່ໃນໜ້າ Settings ຂອງ tenant ແລະ ສາມາດ override
          ສ່ວນຕົວໄດ້ໃນໜ້າໂປຣໄຟລ໌ຂອງຜູ້ໃຊ້ແຕ່ລະຄົນ.
        </p>
      </section>
    </div>
  </div>
</template>
