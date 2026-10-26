<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center"
      :class="triggerClass"
      :aria-label="label || undefined"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <slot name="trigger" :open="open" />
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="scale-95 opacity-0 -translate-y-1"
      enter-to-class="scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-120 ease-in"
      leave-from-class="scale-100 opacity-100 translate-y-0"
      leave-to-class="scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        ref="menu"
        class="absolute z-50 mt-2 max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-xl"
        :class="[alignClass, widthClass]"
        role="menu"
      >
        <slot name="menu" :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  align: { type: String, default: 'end' },
  width: { type: String, default: 'md' },
  label: { type: String, default: '' },
  triggerClass: { type: String, default: 'rounded-xl p-1.5 hover:bg-surface-muted' },
})

const open = ref(false)
const root = ref(null)
const menu = ref(null)

const alignClass = computed(() => (props.align === 'start' ? 'left-0' : 'right-0'))
const widthClass = computed(() => {
  if (props.width === 'sm') return 'w-48'
  if (props.width === 'lg') return 'w-72'
  return 'w-60'
})

const toggle = () => {
  open.value = !open.value
}

const close = () => {
  open.value = false
}

onClickOutside(root, close)

useEventListener(document, 'keydown', (event) => {
  if (event.key === 'Escape') close()
})

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  menu.value?.querySelector('[role="menuitem"], button, a')?.focus()
})
</script>
