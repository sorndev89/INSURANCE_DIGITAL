import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('~/composables/api/useCustomers', () => ({
  useCustomers: () => ({ create: mocks.create, update: mocks.update }),
}))

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error }),
}))

const { default: CustomerFormModal } =
  await import('~/components/feature/customer/CustomerFormModal.vue')

const BaseModalStub = {
  props: ['modelValue', 'title'],
  template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>',
}

const mountModal = (props = {}) =>
  mountSuspended(CustomerFormModal, {
    props: { modelValue: true, customer: null, ...props },
    global: { stubs: { BaseModal: BaseModalStub } },
  })

const findSaveButton = (wrapper) =>
  wrapper.findAll('button').find((button) => button.text().includes('ບັນທຶກ'))

describe('CustomerFormModal', () => {
  beforeEach(() => {
    mocks.create.mockReset()
    mocks.update.mockReset()
    mocks.success.mockReset()
    mocks.error.mockReset()
  })

  it('validates required fields before calling the API', async () => {
    const wrapper = await mountModal()
    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('ກະລຸນາປ້ອນຂໍ້ມູນ')
  })

  it('creates a new customer with every form field', async () => {
    mocks.create.mockResolvedValue({ id: 99, firstName: 'ສົມ', lastName: 'ສັກ' })
    const wrapper = await mountModal()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('ສົມ')
    await inputs[1].setValue('ສັກ')
    await inputs[2].setValue('020 5555 1234')
    await inputs[3].setValue('som@example.com')
    await wrapper.find('textarea').setValue('ບ້ານ ວຽງຈັນ')

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(mocks.create).toHaveBeenCalledWith({
      customerType: 'individual',
      firstName: 'ສົມ',
      lastName: 'ສັກ',
      fullName: 'ສົມ ສັກ',
      companyName: '',
      taxId: '',
      contactPerson: '',
      idCardNumber: '',
      phone: '020 5555 1234',
      email: 'som@example.com',
      gender: 'male',
      dob: '',
      occupation: '',
      address: 'ບ້ານ ວຽງຈັນ',
      status: 'active',
    })
    expect(mocks.success).toHaveBeenCalledWith('ເພີ່ມລູກຄ້າໃໝ່ສຳເລັດ')
    expect(wrapper.emitted('saved')?.[0]).toEqual([{ id: 99, firstName: 'ສົມ', lastName: 'ສັກ' }])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('prefills an existing customer and updates it instead of creating', async () => {
    mocks.update.mockResolvedValue({ id: 5, firstName: 'ນິດຊາ', lastName: 'ວົງສາ' })
    const wrapper = await mountModal({
      customer: {
        id: 5,
        firstName: 'ນິດຊາ',
        lastName: 'ວົງສາ',
        phone: '020 7777 8888',
        email: 'nid@example.com',
        gender: 'female',
        dob: '1990-01-01',
        occupation: 'ພະນັກງານ',
        address: 'ວຽງຈັນ',
        status: 'active',
      },
    })

    expect(wrapper.text()).toContain('ແກ້ໄຂຂໍ້ມູນລູກຄ້າ')
    const inputs = wrapper.findAll('input')
    expect(inputs[0].element.value).toBe('ນິດຊາ')
    expect(inputs[1].element.value).toBe('ວົງສາ')

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.update).toHaveBeenCalledWith(5, {
      customerType: 'individual',
      firstName: 'ນິດຊາ',
      lastName: 'ວົງສາ',
      fullName: 'ນິດຊາ ວົງສາ',
      companyName: '',
      taxId: '',
      contactPerson: '',
      idCardNumber: '',
      phone: '020 7777 8888',
      email: 'nid@example.com',
      gender: 'female',
      dob: '1990-01-01',
      occupation: 'ພະນັກງານ',
      address: 'ວຽງຈັນ',
      status: 'active',
    })
    expect(mocks.success).toHaveBeenCalledWith('ແກ້ໄຂຂໍ້ມູນລູກຄ້າສຳເລັດ')
  })

  it('does not close the modal when the API fails', async () => {
    mocks.create.mockRejectedValue(new Error('server down'))
    const wrapper = await mountModal()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('ສົມ')
    await inputs[1].setValue('ສັກ')
    await inputs[2].setValue('020 5555 1234')

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.error).toHaveBeenCalledWith('server down')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
