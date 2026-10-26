import { useState } from '#app'

let counter = 0

export const useToast = () => {
  const toasts = useState('saiyfon-toasts', () => [])

  const remove = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const add = (message, options = {}) => {
    const id = `toast-${Date.now()}-${counter++}`
    const toast = {
      id,
      message,
      title: options.title || '',
      tone: options.tone || 'info',
      duration: options.duration ?? 4000,
    }
    toasts.value = [...toasts.value, toast]
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }

  const success = (message, options = {}) => add(message, { ...options, tone: 'success' })
  const error = (message, options = {}) => add(message, { ...options, tone: 'danger' })
  const warning = (message, options = {}) => add(message, { ...options, tone: 'warning' })
  const info = (message, options = {}) => add(message, { ...options, tone: 'info' })

  return { toasts, add, remove, success, error, warning, info }
}
