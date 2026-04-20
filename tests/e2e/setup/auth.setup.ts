import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const OWNER_FILE = path.join(__dirname, '../.auth/owner.json')
export const MEMBER_FILE = path.join(__dirname, '../.auth/member.json')

setup('authenticate as owner', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('input-username').fill('huuvy')
  await page.getByTestId('input-password').fill('admin123')
  await page.getByTestId('btn-login').click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  await page.context().storageState({ path: OWNER_FILE })
})

setup('authenticate as member', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('input-username').fill('testmember')
  await page.getByTestId('input-password').fill('member123')
  await page.getByTestId('btn-login').click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  await page.context().storageState({ path: MEMBER_FILE })
})
