import { expect, test } from 'playwright/test'

test('uses the mobile shell and card lists on phones', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only')
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('agent@saiyfon.com')
  await page.locator('input[type="password"]').fill('Demo@1234')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).toHaveURL(/\/home/)

  await expect(page.getByRole('navigation', { name: 'ເມນູລຸ່ມ' })).toBeVisible()
  await page.goto('/my-policies')
  await expect(page.locator('table')).toHaveCount(0)
  await expect(page.locator('article[role="listitem"]').first()).toBeVisible()

  await page.getByRole('button', { name: 'ເພີ່ມເຕີມ' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('desktop sidebar keeps its footer anchored while scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only')

  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@saiyfon.com')
  await page.locator('input[type="password"]').fill('Demo@1234')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  const nav = page.locator('aside[aria-label="ເມນູຫຼັກ"] nav')
  await expect(nav).toBeVisible()

  const metrics = await nav.evaluate((element) => {
    element.scrollTop = element.scrollHeight
    const footer = element.nextElementSibling
    const aside = element.closest('aside')
    const style = getComputedStyle(element)
    return {
      scrollTop: element.scrollTop,
      maxScroll: element.scrollHeight - element.clientHeight,
      navBottom: element.getBoundingClientRect().bottom,
      footerTop: footer.getBoundingClientRect().top,
      asideBottom: aside.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
      overscroll: style.overscrollBehaviorY,
      minHeight: style.minHeight,
    }
  })

  expect(metrics.scrollTop).toBe(metrics.maxScroll)
  expect(metrics.navBottom).toBeCloseTo(metrics.footerTop, 0)
  expect(metrics.asideBottom).toBeCloseTo(metrics.viewportHeight, 0)
  expect(metrics.overscroll).toBe('contain')
  expect(metrics.minHeight).toBe('0px')
})
