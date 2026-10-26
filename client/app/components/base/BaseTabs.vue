<template>
  <div class="flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="ແທັບ">
    <button
      v-for="(item, index) in items"
      :key="item.key"
      :ref="(element) => setTabRef(element, index)"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.key"
      :tabindex="modelValue === item.key ? 0 : -1"
      class="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors"
      :class="
        modelValue === item.key
          ? 'border-primary text-primary-text'
          : 'border-transparent text-muted hover:text-foreground'
      "
      @click="$emit('update:modelValue', item.key)"
      @keydown.left.prevent="move(index, -1)"
      @keydown.right.prevent="move(index, 1)"
      @keydown.home.prevent="focusTab(0)"
      @keydown.end.prevent="focusTab(items.length - 1)"
    >
      {{ item.label }}
      <BaseBadge v-if="item.count !== undefined" tone="neutral">{{ item.count }}</BaseBadge>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])
const tabRefs = ref([])

const setTabRef = (element, index) => {
  if (element) tabRefs.value[index] = element
}

const focusTab = (index) => {
  const item = props.items[index]
  if (!item) return
  emit('update:modelValue', item.key)
  tabRefs.value[index]?.focus()
}

const move = (index, step) => {
  const next = (index + step + props.items.length) % props.items.length
  focusTab(next)
}
</script>
