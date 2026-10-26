import { describe, expect, it } from 'vitest'
import {
  addYearsIso,
  buildPolicyPayload,
  buildVehiclePayload,
  customerNameParts,
  resolveAgentId,
} from '~/utils/policy'

const form = {
  customerId: null,
  quotationId: 7,
  agentId: '',
  discountPercent: 10,
  premium: {
    netPremium: 2250000,
    vatAmount: 157500,
    registrationFee: 20000,
    totalPremium: 2427500,
  },
  customer: {
    firstName: 'ສົມສັກ',
    lastName: 'ບຸນທະວີ',
    phone: '020 5555 1234',
    idCardUrl: 'https://files.example.com/id-card.jpg',
  },
  vehicle: {
    plateNumber: ' ກກ 1234 ',
    make: 'Toyota',
    model: 'Camry',
    year: '2024',
    engineNumber: 'ENG-1',
    chassisNumber: 'CHS-1',
    engineCapacity: '2000',
    color: 'White',
    usageType: 'private',
  },
}

const product = {
  id: 11,
  companyCode: 'DHP',
  type: 'Motor',
  name: 'ລົດຍົນ ຊັ້ນ 1',
}
const company = { name: 'ບໍລິສັດ ດີ ເອັຊ ພີ ປະກັນໄພ' }

describe('buildVehiclePayload', () => {
  it('keeps every vehicle field the backend stores', () => {
    expect(buildVehiclePayload(form.vehicle)).toEqual({
      plateNumber: 'ກກ 1234',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      engineNumber: 'ENG-1',
      chassisNumber: 'CHS-1',
      engineCapacity: '2000',
      color: 'White',
      usageType: 'private',
    })
  })

  it('normalizes blank values and defaults usage to private', () => {
    expect(buildVehiclePayload({ year: 'abc', make: '   ' })).toEqual({
      plateNumber: null,
      make: null,
      model: null,
      year: null,
      engineNumber: null,
      chassisNumber: null,
      engineCapacity: null,
      color: null,
      usageType: 'private',
    })
  })
})

describe('resolveAgentId', () => {
  it('uses the logged-in agent user id, ignoring the form field', () => {
    expect(
      resolveAgentId({
        auth: { role: 'agent', user: { id: 33 } },
        selectedAgentId: '9',
      }),
    ).toBe(33)
  })

  it('uses the selected agent for admins and rejects invalid ids', () => {
    expect(resolveAgentId({ auth: { role: 'admin' }, selectedAgentId: '9' })).toBe(9)
    expect(resolveAgentId({ auth: { role: 'admin' }, selectedAgentId: '' })).toBeNull()
    expect(resolveAgentId({ auth: { role: 'admin' }, selectedAgentId: '0' })).toBeNull()
  })
})

describe('buildPolicyPayload', () => {
  it('sends the full vehicle object and real agent/customer data', () => {
    const payload = buildPolicyPayload({
      form,
      auth: { role: 'agent', user: { id: 3 }, displayName: 'ຄຳພູ' },
      product,
      company,
      startDate: '2026-10-26',
    })

    expect(payload.customerId).toBeNull()
    expect(payload.customerName).toBe('ສົມສັກ ບຸນທະວີ')
    expect(payload.customerPhone).toBe('020 5555 1234')
    expect(payload.customerIdCardUrl).toContain('id-card.jpg')
    expect(payload.agentId).toBe(3)
    expect(payload.vehicle).toEqual({
      plateNumber: 'ກກ 1234',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      engineNumber: 'ENG-1',
      chassisNumber: 'CHS-1',
      engineCapacity: '2000',
      color: 'White',
      usageType: 'private',
    })
    expect(payload.vehiclePlate).toBe('ກກ 1234')
    expect(payload.productType).toBe('Motor')
    expect(payload.productId).toBe(11)
    expect(payload.quotationId).toBe(7)
    expect(payload.startDate).toBe('2026-10-26')
    expect(payload.endDate).toBe('2027-10-26')
    expect(payload.totalPremium).toBe(2427500)
  })

  it('links an existing customer instead of creating a duplicate', () => {
    const payload = buildPolicyPayload({
      form: { ...form, customerId: '42', agentId: '8' },
      auth: { role: 'staff', displayName: 'ນິດຊາ' },
      product,
      company,
      startDate: '2026-01-01',
    })

    expect(payload.customerId).toBe(42)
    expect(payload.agentId).toBe(8)
    expect(payload.agentName).toBe('ນິດຊາ')
  })

  it('tolerates missing form data without throwing', () => {
    const payload = buildPolicyPayload({})
    expect(payload.customerId).toBeNull()
    expect(payload.customerName).toBe('')
    expect(payload.agentId).toBeNull()
    expect(payload.vehicle.plateNumber).toBeNull()
    expect(payload.status).toBe('pending')
  })
})

describe('customerNameParts', () => {
  it('splits Lao names into first and last name', () => {
    expect(customerNameParts('ສົມສັກ ບຸນທະວີ')).toEqual({
      firstName: 'ສົມສັກ',
      lastName: 'ບຸນທະວີ',
    })
    expect(customerNameParts('  ສົມສັກ   ບຸນ  ທະວີ ')).toEqual({
      firstName: 'ສົມສັກ',
      lastName: 'ບຸນ ທະວີ',
    })
    expect(customerNameParts('ສົມສັກ')).toEqual({ firstName: 'ສົມສັກ', lastName: '' })
    expect(customerNameParts('')).toEqual({ firstName: '', lastName: '' })
  })
})

describe('addYearsIso', () => {
  it('adds calendar years and keeps the ISO format', () => {
    expect(addYearsIso('2026-10-26', 1)).toBe('2027-10-26')
    expect(addYearsIso('2026-01-01', 2)).toBe('2028-01-01')
  })

  it('returns the original value for invalid dates', () => {
    expect(addYearsIso('not-a-date', 1)).toBe('not-a-date')
  })
})
