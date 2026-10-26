<template>
  <div class="relative overflow-hidden rounded-xl border border-line bg-surface shadow-card">
    <template v-if="isMobileCard">
      <div v-if="loading" class="space-y-3 p-3">
        <div v-for="index in 3" :key="index" class="rounded-xl border border-line p-4">
          <BaseSkeleton width="lg" height="lg" />
          <BaseSkeleton class="mt-3" width="md" height="sm" />
          <BaseSkeleton class="mt-2" width="full" height="sm" />
        </div>
      </div>

      <ErrorState
        v-else-if="error"
        :title="errorTitle"
        :message="errorMessage"
        @retry="$emit('retry')"
      />

      <EmptyState
        v-else-if="rows.length === 0"
        :title="emptyTitle"
        :description="emptyDescription"
      />

      <div v-else class="space-y-2 p-2 sm:space-y-3 sm:p-3" role="list">
        <article
          v-for="(row, index) in rows"
          :key="rowId(row, index)"
          class="rounded-xl border border-line bg-surface p-3 sm:p-4 transition-all duration-150 active:scale-[0.99] active:bg-surface-muted/60 select-none cursor-pointer"
          role="listitem"
          @click="$emit('row-click', row)"
        >
          <div class="flex items-start gap-2.5 sm:gap-3">
            <input
              v-if="selectable"
              type="checkbox"
              :checked="isSelected(row, index)"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-primary"
              :aria-label="`ເລືອກແຖວ ${index + 1}`"
              @click.stop
              @change="toggleRow(row, index)"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-foreground">
                <slot
                  :name="`cell-${mobileTitleColumn.key}`"
                  :row="row"
                  :value="row[mobileTitleColumn.key]"
                  :index="index"
                >
                  {{ cellValue(row, mobileTitleColumn) }}
                </slot>
              </p>
              <p
                v-if="mobileTitleColumn.subLabel && row[mobileTitleColumn.subLabel]"
                class="mt-0.5 text-xs text-muted"
              >
                {{ row[mobileTitleColumn.subLabel] }}
              </p>
            </div>
            <div v-if="$slots.actions" @click.stop>
              <slot name="actions" :row="row" :index="index" />
            </div>
          </div>

          <dl
            v-if="mobileDetailColumns.length"
            class="mt-2.5 space-y-1.5 border-t border-line/60 pt-2 text-xs sm:text-sm"
          >
            <div
              v-for="column in mobileDetailColumns"
              :key="column.key"
              class="flex items-start justify-between gap-3 text-sm"
            >
              <dt class="shrink-0 text-xs text-muted">{{ column.label }}</dt>
              <dd class="min-w-0 text-right font-medium text-foreground">
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :index="index"
                >
                  {{ cellValue(row, column) }}
                </slot>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <Pagination
        v-if="total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="$emit('update:page', $event)"
      />
    </template>

    <template v-else>
      <div
        class="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        tabindex="0"
        role="region"
        :aria-label="caption"
      >
        <table class="w-full border-collapse text-left">
          <caption class="sr-only">
            {{
              caption
            }}
          </caption>
          <thead class="bg-surface-muted">
            <tr>
              <th v-if="selectable" scope="col" class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  class="h-4 w-4 rounded border-line accent-primary"
                  aria-label="ເລືອກທັງໝົດ"
                  @change="toggleAll"
                />
              </th>
              <th
                v-for="column in visibleColumns"
                :key="column.key"
                scope="col"
                class="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted"
                :class="[
                  alignClass(column.align),
                  column.align === 'right' ? 'whitespace-nowrap' : '',
                ]"
                :style="column.width ? { width: column.width } : undefined"
                :aria-sort="ariaSort(column)"
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  class="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  @click="toggleSort(column)"
                >
                  {{ column.label }}
                  <BaseIcon :name="sortIcon(column)" size="sm" />
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
              <th v-if="$slots.actions" scope="col" class="px-4 py-3 text-right">
                <span class="sr-only">ການດຳເນີນການ</span>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-line">
            <template v-if="loading">
              <tr v-for="index in 5" :key="`skeleton-${index}`">
                <td v-if="selectable" class="px-4 py-3">
                  <BaseSkeleton width="sm" height="sm" />
                </td>
                <td v-for="column in visibleColumns" :key="column.key" class="px-4 py-3">
                  <BaseSkeleton
                    :width="column.key === visibleColumns[0]?.key ? 'lg' : 'md'"
                    height="sm"
                  />
                </td>
                <td v-if="$slots.actions" class="px-4 py-3">
                  <BaseSkeleton width="sm" height="sm" />
                </td>
              </tr>
            </template>

            <tr v-else-if="error">
              <td :colspan="colSpan">
                <ErrorState :title="errorTitle" :message="errorMessage" @retry="$emit('retry')" />
              </td>
            </tr>

            <tr v-else-if="rows.length === 0">
              <td :colspan="colSpan">
                <EmptyState :title="emptyTitle" :description="emptyDescription" />
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="(row, index) in rows"
                :key="rowId(row, index)"
                class="transition-colors hover:bg-surface-muted"
                @click="$emit('row-click', row)"
              >
                <td v-if="selectable" class="px-4 py-3" @click.stop>
                  <input
                    type="checkbox"
                    :checked="isSelected(row, index)"
                    class="h-4 w-4 rounded border-line accent-primary"
                    :aria-label="`ເລືອກແຖວ ${index + 1}`"
                    @change="toggleRow(row, index)"
                  />
                </td>
                <td
                  v-for="column in visibleColumns"
                  :key="column.key"
                  class="px-4 py-3 text-sm text-foreground"
                  :class="[
                    alignClass(column.align),
                    column.align === 'right' ? 'whitespace-nowrap' : '',
                  ]"
                >
                  <slot
                    :name="`cell-${column.key}`"
                    :row="row"
                    :value="row[column.key]"
                    :index="index"
                  >
                    {{ cellValue(row, column) }}
                  </slot>
                </td>
                <td v-if="$slots.actions" class="px-4 py-3 text-right" @click.stop>
                  <slot name="actions" :row="row" :index="index" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="$emit('update:page', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { useSlots } from 'vue'
