import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
}))

vi.mock('~/composables/useFileUpload', () => ({
  useFileUpload: () => ({
    upload: mocks.upload,
    uploading: { value: false },
    error: { value: '' },
  }),
}))

const { default: FileUpload } = await import('~/components/ui/FileUpload.vue')

beforeAll(() => {
  if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:preview'
  if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {}
})

const selectFile = async (wrapper, file) => {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: [file],
  })
  await input.trigger('change')
  await flushPromises()
}

describe('FileUpload', () => {
  beforeEach(() => {
    mocks.upload.mockReset()
    mocks.upload.mockResolvedValue({
      url: '/uploads/1/id-card.pdf',
      name: 'id-card.pdf',
      mimeType: 'application/pdf',
      size: 3,
    })
  })

  it('uploads the selected file automatically and emits the storage key', async () => {
    const wrapper = await mountSuspended(FileUpload, {
      props: { modelValue: null, label: 'ເອກະສານ', autoUpload: true },
    })

    const file = new File(['abc'], 'id-card.pdf', { type: 'application/pdf' })
    await selectFile(wrapper, file)

    expect(mocks.upload).toHaveBeenCalledWith(file)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([file])
    expect(wrapper.emitted('uploaded')?.[1]).toEqual([
      {
        url: '/uploads/1/id-card.pdf',
        name: 'id-card.pdf',
        mimeType: 'application/pdf',
        size: 3,
      },
    ])
  })

  it('rejects oversized files before uploading', async () => {
    const wrapper = await mountSuspended(FileUpload, {
      props: { modelValue: null, label: 'ເອກະສານ', autoUpload: true, maxSizeMB: 5 },
    })

    const file = new File(['x'], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
    await selectFile(wrapper, file)

    expect(mocks.upload).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('ໄຟລ໌ໃຫຍ່ເກີນ 5 MB')
  })

  it('rejects unsupported file types', async () => {
    const wrapper = await mountSuspended(FileUpload, {
      props: { modelValue: null, label: 'ເອກະສານ', autoUpload: true },
    })

    const file = new File(['x'], 'script.exe', { type: 'application/x-msdownload' })
    await selectFile(wrapper, file)

    expect(mocks.upload).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('ປະເພດໄຟລ໌ບໍ່ຖືກຕ້ອງ')
  })

  it('shows the upload failure instead of emitting a result', async () => {
    mocks.upload.mockRejectedValue(new Error('network down'))
    const wrapper = await mountSuspended(FileUpload, {
      props: { modelValue: null, label: 'ເອກະສານ', autoUpload: true },
    })

    const file = new File(['abc'], 'id-card.pdf', { type: 'application/pdf' })
    await selectFile(wrapper, file)

    expect(wrapper.emitted('uploaded')?.at(-1)).toEqual([null])
    expect(wrapper.text()).toContain('network down')
  })
})
