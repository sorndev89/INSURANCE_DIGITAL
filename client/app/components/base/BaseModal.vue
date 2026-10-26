<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="sf-dialog modal modal-top fade m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
      :class="sizeClass"
      @close="handleClose"
      @click="handleBackdrop"
    >
      <div class="flex max-h-[90dvh] flex-col">
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

        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="border-t border-line px-5 py-4">
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
  size: { type: String, default: 'md' },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref(null)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'max-w-md'
  if (props.size === 'lg') return 'max-w-2xl'
  if (props.size === 'xl') return 'max-w-4xl'
  return 'max-w-lg'
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
