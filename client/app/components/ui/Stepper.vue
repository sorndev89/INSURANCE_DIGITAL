<template>
  <div>
    <div v-if="isMobile" class="rounded-xl border border-line bg-surface p-4">
      <div class="flex items-center justify-between text-xs text-muted">
        <span>ຂັ້ນຕອນ {{ current + 1 }} ຈາກ {{ steps.length }}</span>
        <span>{{ Math.round(((current + 1) / steps.length) * 100) }}%</span>
      </div>
      <p class="mt-1 text-sm font-bold text-foreground">{{ steps[current]?.label }}</p>
      <div class="mt-3 flex gap-1">
        <span
          v-for="(step, index) in steps"
          :key="step.label"
          class="h-1.5 flex-1 rounded-full"
          :class="index <= current ? 'bg-primary' : 'bg-line'"
        />
      </div>
    </div>

    <ol v-else class="flex items-center gap-2">
      <li
        v-for="(step, index) in steps"
        :key="step.label"
        class="flex min-w-0 flex-1 items-center gap-2"
        :aria-current="index === current ? 'step' : undefined"
      >
        <div class="flex min-w-0 items-center gap-2">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
            :class="circleClass(index)"
          >
            <BaseIcon v-if="index < current" name="check" size="sm" />
            <span v-else>{{ index + 1 }}</span>
          </span>
          <div class="min-w-0">
            <p
              class="truncate text-sm font-bold"
              :class="index <= current ? 'text-foreground' : 'text-muted'"
            >
              {{ step.label }}
            </p>
            <p v-if="step.description" class="hidden truncate text-xs text-muted lg:block">
              {{ step.description }}
            </p>
          </div>
        </div>
        <span
          v-if="index < steps.length - 1"
          class="h-px flex-1"
          :class="index < current ? 'bg-primary' : 'bg-line'"
        />
      </li>
    </ol>
  </div>
</template>

<script setup>
import { useScreen } from '~/composables/useScreen'

const props = defineProps({
  steps: { type: Array, default: () => [] },
  current: { type: Number, default: 0 },
})

const { isMobile } = useScreen()

const circleClass = (index) => {
  if (index < props.current) return 'border-primary bg-primary text-white'
  if (index === props.current) return 'border-primary bg-primary/10 text-primary-text'
  return 'border-line bg-surface text-muted'
}
</script>
