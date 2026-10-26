<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="sf-dialog modal modal-top fade m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
      @close="handleClose"
      @click="handleBackdrop"
    >
      <div class="flex max-h-[90dvh] flex-col p-6 text-center">
        <!-- Icon Badge -->
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          :class="theme.bg"
        >
          <BaseIcon :name="theme.icon" size="lg" :class="theme.color" />
        </div>

        <!-- Title & Message -->
        <h3 class="text-lg font-bold text-foreground">
          {{ state.title }}
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">
          {{ state.message }}
        </p>

        <!-- Actions -->
        <div
          class="mt-6 flex gap-2.5"
          :class="state.showCancel ? 'grid grid-cols-2' : 'flex justify-center'"
        >
          <BaseButton v-if="state.showCancel" variant="secondary" block @click="cancel">
            {{ state.cancelLabel }}
          </BaseButton>

          <BaseButton
            :variant="theme.buttonVariant"
            :block="state.showCancel"
            class="min-w-28"
            @click="accept"
          >
            {{ state.confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDialog } from '~/composables/useDialog'

const { state, accept, cancel } = useDialog()
const dialogRef = ref(null)

const themes = {
  success: {
    icon: 'check_circle',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    color: 'text-emerald-600 dark:text-emerald-400',
    buttonVariant: 'primary',
  },
  warning: {
    icon: 'warning',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    color: 'text-amber-600 dark:text-amber-400',
    buttonVariant: 'primary',
  },
  error: {
    icon: 'error',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    color: 'text-rose-600 dark:text-rose-400',
    buttonVariant: 'danger',
  },
  info: {
    icon: 'info',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    color: 'text-blue-600 dark:text-blue-400',
    buttonVariant: 'primary',
  },
  confirm: {
    icon: 'help_outline',
    bg: 'bg-primary/10 dark:bg-primary/20',
    color: 'text-primary-text',
    buttonVariant: 'primary',
  },
}

const theme = computed(() => themes[state.type] || themes.info)

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
  cancel()
}

const handleBackdrop = (event) => {
  if (event.target === dialogRef.value) {
    cancel()
  }
}

watch(
  () => state.open,
  (isOpen) => {
    if (isOpen) openDialog()
    else if (dialogRef.value?.open) close()
  },
)

onMounted(() => {
  if (state.open) openDialog()
})

onBeforeUnmount(() => lockBody(false))
</script>
