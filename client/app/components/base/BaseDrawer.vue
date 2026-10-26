<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="sf-dialog m-0 border-0 bg-transparent p-0 text-foreground"
      :class="dialogClass"
      @close="handleClose"
      @click="handleBackdrop"
    >
      <div class="flex h-full flex-col bg-surface shadow-2xl" @click.stop>
        <header
          v-if="title || $slots.header"
          class="flex items-center justify-between gap-4 border-b border-line px-5 py-4"
        >
          <slot name="header">
            <h2 class="text-lg font-bold">{{ title }}</h2>
          </slot>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            aria-label="ປິດ"
            @click="close"
          >
            <BaseIcon name="close" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="border-t border-line p-4">
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placement: { type: String, default: 'left' },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref(null)

const dialogClass = computed(() => {
  if (props.placement === 'bottom') {
    return 'sf-drawer-bottom mt-auto h-auto max-h-[88dvh] w-full max-w-none rounded-t-2xl'
  }
  if (props.placement === 'right') {
    return 'sf-drawer-right h-dvh max-h-none w-full max-w-sm ml-auto'
  }
  return 'sf-drawer-left h-dvh max-h-none w-full max-w-sm mr-auto'
})

const lockBody = (locked) => {
  if (!import.meta.client) return
  document.body.style.overflow = locked ? 'hidden' : ''
}

const openDialog = () => {
  const dialog = dialogRef.value
  if (!dialog || dialog.open) return
  dialog.showModal()
  lockBody(true)
}

const close = () => {
  dialogRef.value?.close()
}

const handleClose = () => {
  lockBody(false)
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdrop = (event) => {
  if (props.closeOnBackdrop && event.target === dialogRef.value) close()
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) openDialog()
    else if (dialogRef.value?.open) close()
  },
)

onMounted(() => {
  if (props.modelValue) openDialog()
})

onBeforeUnmount(() => lockBody(false))

defineExpose({ close })
</script>
