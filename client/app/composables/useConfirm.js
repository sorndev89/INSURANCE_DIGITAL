import { reactive } from 'vue'

const state = reactive({
  open: false,
  title: 'ຢືນຢັນການດຳເນີນການ',
  message: '',
  confirmLabel: 'ຢືນຢັນ',
  cancelLabel: 'ຍົກເລີກ',
  tone: 'primary',
})

let resolver = null

const settle = (value) => {
  state.open = false
  if (resolver) {
    resolver(value)
    resolver = null
  }
}

export const useConfirm = () => {
  const confirm = (options = {}) =>
    new Promise((resolve) => {
      if (resolver) resolver(false)
      resolver = resolve
      Object.assign(state, {
        open: true,
        title: options.title || 'ຢືນຢັນການດຳເນີນການ',
        message: options.message || 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການດຳເນີນການນີ້?',
        confirmLabel: options.confirmLabel || 'ຢືນຢັນ',
        cancelLabel: options.cancelLabel || 'ຍົກເລີກ',
        tone: options.tone || 'primary',
      })
    })

  const accept = () => settle(true)
  const cancel = () => settle(false)

  return { state, confirm, accept, cancel }
}
