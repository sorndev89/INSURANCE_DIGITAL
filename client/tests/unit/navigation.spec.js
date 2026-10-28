import { describe, expect, it } from 'vitest'
import { bottomTabsByRole, navigationGroups } from '~/config/navigation'

const menuItems = navigationGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupTitle: group.title })),
)

describe('navigation groups', () => {
  it('keeps every menu path unique', () => {
    const paths = menuItems.map((item) => item.to)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('does not nest one menu path under another menu path', () => {
    menuItems.forEach((parent) => {
      menuItems.forEach((child) => {
        if (parent.to === child.to) return
        expect(child.to.startsWith(`${parent.to}/`), `${child.to} nests under ${parent.to}`).toBe(
          false,
        )
      })
    })
  })

  it('keeps all reports inside one group with visible sections', () => {
    const reportGroup = navigationGroups.find((group) => group.title === 'ລາຍງານ')
    expect(reportGroup).toBeTruthy()
    expect(reportGroup.items).toHaveLength(12)

    const sections = [...new Set(reportGroup.items.map((item) => item.section))]
    expect(sections).toEqual(['ລາຍງານຍອດຂາຍ', 'ລາຍງານ UNDERWRITING'])
    reportGroup.items.forEach((item) => {
      expect(item.section).toBeTruthy()
      expect(item.to.startsWith('/reports/')).toBe(true)
    })
  })

  it('keeps bottom tab targets free of report tabs', () => {
    Object.values(bottomTabsByRole)
      .flat()
      .filter((tab) => tab.to)
      .forEach((tab) => {
        expect(tab.to.startsWith('/reports/')).toBe(false)
      })
  })
})
