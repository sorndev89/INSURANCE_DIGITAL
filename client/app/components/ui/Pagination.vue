<template>
  <nav
    class="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
    aria-label="ການແບ່ງໜ້າ"
  >
    <p class="text-xs text-muted">ສະແດງ {{ startItem }}–{{ endItem }} ຈາກ {{ total }} ລາຍການ</p>

    <div class="flex items-center gap-1">
      <BaseButton
        variant="ghost"
        size="md"
        icon-only
        label="ໜ້າກ່ອນ"
        icon="chevron_left"
        :disabled="page <= 1"
        @click="go(page - 1)"
      />
      <div class="hidden items-center gap-1 sm:flex">
        <template v-for="(item, index) in pages" :key="`${item}-${index}`">
          <span v-if="item === '...'" class="px-2 text-sm text-muted">…</span>
          <button
            v-else
            type="button"
            class="flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-bold transition-all duration-150 active:scale-95 select-none"
            :class="
              item === page
                ? 'bg-primary text-white shadow-cta'
                : 'text-muted hover:bg-surface-muted hover:text-foreground'
            "
            :aria-current="item === page ? 'page' : undefined"
            @click="go(item)"
          >
            {{ item }}
          </button>
        </template>
      </div>
      <span class="px-2 text-sm font-bold text-muted sm:hidden">{{ page }} / {{ totalPages }}</span>
      <BaseButton
        variant="ghost"
        size="md"
        icon-only
        label="ໜ້າຕໍ່ໄປ"
        icon="chevron_right"
        :disabled="page >= totalPages"
        @click="go(page + 1)"
      />
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  siblingCount: { type: Number, default: 1 },
})

const emit = defineEmits(['update:page'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const startItem = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const endItem = computed(() => Math.min(props.page * props.pageSize, props.total))

const pages = computed(() => {
  const total = totalPages.value
  const current = props.page
  const delta = props.siblingCount
  if (total <= 5 + delta * 2) return Array.from({ length: total }, (_, index) => index + 1)

  const range = []
  const left = Math.max(2, current - delta)
  const right = Math.min(total - 1, current + delta)
  range.push(1)
  if (left > 2) range.push('...')
  for (let page = left; page <= right; page++) range.push(page)
  if (right < total - 1) range.push('...')
  range.push(total)
  return range
})

const go = (nextPage) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === props.page) return
  emit('update:page', nextPage)
}
</script>
