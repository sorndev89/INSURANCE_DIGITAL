<template>
  <div class="space-y-6">
    <PageHeader title="ການຊຳລະເງິນ" description="ລາຍການຮັບຊຳລະເງິນ ແລະ ໃບຮັບເງິນ.">
      <template #actions>
        <BaseButton icon="add" @click="openCreate">ຮັບຊຳລະໃໝ່</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ຮັບມື້ນີ້" :value="format.currency(stats.today)" icon="today" />
      <StatCard
        label="ຮັບເດືອນນີ້"
        :value="format.currency(stats.month)"
        icon="date_range"
        highlight
      />
      <StatCard label="ລາຍການທັງໝົດ" :value="format.number(stats.total)" icon="receipt_long" />
      <StatCard
        label="ລໍຖ້າດຳເນີນການ"
        :value="format.number(stats.pending)"
        icon="pending"
        trend-tone="warning"
      />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາການຊຳລະ"
            placeholder="ເລກໃບຮັບ, ລູກຄ້າ..."
          />
        </div>
      </template>
    </FilterBar>

    <DataTable
      :columns="columns"
      :rows="items"
      :loading="pending"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      caption="ຕາຕະລາງການຊຳລະ"
      empty-title="ບໍ່ພົບການຊຳລະ"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-receiptNumber="{ row }">
        <p class="font-bold text-primary-text">{{ row.receiptNumber }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.invoiceNumber }}</p>
      </template>
      <template #cell-customerName="{ row }">
        <p class="font-bold">{{ row.customerName }}</p>
      </template>
      <template #cell-method="{ value }">{{ methodLabel(value) }}</template>
      <template #cell-paidAt="{ value }">{{ value ? format.date(value) : '—' }}</template>
      <template #cell-amount="{ value }"
        ><span class="font-bold tabular-nums">{{ format.currency(value) }}</span></template
      >
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
    </DataTable>

    <BaseModal v-model="createOpen" title="ບັນທຶກການຮັບຊຳລະເງິນ" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <BaseSelect
            v-model="form.invoiceId"
            label="ໃບແຈ້ງໜີ້ທີ່ຍັງບໍ່ທັນຈ່າຍ"
            :options="invoiceOptions"
            :error="errors.invoiceId"
          />
        </div>
        <BaseSelect v-model="form.method" label="ວິທີການຊຳລະ" :options="PAYMENT_METHODS" />
        <BaseNumberInput
          v-model="form.amount"
          :label="`ຈຳນວນເງິນ (${currencyLabel})`"
          min="0"
          required
          allow-decimal
          :error="errors.amount"
        />
        <BaseInput
          v-model="form.paidAt"
          type="date"
          label="ວັນທີຮັບເງິນ"
          required
          :error="errors.paidAt"
        />
        <BaseSelect v-model="form.status" label="ສະຖານະ" :options="STATUS_OPTIONS" />
        <div class="sm:col-span-2">
          <FileUpload
            v-model="form.slip"
            label="ສະລິບໂອນເງິນ"
            hint="ຮູບພາບ ຫຼື PDF, ສູງສຸດ 5 MB"
            auto-upload
            @uploaded="uploadedSlip = $event"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="savePayment">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { usePayments } from '~/composables/api/usePayments'
import { useInvoices } from '~/composables/api/useInvoices'
import { useFileUpload } from '~/composables/useFileUpload'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { currencyLabel } from '~/utils/currencyDisplay'
import { todayIso } from '~/utils/date'
import { PAYMENT_METHODS } from '~/utils/constants'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ການຊຳລະເງິນ',
  permission: 'finance.view',
})

const STATUS_OPTIONS = [
  { value: 'completed', label: 'ສຳເລັດ' },
  { value: 'pending', label: 'ລໍຖ້າ' },
  { value: 'failed', label: 'ລົ້ມເຫຼວ' },
]

const format = useFormat()
const toast = useToast()
const { upload } = useFileUpload()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, stats, create } =
  usePayments()
const { items: unpaidInvoices, refresh: refreshInvoices } = useInvoices({
  pageSize: 100,
  defaultFilters: { search: '', status: 'unpaid' },
  querySync: false,
})

const invoiceOptions = computed(() =>
  unpaidInvoices.value.map((invoice) => ({
    value: String(invoice.id),
    label: `${invoice.invoiceNumber} · ${invoice.customerName || ''} · ${format.currency(invoice.amount)}`,
  })),
)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'completed', label: 'ສຳເລັດ' },
  { key: 'pending', label: 'ລໍຖ້າ' },
  { key: 'failed', label: 'ລົ້ມເຫຼວ' },
])

const columns = [
  { key: 'receiptNumber', label: 'ໃບຮັບເງິນ', sortable: true },
  { key: 'customerName', label: 'ລູກຄ້າ' },
  { key: 'method', label: 'ວິທີ', hideOn: ['mobile'] },
  { key: 'paidAt', label: 'ວັນທີ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const createOpen = ref(false)
const saving = ref(false)
const uploadedSlip = ref(null)
const form = reactive({
  invoiceId: '',
  method: 'bcel',
  amount: '',
  paidAt: todayIso(),
  status: 'completed',
  slip: null,
})
const errors = reactive({ invoiceId: '', amount: '', paidAt: '' })

const openCreate = () => {
  Object.assign(form, {
    invoiceId: '',
    method: 'bcel',
    amount: '',
    paidAt: todayIso(),
    status: 'completed',
    slip: null,
  })
  uploadedSlip.value = null
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  createOpen.value = true
}

watch(
  () => form.invoiceId,
  (value) => {
    if (!value) return
    const invoice = unpaidInvoices.value.find((item) => String(item.id) === String(value))
    if (invoice) form.amount = Number(invoice.amount) || ''
  },
)

const methodLabel = (method) => {
  if (method === 'bcel') return 'BCEL One'
  if (method === 'bank') return 'ໂອນທະນາຄານ'
  return 'ເງິນສົດ'
}

const savePayment = async () => {
  errors.invoiceId = required(form.invoiceId)
  errors.amount = validate(form.amount, [required, numeric])
  errors.paidAt = required(form.paidAt)
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    let slip = uploadedSlip.value
    if (form.slip && !slip?.url) slip = await upload(form.slip)
    await create({
      invoiceId: Number(form.invoiceId),
      method: form.method,
      amount: Number(form.amount),
      paidAt: form.paidAt,
      status: form.status,
      slipUrl: slip?.url || '',
    })
    createOpen.value = false
    refresh()
    refreshInvoices()
    toast.success('ບັນທຶກການຮັບຊຳລະສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດບັນທຶກການຊຳລະໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
