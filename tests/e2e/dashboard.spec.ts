import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, '.auth/member.json')

test.describe('Dashboard — owner', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should render dashboard page', async ({ page }) => {
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('should display welcome message with username', async ({ page }) => {
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible()
    await expect(page.getByTestId('dashboard-welcome')).toContainText('Welcome back')
    await expect(page.getByTestId('dashboard-welcome')).toContainText('huuvy')
  })

  test('should show Projects navigation card', async ({ page }) => {
    const nav = page.getByTestId('nav-projects')
    await expect(nav).toBeVisible()
    await expect(nav).toHaveAttribute('href', '/dashboard/projects')
  })

  test('should show Users navigation card', async ({ page }) => {
    const nav = page.getByTestId('nav-users')
    await expect(nav).toBeVisible()
    await expect(nav).toHaveAttribute('href', '/dashboard/users')
  })

  test('should navigate to projects page on click', async ({ page }) => {
    await page.getByTestId('nav-projects').click()
    await expect(page).toHaveURL(/\/dashboard\/projects/)
  })

  test('should navigate to users page on click', async ({ page }) => {
    await page.getByTestId('nav-users').click()
    await expect(page).toHaveURL(/\/dashboard\/users/)
  })
})

test.describe('Dashboard — member', () => {
  test.use({ storageState: MEMBER_FILE })

  test('should allow member to access dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('dashboard-welcome')).toContainText('testmember')
  })
})
