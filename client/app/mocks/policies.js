import { insurerByCode, insurers } from './insurers'
import { agents } from './agents'

const companyName = (code) => insurerByCode(code)?.name || code
const companyShort = (code) => insurerByCode(code)?.nameLao || companyName(code)

const makePolicy = ({
  id,
  customerId,
  customerName,
  customerPhone,
  agentId,
  agentName,
  companyCode,
  productType,
  productName,
  vehicle,
  startDate,
  endDate,
  netPremium,
  status,
  createdAt,
  customerType = 'individual',
  points = 5000,
}) => {
  const vatAmount = Math.round(netPremium * 0.07)
  const registrationFee = 20000
  const brokerCommissionRate = insurerByCode(companyCode)?.defaultCommissionRate || 15
  const agentCommissionRate = 5
  const agentCommissionAmount = Math.round((netPremium * agentCommissionRate) / 100)
  return {
    id,
    policyNumber: `P-${startDate.slice(0, 4)}-${String(id).padStart(6, '0')}`,
    insurerPolicyNumber: `${companyCode}-${startDate.slice(0, 4)}-POL-${String(id).padStart(5, '0')}`,
    customerId,
    customerName,
    customerPhone,
    customerType,
    agentId,
    agentName,
    companyCode,
    companyName: companyName(companyCode),
    companyShortName: companyShort(companyCode),
    productType,
    productName,
    vehiclePlate: vehicle?.plateNumber || '',
    vehicle,
    startDate,
    endDate,
    netPremium,
    vatAmount,
    registrationFee,
    totalPremium: netPremium + vatAmount + registrationFee,
    brokerCommissionRate,
    brokerCommissionAmount: Math.round((netPremium * brokerCommissionRate) / 100),
    agentCommissionRate,
    agentCommissionAmount,
    agentNetPayout: Math.round(agentCommissionAmount * 0.95),
    points,
    status,
    createdAt,
  }
}

const car = (make, model, plateNumber, category = 'sedan', usageType = 'private') => ({
  category,
  make,
  model,
  year: 2022,
  plateNumber,
  plateProvince: 'Vientiane Capital',
  engineNumber: `ENG-${plateNumber.replace(/\s/g, '')}`,
  chassisNumber: `CHS-${plateNumber.replace(/\s/g, '')}`,
  engineCapacity: '2000',
  color: 'ຂາວ',
  usageType,
})

