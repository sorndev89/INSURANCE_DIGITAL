import { computed, ref } from 'vue'
import { buildNotifications } from '~/mocks/notifications'

const notifications = ref(buildNotifications())

export const useNotifications = () => {
  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)
  const birthdayCount = computed(
    () => notifications.value.filter((item) => item.type === 'birthday').length,
  )

  const markRead = (id) => {
    const item = notifications.value.find((notification) => notification.id === id)
    if (item) item.read = true
  }

  const markAllRead = () => {
    notifications.value.forEach((item) => {
      item.read = true
    })
  }

  const reset = () => {
    notifications.value = buildNotifications()
  }

  return { notifications, unreadCount, birthdayCount, markRead, markAllRead, reset }
}
