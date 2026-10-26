<template>
  <fieldset class="space-y-1.5">
    <legend v-if="label" class="mb-1 block text-sm font-bold text-foreground">{{ label }}</legend>
    <div class="grid gap-3 sm:grid-cols-2">
      <BaseInput
        :model-value="from"
        type="date"
        label="ຈາກວັນທີ"
        :max="to || max"
        @update:model-value="$emit('update:from', $event)"
      />
      <BaseInput
        :model-value="to"
        type="date"
        label="ຮອດວັນທີ"
        :min="from || min"
        :max="max"
        @update:model-value="$emit('update:to', $event)"
      />
    </div>
    <p v-if="error" class="text-xs font-bold text-danger" role="alert">{{ error }}</p>
  </fieldset>
</template>

<script setup>
defineProps({
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  label: { type: String, default: 'ໄລຍະວັນທີ' },
  error: { type: String, default: '' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
})

defineEmits(['update:from', 'update:to'])
</script>