export const policies = [
  makePolicy({
    id: 1,
    customerId: 1,
    customerName: 'ສົມສັກ ບຸນທະວີ',
    customerPhone: '020 5555 1234',
    agentId: 1,
    agentName: 'ຄຳພູ ວົງວິຫານ',
    companyCode: 'DHP',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (DHP Premium Gold)',
    vehicle: car('Toyota', 'Camry', 'ກກ 1234'),
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    netPremium: 1400000,
    status: 'active',
    createdAt: '2026-01-10',
  }),
  makePolicy({
    id: 2,
    customerId: 2,
    customerName: 'ນິດຊາ ສີສຸວັນ',
    customerPhone: '020 7777 8888',
    agentId: 2,
    agentName: 'ມະລິ ເພັດສະຫວັນ',
    companyCode: 'APA',
    productType: 'Health',
    productName: 'ສຸຂະພາບ ຄອມຟອດ (APA Health Comfort)',
    vehicle: null,
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    netPremium: 2990654,
    status: 'active',
    createdAt: '2026-01-25',
  }),
  makePolicy({
    id: 3,
    customerId: 3,
    customerName: 'ການ ພົມມະສານ',
    customerPhone: '020 2222 3333',
    agentId: 1,
    agentName: 'ຄຳພູ ວົງວິຫານ',
    companyCode: 'ALZ',
    productType: 'Fire',
    productName: 'ອັກຄີໄພ ໂຮງງານ (Allianz Property)',
    vehicle: null,
    startDate: '2026-02-10',
    endDate: '2027-02-09',
    netPremium: 4672897,
    status: 'active',
    createdAt: '2026-02-05',
  }),
  makePolicy({
    id: 4,
    customerId: 4,
    customerName: 'ຈິນດາ ທຳມະວົງ',
    customerPhone: '020 9999 0000',
    agentId: 3,
    agentName: 'ບຸນມີ ສີປະເສີດ',
    companyCode: 'DHP',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 2+ (DHP Smart)',
    vehicle: car('Honda', 'Civic', 'ກຂ 5678', 'sedan', 'commercial'),
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    netPremium: 1121495,
    status: 'expired',
    createdAt: '2025-02-20',
  }),
  makePolicy({
    id: 5,
    customerId: 5,
    customerName: 'ວິໄລ ແກ້ວມະນີ',
    customerPhone: '020 5454 6767',
    agentId: 2,
    agentName: 'ມະລິ ເພັດສະຫວັນ',
    companyCode: 'APA',
    productType: 'Accident',
    productName: 'ອຸບັດຕິເຫດ ສ່ວນຕົວ (APA PA Shield)',
    vehicle: null,
    startDate: '2026-03-05',
    endDate: '2026-11-05',
    netPremium: 467290,
    status: 'active',
    createdAt: '2026-02-28',
  }),
  makePolicy({
    id: 6,
    customerId: 6,
    customerName: 'ຄຳພູ ສີຫາວົງ',
    customerPhone: '020 8888 9999',
    agentId: 4,
    agentName: 'ແກ້ວມະນີ ວົງພະຈັນ',
    companyCode: 'SOK',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Soksay Smart)',
    vehicle: car('Toyota', 'Hilux', 'ກຄ 9012', 'pickup'),
    startDate: '2026-03-20',
    endDate: '2027-03-19',
    netPremium: 1869159,
    status: 'pending',
    createdAt: '2026-03-15',
  }),
  makePolicy({
    id: 7,
    customerId: 7,
    customerName: 'ມະລິ ຈັນທະວົງ',
    customerPhone: '020 3333 4444',
    agentId: 1,
    agentName: 'ຄຳພູ ວົງວິຫານ',
    companyCode: 'LXA',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Lane Xang Gold)',
    vehicle: car('Isuzu', 'D-Max', 'ກງ 3344', 'pickup', 'commercial'),
    startDate: '2026-04-01',
    endDate: '2026-11-12',
    netPremium: 1450000,
    status: 'active',
    createdAt: '2026-03-25',
  }),
  makePolicy({
    id: 8,
    customerId: 8,
    customerName: 'ສົມສັກ ພົມມະວົງ',
    customerPhone: '020 1212 3434',
    agentId: 2,
    agentName: 'ມະລິ ເພັດສະຫວັນ',
    companyCode: 'FTK',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Forte-Toko Plus)',
    vehicle: car('Mazda', 'CX-5', 'ກຈ 7788', 'suv'),
    startDate: '2026-04-10',
    endDate: '2026-11-20',
    netPremium: 1600000,
    status: 'active',
    createdAt: '2026-04-05',
  }),
  makePolicy({
    id: 9,
    customerId: 9,
    customerName: 'ບຸນທອງ ສີສະຫວາດ',
    customerPhone: '020 4545 1212',
    agentId: 3,
    agentName: 'ບຸນມີ ສີປະເສີດ',
    companyCode: 'ZJI',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Zongji Care)',
    vehicle: car('Hyundai', 'Tucson', 'ກຊ 4455', 'suv'),
    startDate: '2026-05-01',
    endDate: '2027-04-30',
    netPremium: 1350000,
    status: 'active',
    createdAt: '2026-04-20',
  }),
  makePolicy({
    id: 10,
    customerId: 10,
    customerName: 'ພອນສະຫວັນ ວົງສະຫວັນ',
    customerPhone: '020 6565 7878',
    agentId: 4,
    agentName: 'ແກ້ວມະນີ ວົງພະຈັນ',
    companyCode: 'NVK',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Navakij Premium)',
    vehicle: car('Ford', 'Ranger', 'ກຍ 6677', 'pickup', 'commercial'),
    startDate: '2026-05-15',
    endDate: '2027-05-14',
    netPremium: 1720000,
    status: 'active',
    createdAt: '2026-05-10',
  }),
  makePolicy({
    id: 11,
    customerId: 11,
    customerName: 'ຄຳຫຼ້າ ວົງພະຈັນ',
    customerPhone: '020 7878 9090',
    agentId: 1,
    agentName: 'ຄຳພູ ວົງວິຫານ',
    companyCode: 'LVI',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (LVI Protect)',
    vehicle: car('Kia', 'Seltos', 'ກດ 8899', 'suv'),
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    netPremium: 1280000,
    status: 'active',
    createdAt: '2026-05-25',
  }),
  makePolicy({
    id: 12,
    customerId: 12,
    customerName: 'ແສງທອງ ພົມມະຈັນ',
    customerPhone: '020 9090 1212',
    agentId: 2,
    agentName: 'ມະລິ ເພັດສະຫວັນ',
    companyCode: 'VTE',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (Vientiane Care)',
    vehicle: car('Nissan', 'Almera', 'ກດ 1122', 'sedan', 'commercial'),
    startDate: '2026-06-15',
    endDate: '2027-06-14',
    netPremium: 1150000,
    status: 'active',
    createdAt: '2026-06-10',
  }),
  makePolicy({
    id: 13,
    customerId: 13,
    customerName: 'ສຸລິຍາ ແກ້ວສະຫວັນ',
    customerPhone: '020 2323 4545',
    agentId: 3,
    agentName: 'ບຸນມີ ສີປະເສີດ',
    companyCode: 'STM',
    productType: 'Travel',
    productName: 'ປະກັນການເດີນທາງ (ST Travel)',
    vehicle: null,
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    netPremium: 320000,
    status: 'active',
    createdAt: '2026-06-25',
  }),
  makePolicy({
    id: 14,
    customerId: 14,
    customerName: 'ວັນນະສິນ ຈັນທະສິນ',
    customerPhone: '020 3434 5656',
    agentId: 4,
    agentName: 'ແກ້ວມະນີ ວົງພະຈັນ',
    companyCode: 'DHP',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (DHP Premium Gold)',
    vehicle: car('Toyota', 'Fortuner', 'ກຕ 2233', 'suv', 'commercial'),
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    netPremium: 1950000,
    status: 'active',
    createdAt: '2026-07-25',
  }),
  makePolicy({
    id: 15,
    customerId: 15,
    customerName: 'ປະເພດ ສີສຸວັນ',
    customerPhone: '020 5656 7878',
    agentId: 1,
    agentName: 'ຄຳພູ ວົງວິຫານ',
    companyCode: 'APA',
    productType: 'Motor',
    productName: 'ລົດຍົນ ຊັ້ນ 1 (APA Platinum)',
    vehicle: car('Honda', 'CR-V', 'ກທ 4455', 'suv'),
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    netPremium: 2100000,
    status: 'active',
    createdAt: '2026-08-25',
  }),
  makePolicy({
    id: 16,
    customerId: 16,
    customerName: 'ອາລີ ວົງສະຫວັນ',
    customerPhone: '020 6767 8989',
    agentId: 2,
    agentName: 'ມະລິ ເພັດສະຫວັນ',
    companyCode: 'SOK',
    productType: 'Fire',
    productName: 'ອັກຄີໄພ ເຮືອນ (Soksay Home)',
    vehicle: null,
    startDate: '2026-10-01',
    endDate: '2026-11-24',
    netPremium: 1750000,
    status: 'active',
    createdAt: '2026-09-25',
  }),
]


