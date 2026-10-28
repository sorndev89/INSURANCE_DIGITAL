import { expect, test } from 'playwright/test'

const login = async (page, email = 'admin@saiyfon.com') => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill('Demo@1234')
  await page.getByRole('button', { name: 'ເຂົ້າສູ່ລະບົບ' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

test('broker hub pages render without runtime errors', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')

  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))

  await login(page)

  const routes = [
    '/dashboard',
    '/policies',
    '/my-policies',
    '/policies/create',
    '/customers',
    '/vehicles',
    '/agents',
    '/agents/1',
    '/insurers',
    '/insurers/1',
    '/insurer-commissions',
    '/commissions',
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
    '/marketing-banners',
    '/home',
    '/profile',
  ]

  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main')).toBeVisible()
    await page.waitForTimeout(150)
  }

  expect(errors).toEqual([])
})

test('sidebar lists every sales and underwriting report separately', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)
  const nav = page.locator('aside[aria-label="ເມນູຫຼັກ"]')
  await expect(nav.getByText('ລາຍງານ', { exact: true })).toBeVisible()
  await expect(nav.getByText('ລາຍງານຍອດຂາຍ', { exact: true })).toBeVisible()
  await expect(nav.getByText('ລາຍງານ UNDERWRITING', { exact: true })).toBeVisible()
  for (const label of [
    'ຍອດຂາຍລາຍມື້',
    'ຍອດຂາຍລາຍມື້ ແຍກຢູ່ເຊີ',
    'ຍອດຂາຍລາຍເດືອນ',
    'ຍອດຂາຍລາຍເດືອນ ແຍກຢູ່ເຊີ',
    'ຍອດຂາຍໄຕມາດ',
    'ຍອດຂາຍໄຕມາດ ແຍກຢູ່ເຊີ',
    'ຍອດຂາຍລາຍປີ',
    'ຍອດຂາຍລາຍປີ ແຍກຢູ່ເຊີ',
    'ຕາມຊ່ວງວັນທີ',
    'ຕາມບໍລິສັດ & ວັນທີ',
    'ສັນຍາໃກ້ໝົດອາຍຸ',
    'ໝົດອາຍຸ ແຍກຕາມຕົວແທນ',
  ]) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible()
  }
})

test('public registration page is reachable and renders the 5% offer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await page.goto('/agents/register')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ສະໝັກ')
  await expect(page.getByText('ຄອມມິດຊັ່ນ 5%', { exact: true })).toBeVisible()
})

test('each sales report is its own page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)
  await page.evaluate(() => {
    for (let id = 1; id <= 5; id += 1) sessionStorage.setItem(`saiyfon-banner-seen-${id}`, '1')
  })

  const pages = [
    ['/reports/sales/daily', 'ລາຍງານຍອດຂາຍລາຍມື້', 'ຕາຕະລາງຍອດຂາຍລວມ'],
    ['/reports/sales/daily-by-user', 'ລາຍງານຍອດຂາຍລາຍມື້ ແຍກຢູ່ເຊີ', 'ຕາຕະລາງແຍກຢູ່ເຊີ'],
    ['/reports/sales/monthly', 'ລາຍງານຍອດຂາຍລາຍເດືອນ', 'ຕາຕະລາງຍອດຂາຍລວມ'],
    ['/reports/sales/monthly-by-user', 'ລາຍງານຍອດຂາຍລາຍເດືອນ ແຍກຢູ່ເຊີ', 'ຕາຕະລາງແຍກຢູ່ເຊີ'],
    ['/reports/sales/quarterly', 'ລາຍງານຍອດຂາຍໄຕມາດ', 'ຕາຕະລາງຍອດຂາຍລວມ'],
    ['/reports/sales/quarterly-by-user', 'ລາຍງານຍອດຂາຍໄຕມາດ ແຍກຢູ່ເຊີ', 'ຕາຕະລາງແຍກຢູ່ເຊີ'],
    ['/reports/sales/annual', 'ລາຍງານຍອດຂາຍລາຍປີ', 'ຕາຕະລາງຍອດຂາຍລວມ'],
    ['/reports/sales/annual-by-user', 'ລາຍງານຍອດຂາຍລາຍປີ ແຍກຢູ່ເຊີ', 'ຕາຕະລາງແຍກຢູ່ເຊີ'],
  ]

  for (const [route, heading, tableTitle] of pages) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.getByText(tableTitle)).toBeVisible()
    await expect(page.locator('tbody tr').first()).toBeVisible()
  }
})

test('each underwriting report is its own page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)
  await page.evaluate(() => {
    for (let id = 1; id <= 5; id += 1) sessionStorage.setItem(`saiyfon-banner-seen-${id}`, '1')
  })

  const pages = [
    ['/reports/underwriting/date-range', 'ລາຍງານຕາມຊ່ວງວັນທີ'],
    ['/reports/underwriting/company', 'ລາຍງານຕາມບໍລິສັດ & ວັນທີ'],
    ['/reports/underwriting/expiration', 'ລາຍງານສັນຍາໃກ້ໝົດອາຍຸ'],
    ['/reports/underwriting/expiration-by-agent', 'ລາຍງານໝົດອາຍຸແຍກຕາມຕົວແທນ'],
  ]

  for (const [route, heading] of pages) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.getByText(heading, { exact: false }).first()).toBeVisible()
  }
})

test('old report URLs redirect to dedicated pages', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)

  await page.goto('/reports/sales?granularity=daily&groupBy=user')
  await expect(page).toHaveURL(/\/reports\/sales\/daily-by-user/)

  await page.goto('/reports/sales?granularity=quarterly')
  await expect(page).toHaveURL(/\/reports\/sales\/quarterly/)

  await page.goto('/reports/underwriting?tab=company')
  await expect(page).toHaveURL(/\/reports\/underwriting\/company/)

  await page.goto('/reports/underwriting?tab=agentExpiry')
  await expect(page).toHaveURL(/\/reports\/underwriting\/expiration-by-agent/)
})

test('old nested menu URLs redirect to flat menu URLs', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)

  const redirects = [
    ['/insurers/commissions', '/insurer-commissions'],
    ['/customers/vehicles', '/vehicles'],
    ['/policies/my-policies', '/my-policies'],
    ['/marketing/banners', '/marketing-banners'],
  ]

  for (const [legacy, target] of redirects) {
    await page.goto(legacy)
    await expect(page).toHaveURL(new RegExp(target))
  }
})

test('notification menu shows birthday alerts', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop smoke')
  await login(page)
  await page.getByRole('button', { name: 'ການແຈ້ງເຕີມ' }).click()
  await expect(page.getByText(/ວັນເກີດ/).first()).toBeVisible()
})
