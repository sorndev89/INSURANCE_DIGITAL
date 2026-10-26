<template>
  <span class="group relative inline-flex">
    <slot />
    <span
      :id="tooltipId"
      role="tooltip"
      class="pointer-events-none absolute z-50 w-max max-w-56 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-bold text-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      :class="placementClass"
    >
      {{ label }}
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  placement: { type: String, default: 'top' },
})

const generatedId = useId()
const tooltipId = computed(() => `tooltip-${generatedId}`)
const placementClass = computed(() => {
  if (props.placement === 'bottom') return 'left-1/2 top-full mt-2 -translate-x-1/2'
  if (props.placement === 'left') return 'right-full top-1/2 mr-2 -translate-y-1/2'
  if (props.placement === 'right') return 'left-full top-1/2 ml-2 -translate-y-1/2'
  return 'bottom-full left-1/2 mb-2 -translate-x-1/2'
})
</script>
