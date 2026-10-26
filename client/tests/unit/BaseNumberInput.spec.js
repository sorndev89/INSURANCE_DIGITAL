import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import BaseNumberInput from '~/components/base/BaseNumberInput.vue'

const getInput = (wrapper) => wrapper.find('input')
const lastEmitted = (wrapper) => {
  const events = wrapper.emitted('update:modelValue') || []
  return events.at(-1)?.[0]
}

describe('BaseNumberInput', () => {
  it('groups digits while typing and emits a number', async () => {
    const wrapper = await mountSuspended(BaseNumberInput, {
      props: { modelValue: '', label: 'ຈຳນວນເງິນ' },
    })
    const input = getInput(wrapper)

    await input.setValue('1234567')

    expect(input.element.value).toBe('1,234,567')
    expect(lastEmitted(wrapper)).toBe(1234567)
  })

  it('strips non numeric characters and empty values', async () => {
    const wrapper = await mountSuspended(BaseNumberInput, {
      props: { modelValue: '' },
    })
    const input = getInput(wrapper)

    await input.setValue('12a34')
    expect(input.element.value).toBe('1,234')
    expect(lastEmitted(wrapper)).toBe(1234)

    await input.setValue('')
    expect(input.element.value).toBe('')
    expect(lastEmitted(wrapper)).toBe('')
  })

  it('formats values set from outside the component', async () => {
    const wrapper = await mountSuspended(BaseNumberInput, {
      props: { modelValue: 0 },
    })

    await wrapper.setProps({ modelValue: 2500000 })
    expect(getInput(wrapper).element.value).toBe('2,500,000')
  })

  it('keeps decimal input when enabled', async () => {
    const wrapper = await mountSuspended(BaseNumberInput, {
      props: { modelValue: '', allowDecimal: true, suffix: '%' },
    })
    const input = getInput(wrapper)

    await input.setValue('12.5')

    expect(input.element.value).toBe('12.5')
    expect(lastEmitted(wrapper)).toBe(12.5)
  })
})
