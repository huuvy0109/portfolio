import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const OWNER_FILE = path.join(__dirname, '../.auth/owner.json')
export const MEMBER_FILE = path.join(__dirname, '../.auth/member.json')

setup('authenticate as owner', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByTestId('login-form'), 'Login form must be visible — check DB seed and NEXTAUTH_SECRET').toBeVisible({ timeout: 15000 })
  await page.getByTestId('input-username').fill('huuvy')
  await page.getByTestId('input-password').fill('admin123')
  await page.getByTestId('btn-login').click()

  const redirected = await page.waitForURL(/\/dashboard/, { timeout: 15000 }).then(() => true).catch(() => false)
  if (!redirected) {
    const errorEl = page.getByTestId('login-error')
    const errorText = await errorEl.textContent().catch(() => '(no error element)')
    throw new Error(`Owner login failed — stayed on ${page.url()}. Error: ${errorText}. Check DB seed (node scripts/seed-test-users.mjs).`)
  }

  await page.context().storageState({ path: OWNER_FILE })
})

setup('authenticate as member', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByTestId('login-form'), 'Login form must be visible — check DB seed and NEXTAUTH_SECRET').toBeVisible({ timeout: 15000 })
  await page.getByTestId('input-username').fill('testmember')
  await page.getByTestId('input-password').fill('member123')
  await page.getByTestId('btn-login').click()

  const redirected = await page.waitForURL(/\/dashboard/, { timeout: 15000 }).then(() => true).catch(() => false)
  if (!redirected) {
    const errorEl = page.getByTestId('login-error')
    const errorText = await errorEl.textContent().catch(() => '(no error element)')
    throw new Error(`Member login failed — stayed on ${page.url()}. Error: ${errorText}. Check DB seed (node scripts/seed-test-users.mjs).`)
  }

  await page.context().storageState({ path: MEMBER_FILE })
})
