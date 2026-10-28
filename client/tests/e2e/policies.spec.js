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

test('lists, searches, and opens a policy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop flow')
  await login(page)
  await page.goto('/policies')
  await expect(page.getByRole('heading', { level: 1, name: 'ຈັດການປະກັນໄພ' })).toBeVisible()
  await expect(page.locator('tbody tr').first()).toBeVisible()

  await page.getByLabel('ຄົ້ນຫາປະກັນໄພ').fill('ສົມສັກ')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.waitForTimeout(500)
  await page.locator('tbody a').first().click()
  await expect(page).toHaveURL(/\/policies\/\d+/)
  await expect(page.getByText('ລາຍລະອຽດຄວາມຄຸ້ມຄອງ')).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('nuxt-devtools')
    .analyze()
  expect(blockingViolations(results)).toEqual([])
})

test('creates a policy through the wizard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop flow')
  await login(page)
  await page.goto('/policies/create')
  await page.getByLabel('ຊື່ແທ້').fill('ທ່ານ ທົດສອບ')
  await page.getByLabel('ນາມສະກຸນ').fill('ລະບົບ')
  await page.getByLabel('ເບີໂທລະສັບ').fill('020 5555 9999')
  await page.getByLabel('ທີ່ຢູ່ປະຈຸບັນ').fill('ບ້ານ ທົດສອບ, ວຽງຈັນ')
  await page.getByRole('button', { name: 'ຕໍ່ໄປ' }).click()
  await page.getByRole('button', { name: 'ລົດເກັງ' }).click()
  await page.getByRole('button', { name: 'ຢືນຢັນການນຳໃຊ້' }).click()
  await page.getByLabel('ຍີ່ຫໍ້ລົດ').fill('Honda')
  await page.getByLabel('ຮຸ່ນລົດ').fill('Civic')
  await page.getByLabel('ທະບຽນລົດ').fill('ກກ 9999')
  await page.getByLabel('ຄວາມຈຸກະບອກສູບ (cc)').fill('1800')
  await page.getByRole('button', { name: 'ຕໍ່ໄປ' }).click()
  await page.getByRole('button', { name: /ລົດຍົນ ຊັ້ນ 1/ }).first().click()
  await page.getByRole('button', { name: 'ຕໍ່ໄປ' }).click()
  await page.getByRole('button', { name: 'ຕໍ່ໄປ' }).click()
  await page.getByRole('button', { name: 'ກົດຊຳລະຄ່າປະກັນໄພ' }).click()
  await expect(page.getByRole('heading', { name: 'ອອກປະກັນໄພສຳເລັດ' })).toBeVisible()
  await expect(page.getByText(/P-\d{4}-\d{6}/).first()).toBeVisible()
})
