<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  wide: { type: Boolean, default: false },
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref(null)

const lockBody = (locked) => {
  if (typeof document === 'undefined') return
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
  if (props.closeOnBackdrop && event.target === dialogRef.value) {
    close()
  }
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

onBeforeUnmount(() => {
  lockBody(false)
})

defineExpose({ close })
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="sf-dialog modal modal-top fade m-auto my-6 w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
      :class="wide ? 'max-w-3xl' : 'max-w-lg'"
      @close="handleClose"
      @click="handleBackdrop"
    >
      <div class="flex max-h-[90vh] flex-col">
        <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <slot name="header">
              <h2 class="text-base font-bold text-foreground">{{ title }}</h2>
              <p v-if="subtitle" class="mt-0.5 text-xs text-muted">{{ subtitle }}</p>
            </slot>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-foreground"
            aria-label="ປິດ"
            @click="close"
          >
            ✕
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4"
        >
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