const pad2 = (value) => String(value).padStart(2, '0')

const addYear = (isoDate) => {
  const date = new Date(`${isoDate}T12:00:00Z`)
  date.setUTCFullYear(date.getUTCFullYear() + 1)
  return date.toISOString().slice(0, 10)
}

const minusDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

const CUSTOMER_SEED = [
  'ຄຳແພງ ສີສະຫວາດ',
  'ສຸກສະຫວັນ ວົງລັດສະໝີ',
  'ທອງສະຫວັນ ພົມມະວົງ',
  'ບຸນມີ ຈັນທະວົງ',
  'ພອນສະຫວັນ ສີປະເສີດ',
  'ແສງທອງ ວົງພະຈັນ',
  'ຄຳສີ ແກ້ວມະນີ',
  'ນາງ ສຸລິຍາ ພົມມະຈັນ',
  'ວັນນະສິນ ຈັນທະສິນ',
  'ອາລີ ວົງສະຫວັນ',
  'ປະເພດ ສີສຸວັນ',
  'ຄຳຫຼ້າ ວົງພະຈັນ',
  'ບຸນທອງ ສີສະຫວາດ',
  'ສົມພອນ ພົມມະຈັນ',
  'ທິບພະວັນ ສີຫາວົງ',
  'ມະນີວັນ ແກ້ວສະຫວັນ',
]

