<template>
  <BaseModal
    :model-value="state.open"
    :title="state.title"
    size="sm"
    @update:model-value="handleOpenChange"
  >
    <p class="text-sm leading-relaxed text-muted">{{ state.message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="cancel">{{ state.cancelLabel }}</BaseButton>
        <BaseButton :variant="state.tone === 'danger' ? 'danger' : 'primary'" @click="accept">
          {{ state.confirmLabel }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
const { state, accept, cancel } = useConfirm()

const handleOpenChange = (open) => {
  if (!open) cancel()
}
</script>
