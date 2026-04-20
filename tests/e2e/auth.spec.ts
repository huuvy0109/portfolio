import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should render login page with all elements', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('input-username')).toBeVisible()
    await expect(page.getByTestId('input-password')).toBeVisible()
    await expect(page.getByTestId('btn-login')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should show error message with invalid password', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('wrongpassword')
    await page.getByTestId('btn-login').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
    await expect(page.getByTestId('login-error')).toContainText('Invalid username or password')
  })

  test('should show error message with invalid username', async ({ page }) => {
    await page.getByTestId('input-username').fill('nonexistent')
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
  })

  test('should not submit form with empty username', async ({ page }) => {
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-error')).not.toBeVisible()
  })

  test('should not submit form with empty password', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should stay on login page after failed login', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('wrong')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Session Guard — unauthenticated access', () => {
  test('should redirect /dashboard to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('should redirect /dashboard/projects to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('should redirect /dashboard/users to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