import { useScreen } from '~/composables/useScreen'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [String, Object], default: null },
  rowKey: { type: [String, Function], default: 'id' },
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  mobileCard: { type: Boolean, default: true },
  caption: { type: String, default: 'ຕາຕະລາງຂໍ້ມູນ' },
  emptyTitle: { type: String, default: 'ບໍ່ມີຂໍ້ມູນ' },
  emptyDescription: { type: String, default: '' },
  errorTitle: { type: String, default: 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ' },
  sort: { type: Object, default: null },
})

const emit = defineEmits(['update:page', 'update:selected', 'update:sort', 'retry', 'row-click'])

const slots = useSlots()
const { form } = useScreen()

const isMobileCard = computed(() => props.mobileCard && form.value === 'mobile')
const hasActions = computed(() => Boolean(slots.actions))
const visibleColumns = computed(() =>
  props.columns.filter((column) => !column.hideOn?.includes(form.value)),
)
const mobileTitleColumn = computed(() => visibleColumns.value[0] || { key: 'id', label: 'ID' })
const mobileDetailColumns = computed(() => visibleColumns.value.slice(1))
const colSpan = computed(
  () => visibleColumns.value.length + (props.selectable ? 1 : 0) + (hasActions.value ? 1 : 0),
)
const errorMessage = computed(() => {
  if (!props.error) return ''
  if (typeof props.error === 'string') return props.error
  return props.error.message || 'ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.'
})

const rowId = (row, index) => {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return row[props.rowKey] ?? index
}

const isSelected = (row, index) => props.selected.includes(rowId(row, index))
const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((row, index) => props.selected.includes(rowId(row, index))),
)

const toggleAll = (event) => {
  const ids = props.rows.map(rowId)
  const next = event.target.checked
    ? [...new Set([...props.selected, ...ids])]
    : props.selected.filter((id) => !ids.includes(id))
  emit('update:selected', next)
}

const toggleRow = (row, index) => {
  const id = rowId(row, index)
  const next = props.selected.includes(id)
    ? props.selected.filter((selectedId) => selectedId !== id)
    : [...props.selected, id]
  emit('update:selected', next)
}

const alignClass = (align) => {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

const ariaSort = (column) => {
  if (!column.sortable) return undefined
  if (props.sort?.key !== column.key) return 'none'
  return props.sort.order === 'desc' ? 'descending' : 'ascending'
}

const sortIcon = (column) => {
  if (props.sort?.key !== column.key) return 'unfold_more'
  return props.sort.order === 'desc' ? 'arrow_downward' : 'arrow_upward'
}

const toggleSort = (column) => {
  const nextOrder = props.sort?.key === column.key && props.sort.order === 'asc' ? 'desc' : 'asc'
  emit('update:sort', { key: column.key, order: nextOrder })
}

const cellValue = (row, column) => {
  const value = row[column.key]
  if (column.format) return column.format(value, row)
  if (value === null || value === undefined || value === '') return '—'
  return value
}
</script>
