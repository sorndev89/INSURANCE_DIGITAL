import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import BaseDropdown from '~/components/base/BaseDropdown.vue'

describe('BaseDropdown', () => {
  it('opens the menu and closes on Escape', async () => {
    const wrapper = await mountSuspended(BaseDropdown, {
      attachTo: document.body,
      slots: {
        trigger: '<span>Open</span>',
        menu: '<button type="button" role="menuitem">Item</button>',
      },
    })

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
