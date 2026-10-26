import { expect, test } from 'playwright/test'

test('uses the mobile shell and card lists on phones', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only')
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('agent@saiyfon.com')
  await page.locator('input[type="password"]').fill('Demo@1234')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).toHaveURL(/\/home/)

  await expect(page.getByRole('navigation', { name: 'ເມນູລຸ່ມ' })).toBeVisible()
  await page.goto('/policies')
  await expect(page.locator('table')).toHaveCount(0)
  await expect(page.locator('article[role="listitem"]').first()).toBeVisible()

  await page.getByRole('button', { name: 'ເພີ່ມເຕີມ' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
