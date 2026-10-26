<template>
  <section
    class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 lg:flex-row lg:items-center lg:justify-between"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-thin">
      <slot name="start" />
    </div>
    <div
      v-if="$slots.end"
      class="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap lg:shrink-0"
    >
      <slot name="end" />
    </div>
    <slot />
  </section>
</template>
