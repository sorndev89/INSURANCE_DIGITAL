<template>
  <BaseDropdown
    align="end"
    width="lg"
    label="ການແຈ້ງເຕີມ"
    trigger-class="relative flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-muted hover:text-primary-text"
  >
    <template #trigger>
      <BaseIcon name="notifications" size="lg" />
      <span
        v-if="unreadCount > 0"
        class="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface"
        aria-hidden="true"
      />
    </template>

    <template #menu="{ close }">
      <div class="flex items-center justify-between px-2 py-1.5">
        <p class="text-sm font-bold">ການແຈ້ງເຕີມ</p>
        <BaseBadge tone="primary">{{ unreadCount }} ໃໝ່</BaseBadge>
      </div>
      <div class="my-1 border-t border-line" />
      <button
        v-for="item in notifications"
        :key="item.id"
        type="button"
        role="menuitem"
        class="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-surface-muted"
        @click="markRead(item.id)"
      >
        <span
          class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text"
        >
          <BaseIcon :name="item.icon" size="sm" />
        </span>
        <span class="min-w-0 flex-1">
          <span
            class="block text-sm font-bold"
            :class="item.read ? 'text-muted' : 'text-foreground'"
          >
            {{ item.title }}
          </span>
          <span class="mt-0.5 block text-xs text-muted">{{ item.time }}</span>
        </span>
        <span
          v-if="!item.read"
          class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          aria-hidden="true"
        />
      </button>
      <div class="my-1 border-t border-line" />
      <button
        type="button"
        role="menuitem"
        class="w-full rounded-lg px-2 py-2 text-center text-sm font-bold text-primary-text transition-colors hover:bg-primary/10"
        @click="handleMarkAllRead(close)"
      >
        ອ່ານທັງໝົດ
      </button>
    </template>
  </BaseDropdown>
</template>

<script setup>
const notifications = ref([
  {
    id: 1,
    title: 'ປະກັນໄພ P-2024-001234 ໃກ້ໝົດອາຍຸ',
    time: '10 ນາທີກ່ອນ',
    icon: 'schedule',
    read: false,
  },
  {
    id: 2,
    title: 'ມີເຄມໃໝ່ລໍຖ້າກວດສອບ',
    time: '1 ຊົ່ວໂມງກ່ອນ',
    icon: 'assignment_late',
    read: false,
  },
  {
    id: 3,
    title: 'ການຊຳລະເງິນສຳເລັດ',
    time: 'ມື້ວານນີ້',
    icon: 'check_circle',
    read: true,
  },
])

const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

const markRead = (id) => {
  const item = notifications.value.find((notification) => notification.id === id)
  if (item) item.read = true
}

const markAllRead = () => {
  notifications.value.forEach((item) => {
    item.read = true
  })
}

const handleMarkAllRead = (close) => {
  markAllRead()
  close()
}
</script>
