export const DEMO_PASSWORD = 'Demo@1234'

export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    name: 'ສົມສັກ ມະນີວົງ',
    email: 'admin@saiyfon.com',
    password: DEMO_PASSWORD,
    role: 'admin',
    phone: '020 5555 1234',
    status: 'active',
    avatar: '',
  },
  {
    id: 2,
    username: 'staff',
    name: 'ນິດຊາ ວົງສາ',
    email: 'staff@saiyfon.com',
    password: DEMO_PASSWORD,
    role: 'staff',
    phone: '020 7777 8888',
    status: 'active',
    avatar: '',
  },
  {
    id: 3,
    username: 'agent',
    name: 'ຄຳພູ ວົງວິຫານ',
    email: 'agent@saiyfon.com',
    password: DEMO_PASSWORD,
    role: 'agent',
    phone: '020 2222 3333',
    status: 'active',
    avatar: '',
  },
  {
    id: 4,
    username: 'customer',
    name: 'ຈິນດາ ທຳມະວົງ',
    email: 'customer@saiyfon.com',
    password: DEMO_PASSWORD,
    role: 'customer',
    phone: '020 9999 0000',
    status: 'active',
    avatar: '',
  },
  {
    id: 5,
    username: 'agent2',
    name: 'ມະລິ ເພັດສະຫວັນ',
    email: 'mali@saiyfon.com',
    password: DEMO_PASSWORD,
    role: 'agent',
    phone: '020 5454 6767',
    status: 'active',
    avatar: '',
  },
]

export const findMockUser = (email) =>
  mockUsers.find(
    (user) =>
      user.email.toLowerCase() ===
      String(email || '')
        .trim()
        .toLowerCase(),
  )

export const toPublicUser = (user) => {
  if (!user) return null
  const publicUser = { ...user }
  delete publicUser.password
  return publicUser
}

export const DEMO_ACCOUNTS = [
  { label: 'ຜູ້ດູແລລະບົບ', email: 'admin@saiyfon.com' },
  { label: 'ພະນັກງານ', email: 'staff@saiyfon.com' },
  { label: 'ຕົວແທນ', email: 'agent@saiyfon.com' },
  { label: 'ລູກຄ້າ', email: 'customer@saiyfon.com' },
]
