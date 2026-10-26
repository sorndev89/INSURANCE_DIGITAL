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
  submitted_to_insurer: { label: 'ສົ່ງຕໍ່ບໍລິສັດປະກັນ', tone: 'info' },
  surveyor_assigned: { label: 'ກວດກາຄວາມເສຍຫາຍ', tone: 'info' },
  repairing: { label: 'ກຳລັງສ້ອມແປງ', tone: 'warning' },
  settled: { label: 'ຊົດເຊີຍແລ້ວ', tone: 'success' },
  closed: { label: 'ປິດເລື່ອງ', tone: 'neutral' },
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

export const CUSTOMER_TYPES = [
  { value: 'individual', label: 'ບຸກຄົນທົ່ວໄປ (Individual)' },
  { value: 'corporate', label: 'ນິຕິບຸກຄົນ / ບໍລິສັດ (Corporate)' },
]

export const PRODUCT_TYPES = [
  { value: 'Motor', label: 'ປະກັນໄພລົດຍົນ (Motor)' },
  { value: 'Health', label: 'ປະກັນສຸຂະພາບ (Health)' },
  { value: 'Fire', label: 'ປະກັນອັກຄີໄພ & ຊັບສິນ (Fire/Property)' },
  { value: 'Accident', label: 'ປະກັນອຸບັດຕິເຫດສ່ວນບຸກຄົນ (PA)' },
  { value: 'Travel', label: 'ປະກັນການເດີນທາງ (Travel)' },
]

export const GENDERS = [
  { value: 'male', label: 'ຊາຍ' },
  { value: 'female', label: 'ຍິງ' },
  { value: 'other', label: 'ອື່ນໆ' },
]

export const USAGE_TYPES = [
  { value: 'private', label: 'ສ່ວນຕົວ' },
  { value: 'commercial', label: 'ທຸລະກິດ/ຮັບຈ້າງ' },
  { value: 'rental', label: 'ໃຫ້ເຊົ່າ' },
]

export const PAYMENT_METHODS = [
  { value: 'bcel', label: 'BCEL One' },
  { value: 'bank', label: 'ໂອນທະນາຄານ (Bank Transfer)' },
  { value: 'cash', label: 'ເງິນສົດ (Cash)' },
]

export const ROLES = [
  { value: 'admin', label: 'ຜູ້ດູແລລະບົບ' },
  { value: 'staff', label: 'ພະນັກງານ' },
  { value: 'agent', label: 'ຕົວແທນ' },
  { value: 'customer', label: 'ລູກຄ້າ' },
]

export const LAO_PROVINCES = [
  { value: 'Vientiane Capital', label: 'ນະຄອນຫຼວງວຽງຈັນ' },
  { value: 'Vientiane', label: 'ແຂວງ ວຽງຈັນ' },
  { value: 'Luang Prabang', label: 'ແຂວງ ຫຼວງພະບາງ' },
  { value: 'Champasak', label: 'ແຂວງ ຈຳປາສັກ' },
  { value: 'Savannakhet', label: 'ແຂວງ ສະຫວັນນະເຂດ' },
  { value: 'Khammouane', label: 'ແຂວງ ຄຳມ່ວນ' },
  { value: 'Bolikhamxay', label: 'ແຂວງ ບໍລິຄຳໄຊ' },
  { value: 'Xayabury', label: 'ແຂວງ ໄຊຍະບູລີ' },
  { value: 'Oudomxay', label: 'ແຂວງ ອຸດົມໄຊ' },
  { value: 'Bokeo', label: 'ແຂວງ ບໍ່ແກ້ວ' },
  { value: 'Luang Namtha', label: 'ແຂວງ ຫຼວງນ້ຳທາ' },
  { value: 'Phongsaly', label: 'ແຂວງ ຜົ້ງສາລີ' },
  { value: 'Houaphanh', label: 'ແຂວງ ຫົວພັນ' },
  { value: 'Xieng Khouang', label: 'ແຂວງ ຊຽງຂວາງ' },
  { value: 'Saravane', label: 'ແຂວງ ສາລະວັນ' },
  { value: 'Sekong', label: 'ແຂວງ ເຊກອງ' },
  { value: 'Attapeu', label: 'ແຂວງ ອັດຕະປື' },
  { value: 'Xaysomboun', label: 'ແຂວງ ໄຊສົມບູນ' },
]
