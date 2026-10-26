<template>
  <div
    class="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-96"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border border-line border-l-4 bg-surface p-4 shadow-xl"
        :class="borderClass(toast.tone)"
        role="status"
      >
        <span class="mt-0.5" :class="iconClass(toast.tone)">
          <BaseIcon :name="iconName(toast.tone)" size="md" />
        </span>
        <div class="min-w-0 flex-1">
          <p v-if="toast.title" class="text-sm font-bold text-foreground">{{ toast.title }}</p>
          <p
            class="text-sm"
            :class="toast.title ? 'mt-0.5 text-muted' : 'font-bold text-foreground'"
          >
            {{ toast.message }}
          </p>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground"
          aria-label="ປິດການແຈ້ງເຕີມ"
          @click="remove(toast.id)"
        >
          <BaseIcon name="close" size="sm" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, remove } = useToast()

const iconName = (tone) => {
  if (tone === 'success') return 'check_circle'
  if (tone === 'danger') return 'error'
  if (tone === 'warning') return 'warning'
  return 'info'
}

const iconClass = (tone) => {
  if (tone === 'success') return 'text-success'
  if (tone === 'danger') return 'text-danger'
  if (tone === 'warning') return 'text-warning'
  return 'text-info'
}

const borderClass = (tone) => {
  if (tone === 'success') return 'border-l-success'
  if (tone === 'danger') return 'border-l-danger'
  if (tone === 'warning') return 'border-l-warning'
  return 'border-l-info'
}
</script>
