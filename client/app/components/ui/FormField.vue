<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="forId" class="block text-sm font-bold text-foreground">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <slot />
    <p v-if="error" :id="errorId" class="text-xs font-bold text-danger" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  for: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const forId = computed(() => props.for || undefined)
const hintId = computed(() => (props.for ? `${props.for}-hint` : undefined))
const errorId = computed(() => (props.for ? `${props.for}-error` : undefined))
</script>
