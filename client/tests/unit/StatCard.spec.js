import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatCard from '~/components/ui/StatCard.vue'

describe('StatCard', () => {
  it('renders one icon per breakpoint without duplicate icon roots', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { label: 'ຍອດຂາຍ', value: '₭ 1,518,000', icon: 'payments' },
    })

    const icons = wrapper.findAll('.material-icons')
    expect(icons).toHaveLength(2)

    const wrappers = icons.map((icon) => icon.element.parentElement)
    expect(wrappers[0].className).toContain('sm:hidden')
    expect(wrappers[1].className).toContain('hidden')
    expect(wrappers[1].className).toContain('sm:inline-flex')

    // The display utilities must live on plain wrappers: the material-icons
    // class sets display itself and would render both icons otherwise.
    for (const icon of icons) {
      expect(icon.classes()).not.toContain('hidden')
      expect(icon.classes()).not.toContain('sm:hidden')
    }
  })

  it('does not render the icon container when icon is empty', async () => {
    const wrapper = await mountSuspended(StatCard, {
      props: { label: 'ບໍ່ມີໄອຄອນ', value: 0 },
    })
    expect(wrapper.findAll('.material-icons')).toHaveLength(0)
  })
})
