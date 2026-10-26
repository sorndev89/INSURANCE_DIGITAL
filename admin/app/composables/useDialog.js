import { reactive } from 'vue'

const state = reactive({
  open: false,
  type: 'confirm', // 'success' | 'warning' | 'error' | 'info' | 'confirm'
  title: '',
  message: '',
  confirmLabel: 'ຕົກລົງ',
  cancelLabel: 'ຍົກເລີກ',
  showCancel: false,
  input: false,
  inputLabel: '',
  inputPlaceholder: '',
  inputHint: '',
  inputValue: '',
  expectedValue: '',
})

let resolver = null

const settle = (value) => {
  state.open = false
  if (resolver) {
    resolver(value)
    resolver = null
  }
}

export const useDialog = () => {
  const show = (options = {}) =>
    new Promise((resolve) => {
      if (resolver) resolver(false)
      resolver = resolve

      const type = options.type || 'info'
      const isConfirm = type === 'confirm'

      const defaultTitles = {
        success: 'ສຳເລັດ',
        warning: 'ແຈ້ງເຕືອນ',
        error: 'ເກີດຂໍ້ຜິດພາດ',
        info: 'ແຈ້ງໃຫ້ຊາບ',
        confirm: 'ຢືນຢັນການດຳເນີນການ',
      }

      const defaultConfirmLabels = {
        success: 'ຕົກລົງ',
        warning: 'ຮັບຊາບ',
        error: 'ປິດ',
        info: 'ຕົກລົງ',
        confirm: 'ຢືນຢັນ',
      }

      Object.assign(state, {
        open: true,
        type,
        title: options.title || defaultTitles[type] || 'ແຈ້ງເຕືອນ',
        message: options.message || '',
        confirmLabel: options.confirmLabel || defaultConfirmLabels[type] || 'ຕົກລົງ',
        cancelLabel: options.cancelLabel || 'ຍົກເລີກ',
        showCancel: options.showCancel !== undefined ? options.showCancel : isConfirm,
        input: options.input === true,
        inputLabel: options.inputLabel || '',
        inputPlaceholder: options.inputPlaceholder || '',
        inputHint: options.inputHint || '',
        inputValue: '',
        expectedValue: options.expectedValue || '',
      })
    })

  const success = (message, title = 'ສຳເລັດ', options = {}) =>
    show({ type: 'success', title, message, ...options })

  const warning = (message, title = 'ແຈ້ງເຕືອນ', options = {}) =>
    show({ type: 'warning', title, message, ...options })

  const alert = (message, title = 'ແຈ້ງເຕືອນ', options = {}) =>
    show({ type: 'warning', title, message, ...options })

  const error = (message, title = 'ເກີດຂໍ້ຜິດພາດ', options = {}) =>
    show({ type: 'error', title, message, ...options })

  const info = (message, title = 'ແຈ້ງໃຫ້ຊາບ', options = {}) =>
    show({ type: 'info', title, message, ...options })

  const confirm = (options = {}) => {
    if (typeof options === 'string') {
      return show({
        type: 'confirm',
        title: 'ຢືນຢັນການດຳເນີນການ',
        message: options,
        showCancel: true,
      })
    }
    return show({
      type: 'confirm',
      title: options.title || 'ຢືນຢັນການດຳເນີນການ',
      message: options.message || 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການດຳເນີນການນີ້?',
      confirmLabel: options.confirmLabel || 'ຢືນຢັນ',
      cancelLabel: options.cancelLabel || 'ຍົກເລີກ',
      showCancel: true,
      ...options,
    })
  }

  const prompt = (options = {}) => {
    if (typeof options === 'string') options = { message: options }
    return show({
      ...options,
      type: 'confirm',
      title: options.title || 'ຢືນຢັນການດຳເນີນການ',
      message: options.message || '',
      confirmLabel: options.confirmLabel || 'ຢືນຢັນ',
      cancelLabel: options.cancelLabel || 'ຍົກເລີກ',
      showCancel: true,
      input: true,
      inputLabel: options.inputLabel || '',
      inputPlaceholder: options.inputPlaceholder || '',
      inputHint: options.inputHint || '',
      expectedValue: options.expectedValue || '',
    })
  }

  const accept = () => settle(true)
  const cancel = () => settle(false)

  return {
    state,
    show,
    success,
    warning,
    alert,
    error,
    info,
    confirm,
    prompt,
    accept,
    cancel,
  }
}
