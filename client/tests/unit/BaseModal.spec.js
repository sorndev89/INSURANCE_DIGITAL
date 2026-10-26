import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import BaseModal from '~/components/base/BaseModal.vue'

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

describe('BaseModal', () => {
  it('opens, closes, and emits model updates', async () => {
    const wrapper = await mountSuspended(BaseModal, {
      props: { modelValue: true, title: 'ທົດສອບ Modal' },
      slots: { default: '<p>ເນື້ອຫາ</p>' },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog.textContent).toContain('ທົດສອບ Modal')

    dialog.querySelector('[aria-label="ປິດ"]').click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})