const GENERATED_PRODUCTS = [
  { type: 'Motor', name: 'ລົດຍົນ ຊັ້ນ 1 (Premium)' },
  { type: 'Motor', name: 'ລົດຍົນ ຊັ້ນ 2+ (Smart)' },
  { type: 'Health', name: 'ສຸຂະພາບ ຄອມຟອດ' },
  { type: 'Fire', name: 'ອັກຄີໄພ ເຮືອນ' },
  { type: 'Accident', name: 'ອຸບັດຕິເຫດ ສ່ວນຕົວ' },
  { type: 'Travel', name: 'ປະກັນການເດີນທາງ' },
]

const GENERATED_CARS = [
  ['Toyota', 'Camry', 'sedan'],
  ['Honda', 'Civic', 'sedan'],
  ['Isuzu', 'D-Max', 'pickup'],
  ['Toyota', 'Hilux', 'pickup'],
  ['Mazda', 'CX-5', 'suv'],
  ['Hyundai', 'Tucson', 'suv'],
  ['Ford', 'Ranger', 'pickup'],
  ['Kia', 'Seltos', 'suv'],
  ['Nissan', 'Almera', 'sedan'],
  ['Toyota', 'Fortuner', 'suv'],
]

const COMPANY_CODES = insurers.map((insurer) => insurer.code)
const generatedPolicies = []
let generatedId = policies.length + 1

const pushGenerated = (isoDate, sequence) => {
  const agent = agents[sequence % agents.length]
  const companyCode = COMPANY_CODES[sequence % COMPANY_CODES.length]
  const product = GENERATED_PRODUCTS[sequence % GENERATED_PRODUCTS.length]
  const customerName = CUSTOMER_SEED[sequence % CUSTOMER_SEED.length]
  const [make, model, category] = GENERATED_CARS[sequence % GENERATED_CARS.length]
  const netPremium = 420000 + ((sequence * 173000) % 2800000)
  const endDate = addYear(isoDate)
  const status = endDate < '2026-10-27' ? 'expired' : 'active'
  generatedPolicies.push(
    makePolicy({
      id: generatedId,
      customerId: 1000 + generatedId,
      customerName,
      customerPhone: `020 ${String(4000 + (sequence % 5000)).padStart(4, '0')} ${String(1000 + (sequence % 9000)).padStart(4, '0')}`,
      agentId: agent.id,
      agentName: agent.name,
      companyCode,
      productType: product.type,
      productName: product.name,
      vehicle:
        product.type === 'Motor'
          ? car(make, model, `ກກ ${1000 + generatedId}`, category, sequence % 4 === 0 ? 'commercial' : 'private')
          : null,
      startDate: isoDate,
      endDate,
      netPremium,
      status,
      createdAt: minusDays(isoDate, 3 + (sequence % 5)),
    }),
  )
  generatedId += 1
}

let seed = 0
for (let year = 2025; year <= 2026; year += 1) {
  const lastMonth = year === 2026 ? 9 : 12
  for (let month = 1; month <= lastMonth; month += 1) {
    for (const day of [4, 11, 18, 25]) {
      pushGenerated(`${year}-${pad2(month)}-${pad2(day)}`, seed)
      seed += 1
    }
  }
}

for (let day = 1; day <= 27; day += 1) {
  pushGenerated(`2026-10-${pad2(day)}`, seed)
  seed += 1
  if (day % 2 === 1) {
    pushGenerated(`2026-10-${pad2(day)}`, seed)
    seed += 1
  }
}

policies.push(...generatedPolicies)

export const insurerPolicySummary = insurers.map((insurer) => {
  const rows = policies.filter((policy) => policy.companyCode === insurer.code)
  return {
    ...insurer,
    policyCount: rows.length,
    premium: rows.reduce((sum, policy) => sum + policy.totalPremium, 0),
  }
})
