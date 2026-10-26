<template>
  <BaseModal v-model="open" title="ຄົ້ນຫາ" size="lg">
    <div class="space-y-4">
      <div class="relative">
        <BaseIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          autocomplete="off"
          class="h-12 w-full rounded-lg border border-line bg-surface pl-10 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
          placeholder="ຄົ້ນຫາໜ້າ, ປະກັນໄພ, ລູກຄ້າ..."
          aria-label="ຄຳຄົ້ນຫາ"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="selectActive"
        />
      </div>

      <div v-if="results.length > 0" class="space-y-1" role="listbox" aria-label="ຜົນການຄົ້ນຫາ">
        <button
          v-for="(item, index) in results"
          :key="item.to"
          type="button"
          role="option"
          :aria-selected="index === activeIndex"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors"
          :class="
            index === activeIndex
              ? 'bg-primary/10 text-primary-text'
              : 'text-foreground hover:bg-surface-muted'
          "
          @mouseenter="activeIndex = index"
          @click="navigate(item)"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted">
            <BaseIcon :name="item.icon" size="sm" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold">{{ item.label }}</span>
            <span class="block text-xs text-muted">{{ item.to }}</span>
          </span>
          <BaseIcon name="arrow_forward" size="sm" class="text-muted" />
        </button>
      </div>

      <div v-else class="rounded-lg border border-dashed border-line px-4 py-10 text-center">
        <BaseIcon name="search_off" size="xl" class="text-muted" />
        <p class="mt-2 text-sm font-bold">ບໍ່ພົບຜົນການຄົ້ນຫາ</p>
        <p class="mt-1 text-xs text-muted">ລອງພິມຊື່ໜ້າ ຫຼື ເສັ້ນທາງອື່ນ</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
const open = defineModel({ type: Boolean, default: false })
const { flatItems } = useNavigation()
const router = useRouter()
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)

const results = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const items = flatItems.value
  if (!keyword) return items.slice(0, 10)
  return items
    .filter(
      (item) =>
        item.label.toLowerCase().includes(keyword) || item.to.toLowerCase().includes(keyword),
    )
    .slice(0, 10)
})

watch(query, () => {
  activeIndex.value = 0
})

watch(open, async (value) => {
  if (!value) return
  query.value = ''
  activeIndex.value = 0
  await nextTick()
  inputRef.value?.focus()
})

const move = (step) => {
  if (!results.value.length) return
  activeIndex.value = (activeIndex.value + step + results.value.length) % results.value.length
}

const navigate = (item) => {
  open.value = false
  router.push(item.to)
}

const selectActive = () => {
  const item = results.value[activeIndex.value]
  if (item) navigate(item)
}

useEventListener(document, 'keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = true
  }
})
</script>
