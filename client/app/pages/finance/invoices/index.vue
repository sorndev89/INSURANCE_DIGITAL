<template>
  <div class="space-y-6">
    <PageHeader title="ໃບແຈ້ງໜີ້" description="ຕິດຕາມ ແລະ ອອກໃບແຈ້ງໜີ້ (Invoice).">
      <template #actions>
        <BaseButton variant="secondary" icon="file_download" @click="toast.info('Export ໃບແຈ້ງໜີ້')"
          >Export</BaseButton
        >
        <BaseButton icon="add_circle" @click="openCreate">ສ້າງ Invoice</BaseButton>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="ໃບແຈ້ງໜີ້ທັງໝົດ" :value="format.number(stats.total)" icon="receipt_long" />
      <StatCard
        label="ຍັງບໍ່ຈ່າຍ"
        :value="format.number(stats.unpaid)"
        icon="pending"
        trend-tone="warning"
      />
      <StatCard
        label="ເກີນກຳນົດ"
        :value="format.number(stats.overdue)"
        icon="warning"
        trend-tone="danger"
      />
      <StatCard label="ຍອດລວມ" :value="format.currency(stats.amount)" icon="payments" highlight />
    </div>

    <FilterBar>
      <template #start>
        <BaseTabs v-model="filters.status" :items="statusTabs" />
      </template>
      <template #end>
        <div class="w-full sm:w-72">
          <SearchInput
            v-model="filters.search"
            label="ຄົ້ນຫາໃບແຈ້ງໜີ້"
            placeholder="ເລກ invoice, ປະກັນໄພ, ຊື່..."
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
      caption="ຕາຕະລາງໃບແຈ້ງໜີ້"
      empty-title="ບໍ່ພົບໃບແຈ້ງໜີ້"
      @update:page="setPage"
      @retry="refresh"
    >
      <template #cell-invoiceNumber="{ row }">
        <p class="font-bold text-primary-text">{{ row.invoiceNumber }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ row.policyNumber }}</p>
      </template>
      <template #cell-customerName="{ row }">
        <p class="font-bold">{{ row.customerName }}</p>
      </template>
      <template #cell-dueDate="{ value }">{{ format.date(value) }}</template>
      <template #cell-amount="{ value }"
        ><span class="font-bold tabular-nums">{{ format.currency(value) }}</span></template
      >
      <template #cell-status="{ value }"><StatusBadge :status="value" /></template>
      <template #actions="{ row }">
        <BaseButton
          variant="ghost"
          size="sm"
          icon-only
          label="ພິມ"
          icon="print"
          @click="toast.info(`ພິມ ${row.invoiceNumber}`)"
        />
      </template>
    </DataTable>

    <BaseModal v-model="createOpen" title="ສ້າງໃບແຈ້ງໜີ້ໃໝ່" size="lg">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <BaseSelect
            v-model="form.policyId"
            label="ປະກັນໄພ"
            :options="policyOptions"
            :error="errors.policyId"
          />
        </div>
        <BaseNumberInput
          v-model="form.amount"
          :label="`ຈຳນວນເງິນ (${currencyLabel})`"
          min="0"
          required
          allow-decimal
          :error="errors.amount"
        />
        <BaseInput
          v-model="form.dueDate"
          type="date"
          label="ວັນຄົບກຳນົດຊຳລະ"
          required
          :error="errors.dueDate"
        />
        <BaseInput v-model="form.issuedDate" type="date" label="ວັນອອກໃບແຈ້ງໜີ້" />
        <BaseSelect v-model="form.status" label="ສະຖານະ" :options="STATUS_OPTIONS" />
        <BaseTextarea
          v-model="form.notes"
          label="ໝາຍເຫດ"
          class="sm:col-span-2"
          placeholder="ໝາຍເຫດເພີ່ມເຕີມ"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="createOpen = false">ຍົກເລີກ</BaseButton>
          <BaseButton icon="save" :loading="saving" @click="saveInvoice">ບັນທຶກ</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useInvoices } from '~/composables/api/useInvoices'
import { usePolicies } from '~/composables/api/usePolicies'
import { useToast } from '~/composables/useToast'
import { useFormat } from '~/utils/format'
import { currencyLabel } from '~/utils/currencyDisplay'
import { todayIso } from '~/utils/date'
import { numeric, required, validate } from '~/utils/validators'

definePageMeta({
  layout: 'admin',
  title: 'ໃບແຈ້ງໜີ້',
  permission: 'finance.view',
})

const STATUS_OPTIONS = [
  { value: 'unpaid', label: 'ຍັງບໍ່ຈ່າຍ' },
  { value: 'paid', label: 'ຈ່າຍແລ້ວ' },
  { value: 'overdue', label: 'ເກີນກຳນົດ' },
]

const format = useFormat()
const toast = useToast()
const { items, total, page, pageSize, pending, error, filters, refresh, setPage, stats, create } =
  useInvoices()
const { items: policies } = usePolicies({ pageSize: 100, querySync: false })

const policyOptions = computed(() =>
  policies.value.map((policy) => ({
    value: String(policy.id),
    label: `${policy.policyNumber} · ${policy.customerName || ''}`,
  })),
)

const statusTabs = computed(() => [
  { key: '', label: 'ທັງໝົດ', count: stats.value.total },
  { key: 'unpaid', label: 'ຍັງບໍ່ຈ່າຍ' },
  { key: 'overdue', label: 'ເກີນກຳນົດ' },
  { key: 'paid', label: 'ຈ່າຍແລ້ວ' },
])

const columns = [
  { key: 'invoiceNumber', label: 'ໃບແຈ້ງໜີ້', sortable: true },
  { key: 'customerName', label: 'ລູກຄ້າ' },
  { key: 'dueDate', label: 'ກຳນົດຊຳລະ', hideOn: ['mobile'] },
  { key: 'amount', label: 'ຈຳນວນ', align: 'right', sortable: true },
  { key: 'status', label: 'ສະຖານະ', align: 'center' },
]

const createOpen = ref(false)
const saving = ref(false)
const form = reactive({
  policyId: '',
  amount: '',
  issuedDate: todayIso(),
  dueDate: '',
  status: 'unpaid',
  notes: '',
})
const errors = reactive({ policyId: '', amount: '', dueDate: '' })

const openCreate = () => {
  Object.assign(form, {
    policyId: '',
    amount: '',
    issuedDate: todayIso(),
    dueDate: '',
    status: 'unpaid',
    notes: '',
  })
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  createOpen.value = true
}

watch(
  () => form.policyId,
  (value) => {
    if (!value) return
    const policy = policies.value.find((item) => String(item.id) === String(value))
    if (policy && !form.amount) form.amount = Number(policy.totalPremium) || ''
  },
)

const saveInvoice = async () => {
  errors.policyId = required(form.policyId)
  errors.amount = validate(form.amount, [required, numeric])
  errors.dueDate = required(form.dueDate)
  if (Object.values(errors).some(Boolean)) return

  saving.value = true
  try {
    await create({
      policyId: Number(form.policyId),
      amount: Number(form.amount),
      issuedDate: form.issuedDate,
      dueDate: form.dueDate,
      status: form.status,
      notes: form.notes.trim(),
    })
    createOpen.value = false
    refresh()
    toast.success('ສ້າງໃບແຈ້ງໜີ້ສຳເລັດ')
  } catch (requestError) {
    toast.error(requestError?.message || 'ບໍ່ສາມາດສ້າງໃບແຈ້ງໜີ້ໄດ້')
  } finally {
    saving.value = false
  }
}
</script>
