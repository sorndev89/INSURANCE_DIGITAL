<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDialog } from '~/composables/useDialog'

const { state, accept, cancel } = useDialog()
const dialogRef = ref(null)
const inputRef = ref(null)

const isInputInvalid = computed(() => {
  if (!state.input || !state.expectedValue) return false
  return state.inputValue.trim().toLowerCase() !== state.expectedValue.trim().toLowerCase()
})

const submitInput = () => {
  if (isInputInvalid.value) return
  accept()
}

const themes = {
  success: {
    icon: 'check-circle',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    color: 'text-emerald-600 dark:text-emerald-400',
    btnClass: 'bg-primary text-white hover:opacity-95',
  },
  warning: {
    icon: 'alert',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    color: 'text-amber-600 dark:text-amber-400',
    btnClass: 'bg-primary text-white hover:opacity-95',
  },
  error: {
    icon: 'error',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    color: 'text-rose-600 dark:text-rose-400',
    btnClass: 'bg-rose-600 text-white hover:bg-rose-700',
  },
  info: {
    icon: 'info',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    color: 'text-blue-600 dark:text-blue-400',
    btnClass: 'bg-primary text-white hover:opacity-95',
  },
  confirm: {
    icon: 'help',
    bg: 'bg-primary/10 dark:bg-primary/20',
    color: 'text-primary',
    btnClass: 'bg-primary text-white hover:opacity-95',
  },
}

const theme = computed(() => themes[state.type] || themes.info)

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
    if (isOpen) {
      openDialog()
      nextTick(() => inputRef.value?.focus())
    } else if (dialogRef.value?.open) {
      close()
    }
  },
)

onMounted(() => {
  if (state.open) openDialog()
})

onBeforeUnmount(() => lockBody(false))
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="sf-dialog modal modal-top fade m-auto my-6 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
      @close="handleClose"
      @click="handleBackdrop"
    >
      <div class="flex max-h-[90vh] flex-col p-6 text-center">
        <!-- Icon Badge -->
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          :class="theme.bg"
        >
          <BaseIcon :name="theme.icon" :size="32" :class="theme.color" />
        </div>

        <!-- Title & Message -->
        <h3 class="text-base font-bold text-foreground">
          {{ state.title }}
        </h3>
        <p class="mt-2 text-xs leading-relaxed text-muted whitespace-pre-line">
          {{ state.message }}
        </p>

        <!-- Confirmation input -->
        <div v-if="state.input" class="mt-4 text-left">
          <label v-if="state.inputLabel" class="sf-label" for="dialog-confirm-input">
            {{ state.inputLabel }}
          </label>
          <input
            id="dialog-confirm-input"
            ref="inputRef"
            v-model="state.inputValue"
            class="sf-input"
            type="text"
            autocomplete="off"
            :placeholder="state.inputPlaceholder"
            @keyup.enter="submitInput"
          />
          <p v-if="state.inputHint" class="mt-1 text-[11px] text-muted">
            {{ state.inputHint }}
          </p>
        </div>

        <!-- Actions -->
        <div
          class="mt-6 flex gap-2.5"
          :class="state.showCancel ? 'grid grid-cols-2' : 'flex justify-center'"
        >
          <button
            v-if="state.showCancel"
            type="button"
            class="h-10 w-full rounded-xl border border-line bg-surface px-4 text-xs font-bold text-foreground transition hover:bg-surface-muted active:scale-[0.98]"
            @click="cancel"
          >
            {{ state.cancelLabel }}
          </button>

          <button
            type="button"
            class="h-10 rounded-xl px-5 text-xs font-bold transition shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            :class="[theme.btnClass, state.showCancel ? 'w-full' : 'min-w-28']"
            :disabled="isInputInvalid"
            @click="accept"
          >
            {{ state.confirmLabel }}
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
