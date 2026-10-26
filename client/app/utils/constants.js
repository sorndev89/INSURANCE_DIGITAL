export const STATUS = {
  pending: { label: 'ລໍຖ້າດຳເນີນການ', tone: 'warning' },
  active: { label: 'ມີຜົນ', tone: 'success' },
  expired: { label: 'ໝົດອາຍຸ', tone: 'danger' },
  cancelled: { label: 'ຍົກເລີກ', tone: 'neutral' },
  approved: { label: 'ອະນຸມັດ', tone: 'success' },
  rejected: { label: 'ປະຕິເສດ', tone: 'danger' },
  reviewing: { label: 'ກຳລັງກວດສອບ', tone: 'info' },
  paid: { label: 'ຈ່າຍແລ້ວ', tone: 'success' },
  unpaid: { label: 'ຍັງບໍ່ຈ່າຍ', tone: 'warning' },
  overdue: { label: 'ເກີນກຳນົດ', tone: 'danger' },
  draft: { label: 'ຮ່າງ', tone: 'neutral' },
  sent: { label: 'ສົ່ງແລ້ວ', tone: 'info' },
  accepted: { label: 'ຍອມຮັບ', tone: 'success' },
  completed: { label: 'ສຳເລັດ', tone: 'success' },
  failed: { label: 'ລົ້ມເຫຼວ', tone: 'danger' },
}

export const getStatusMeta = (status) => {
  const key = String(status || '').toLowerCase()
  return (
    STATUS[key] || {
      label: status || '—',
      tone: 'neutral',
    }
  )
}

export const PRODUCT_TYPES = [
  { value: 'Motor', label: 'ປະກັນໄພລົດຍົນ' },
  { value: 'Health', label: 'ປະກັນສຸຂະພາບ' },
  { value: 'Fire', label: 'ປະກັນອັກຄີໄພ' },
  { value: 'Accident', label: 'ປະກັນອຸບັດຕິເຫດ' },
]

export const GENDERS = [
  { value: 'male', label: 'ຊາຍ' },
  { value: 'female', label: 'ຍິງ' },
  { value: 'other', label: 'ອື່ນໆ' },
]

export const USAGE_TYPES = [
  { value: 'private', label: 'ສ່ວນຕົວ' },
  { value: 'commercial', label: 'ທຸລະກິດ' },
]

export const PAYMENT_METHODS = [
  { value: 'bcel', label: 'BCEL One' },
  { value: 'bank', label: 'ໂອນທະນາຄານ' },
  { value: 'cash', label: 'ເງິນສົດ' },
]

export const ROLES = [
  { value: 'admin', label: 'ຜູ້ດູແລລະບົບ' },
  { value: 'staff', label: 'ພະນັກງານ' },
  { value: 'agent', label: 'ຕົວແທນ' },
  { value: 'customer', label: 'ລູກຄ້າ' },
]
