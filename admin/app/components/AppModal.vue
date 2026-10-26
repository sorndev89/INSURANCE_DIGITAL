<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  wide: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="sf-card w-full" :class="wide ? 'max-w-3xl' : 'max-w-lg'">
        <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">{{ title }}</h2>
            <p v-if="subtitle" class="mt-1 text-xs text-slate-500">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="rounded-md px-2 py-1 text-lg leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="ປິດ"
            @click="$emit('update:modelValue', false)"
          >
            ×
          </button>
        </header>
        <div class="px-6 py-5">
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          class="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-6 py-4"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
