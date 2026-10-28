import { expect, test } from 'playwright/test'
import AxeBuilder from '@axe-core/playwright'

const blockingViolations = (results) =>
  results.violations
    .filter((item) => ['serious', 'critical'].includes(item.impact))
    .map((item) => ({
      ...item,
      nodes: item.nodes.filter((node) => !node.target.join(' ').includes('nuxt-devtools')),
    }))
    .filter((item) => item.nodes.length > 0)

const login = async (page) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@saiyfon.com')
  await page.locator('input[type="password"]').fill('Demo@1234')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test('has no serious or critical accessibility violations', async ({ page }) => {
  test.setTimeout(120_000)
  await login(page)
  const routes = [
    '/dashboard',
    '/policies',
    '/insurers',
    '/insurer-commissions',
    '/my-policies',
    '/vehicles',
    '/marketing-banners',
    '/home',
    '/reports/sales/daily',
    '/reports/sales/daily-by-user',
    '/reports/sales/monthly',
    '/reports/sales/monthly-by-user',
    '/reports/sales/quarterly',
    '/reports/sales/quarterly-by-user',
    '/reports/sales/annual',
    '/reports/sales/annual-by-user',
    '/reports/underwriting/date-range',
    '/reports/underwriting/company',
    '/reports/underwriting/expiration',
    '/reports/underwriting/expiration-by-agent',
    '/profile',
  ]
  for (const route of routes) {
    await page.goto(route)
    await page.waitForTimeout(500)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('nuxt-devtools')
      .analyze()
    const blocking = blockingViolations(results)
    expect(blocking, `${route}: ${blocking.map((item) => item.id).join(', ')}`).toEqual([])
  }
})
