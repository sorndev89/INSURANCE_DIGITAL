import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  toAvatar: vi.fn(),
}))

vi.mock('~/composables/api/useUsers', () => ({
  useUsers: () => ({ create: mocks.create, update: mocks.update }),
}))

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({ success: mocks.success, error: mocks.error }),
}))

vi.mock('~/utils/image', () => ({
  AVATAR_MAX_INPUT_BYTES: 5 * 1024 * 1024,
  fileToAvatarDataUrl: mocks.toAvatar,
}))

const { default: UserFormModal } = await import('~/components/feature/user/UserFormModal.vue')

const BaseModalStub = {
  props: ['modelValue', 'title'],
  template: '<div><h2>{{ title }}</h2><slot /><slot name="footer" /></div>',
}

const mountModal = (props = {}) =>
  mountSuspended(UserFormModal, {
    props: { modelValue: true, user: null, currentUserId: 1, ...props },
    global: { stubs: { BaseModal: BaseModalStub } },
  })

const textInputs = (wrapper) =>
  wrapper.findAll('input').filter((input) => input.attributes('type') !== 'file')

const findSaveButton = (wrapper) =>
  wrapper.findAll('button').find((button) => button.text().includes('ສ້າງຜູ້ໃຊ້'))

const findSubmitButton = (wrapper) =>
  wrapper.findAll('button').find((button) => button.text().includes('ບັນທຶກ'))

const fillNewUser = async (wrapper) => {
  const inputs = textInputs(wrapper)
  await inputs[0].setValue('ສົມສັກ ມະນີວົງ')
  await inputs[1].setValue('somchak')
  await inputs[2].setValue('somchak@example.com')
  await inputs[3].setValue('020 5555 1234')
  await inputs[4].setValue('Secret@123')
  await inputs[5].setValue('Secret@123')
}

describe('UserFormModal', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset())
  })

  it('validates required fields before calling the API', async () => {
    const wrapper = await mountModal()
    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('ກະລຸນາປ້ອນຂໍ້ມູນ')
  })

  it('blocks submit when passwords do not match', async () => {
    const wrapper = await mountModal()
    await fillNewUser(wrapper)
    await textInputs(wrapper)[5].setValue('Other@123')

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('ລະຫັດຜ່ານບໍ່ກົງກັນ')
  })

  it('creates a user with every form field', async () => {
    mocks.create.mockResolvedValue({ id: 9, username: 'somchak' })
    const wrapper = await mountModal()
    await fillNewUser(wrapper)

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(mocks.create).toHaveBeenCalledWith({
      name: 'ສົມສັກ ມະນີວົງ',
      username: 'somchak',
      email: 'somchak@example.com',
      phone: '020 5555 1234',
      role: 'staff',
      status: 'active',
      avatar: null,
      password: 'Secret@123',
    })
    expect(mocks.success).toHaveBeenCalledWith('ສ້າງຜູ້ໃຊ້ແລ້ວ')
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('stores the selected avatar as a data url with the payload', async () => {
    mocks.toAvatar.mockResolvedValue('data:image/jpeg;base64,avatar')
    mocks.create.mockResolvedValue({ id: 10 })

    const wrapper = await mountModal()
    await fillNewUser(wrapper)

    const fileInput = wrapper.find('input[type="file"]')
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(fileInput.element, 'files', { value: [file] })
    await fileInput.trigger('change')
    await flushPromises()

    expect(mocks.toAvatar).toHaveBeenCalledWith(file)

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ avatar: 'data:image/jpeg;base64,avatar' }),
    )
  })

  it('prefills an existing user and updates it without resetting the password', async () => {
    mocks.update.mockResolvedValue({ id: 5, username: 'nid' })
    const wrapper = await mountModal({
      user: {
        id: 5,
        name: 'ນິດຊາ ວົງສາ',
        username: 'nid',
        email: 'nid@example.com',
        phone: '020 7777 8888',
        role: 'agent',
        status: 'active',
        avatar: '',
      },
    })

    const inputs = textInputs(wrapper)
    expect(inputs[0].element.value).toBe('ນິດຊາ ວົງສາ')
    expect(inputs[1].element.value).toBe('nid')

    await findSubmitButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.update).toHaveBeenCalledWith(5, {
      name: 'ນິດຊາ ວົງສາ',
      username: 'nid',
      email: 'nid@example.com',
      phone: '020 7777 8888',
      role: 'agent',
      status: 'active',
      avatar: null,
    })
    expect(mocks.success).toHaveBeenCalledWith('ອັບເດດຜູ້ໃຊ້ແລ້ວ')
  })

  it('disables role and status changes for the signed-in user', async () => {
    const wrapper = await mountModal({
      currentUserId: 5,
      user: {
        id: 5,
        name: 'ນິດຊາ ວົງສາ',
        username: 'nid',
        email: 'nid@example.com',
        role: 'admin',
        status: 'active',
      },
    })

    const selects = wrapper.findAll('select')
    expect(selects[0].attributes('disabled')).toBeDefined()
    expect(selects[1].attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('ບໍ່ສາມາດປ່ຽນບົດບາດຂອງຕົນເອງໄດ້')
  })

  it('does not close the modal when the API fails', async () => {
    mocks.create.mockRejectedValue(new Error('server down'))
    const wrapper = await mountModal()
    await fillNewUser(wrapper)

    await findSaveButton(wrapper).trigger('click')
    await flushPromises()

    expect(mocks.error).toHaveBeenCalledWith('server down')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
