export const MESSAGES = {
  required: 'ກະລຸນາປ້ອນຂໍ້ມູນ',
  email: 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ',
  phone: 'ເບີໂທຕ້ອງເປັນເບີລາວ ເຊັ່ນ 020 5555 1234',
  number: 'ກະລຸນາປ້ອນຕົວເລກ',
  minLength: (length) => `ຕ້ອງມີຢ່າງໜ້ອຍ ${length} ຕົວອັກສອນ`,
  maxLength: (length) => `ຕ້ອງບໍ່ເກີນ ${length} ຕົວອັກສອນ`,
  minValue: (value) => `ຕ້ອງບໍ່ໜ້ອຍກວ່າ ${value}`,
  maxValue: (value) => `ຕ້ອງບໍ່ເກີນ ${value}`,
  date: 'ວັນທີບໍ່ຖືກຕ້ອງ',
}

export const required = (value) => {
  if (value === null || value === undefined) return MESSAGES.required
  if (typeof value === 'string' && value.trim() === '') return MESSAGES.required
  if (Array.isArray(value) && value.length === 0) return MESSAGES.required
  return ''
}

export const email = (value) => {
  if (!value) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? '' : MESSAGES.email
}

export const phone = (value) => {
  if (!value) return ''
  const digits = String(value).replace(/\D/g, '')
  const normalized = digits.startsWith('856') ? `0${digits.slice(3)}` : digits
  return /^0?20\d{7,8}$/.test(normalized) ? '' : MESSAGES.phone
}

export const numeric = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  return Number.isFinite(Number(value)) ? '' : MESSAGES.number
}

export const minLength = (length) => (value) => {
  if (!value) return ''
  return String(value).length >= length ? '' : MESSAGES.minLength(length)
}

export const maxLength = (length) => (value) => {
  if (!value) return ''
  return String(value).length <= length ? '' : MESSAGES.maxLength(length)
}

export const minValue = (minimum) => (value) => {
  if (value === '' || value === null || value === undefined) return ''
  return Number(value) >= minimum ? '' : MESSAGES.minValue(minimum)
}

export const maxValue = (maximum) => (value) => {
  if (value === '' || value === null || value === undefined) return ''
  return Number(value) <= maximum ? '' : MESSAGES.maxValue(maximum)
}

export const date = (value) => {
  if (!value) return ''
  return Number.isNaN(new Date(value).getTime()) ? MESSAGES.date : ''
}

export const validate = (value, checks = []) => {
  for (const check of checks) {
    const message = check(value)
    if (message) return message
  }
  return ''
}
