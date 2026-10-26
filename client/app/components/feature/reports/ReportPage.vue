<template>
  <div class="space-y-4 sm:space-y-6">
    <PageHeader :title="title" :description="description">
      <template #actions>
        <BaseButton
          variant="secondary"
          icon="picture_as_pdf"
          :loading="exporting"
          @click="exportReport(reportType, range, 'pdf')"
        >
          PDF
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="table_view"
          :loading="exporting"
          @click="exportReport(reportType, range, 'xlsx')"
        >
          Excel
        </BaseButton>
      </template>
    </PageHeader>

    <BaseCard>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-for="preset in presets"
            :key="preset.key"
            :variant="activePreset === preset.key ? 'primary' : 'secondary'"
            size="sm"
            @click="applyPreset(preset.key)"
          >
            {{ preset.label }}
          </BaseButton>
        </div>
        <div class="w-full lg:max-w-md">
          <DateRangePicker v-model:from="range.from" v-model:to="range.to" label="ໄລຍະລາຍງານ" />
        </div>
      </div>
    </BaseCard>

    <slot :range="range" />
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useReportExport } from '~/composables/api/useReports'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  reportType: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()
const { exportReport, exporting } = useReportExport()

const pad = (value) => String(value).padStart(2, '0')
const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const isValidDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const today = new Date()
const defaultTo = toDateString(today)
const defaultFrom = toDateString(new Date(today.getFullYear(), today.getMonth() - 11, 1))

const queryFrom = isValidDate(route.query.from) ? route.query.from : defaultFrom
const queryTo = isValidDate(route.query.to) ? route.query.to : defaultTo
const range = reactive({
  from: queryFrom <= queryTo ? queryFrom : defaultFrom,
  to: queryFrom <= queryTo ? queryTo : defaultTo,
})

const presets = [
  { key: 'month', label: 'ເດືອນນີ້' },
  { key: 'quarter', label: 'ໄຕມາດນີ້' },
  { key: 'year', label: 'ປີນີ້' },
  { key: 'twelve', label: '12 ເດືອນ' },
]
const activePreset = ref('twelve')

const applyPreset = (key) => {
  const now = new Date()
  activePreset.value = key
  if (key === 'month') {
    range.from = toDateString(new Date(now.getFullYear(), now.getMonth(), 1))
    range.to = toDateString(now)
    return
  }
  if (key === 'quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3
    range.from = toDateString(new Date(now.getFullYear(), quarterMonth, 1))
    range.to = toDateString(now)
    return
  }
  if (key === 'year') {
    range.from = toDateString(new Date(now.getFullYear(), 0, 1))
    range.to = toDateString(now)
    return
  }
  range.from = toDateString(new Date(now.getFullYear(), now.getMonth() - 11, 1))
  range.to = toDateString(now)
}

watch(
  () => [range.from, range.to],
  () => {
    if (range.from > range.to) return
    void router.replace({
      query: {
        ...route.query,
        from: range.from,
        to: range.to,
      },
    })
  },
)
</script>
