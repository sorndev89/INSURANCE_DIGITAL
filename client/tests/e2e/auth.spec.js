import { expect, test } from 'playwright/test'

const login = async (page, email = 'admin@saiyfon.com', password = 'Demo@1234') => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

test('guards private routes and logs in as admin', async ({ page }, testInfo) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)dashboard/)
  await login(page)
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { level: 1, name: 'ພາບລວມລະບົບ' })).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/\/dashboard/)

  if (testInfo.project.name === 'desktop') {
    await page.getByRole('button', { name: /ເມນູຜູ້ໃຊ້/ }).click()
    await page.getByRole('menuitem', { name: /ອອກຈາກລະບົບ/ }).click()
  } else {
    await page.goto('/profile')
    await page.getByRole('button', { name: 'ອອກຈາກລະບົບ' }).click()
  }
  await expect(page).toHaveURL(/\/login/)
})

test('shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@saiyfon.com')
  await page.locator('input[type="password"]').fill('wrong-password')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'ບໍ່ຖືກຕ້ອງ' })).toBeVisible()
})
