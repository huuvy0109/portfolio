import { test, expect } from '@playwright/test'

test.describe('Sidebar — Theme & Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render sidebar', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  // --- Language Switcher ---
  test('should display EN and VI language buttons', async ({ page }) => {
    await expect(page.getByTestId('lang-en')).toBeVisible()
    await expect(page.getByTestId('lang-vi')).toBeVisible()
  })

  test('should switch to Vietnamese when VI is clicked', async ({ page }) => {
    await page.getByTestId('lang-vi').click()
    await expect(page.getByTestId('lang-vi')).toBeVisible()
    // Navigation items should update to Vietnamese
    await expect(page.getByText('Tổng Quan')).toBeVisible()
  })

  test('should switch back to English when EN is clicked', async ({ page }) => {
    await page.getByTestId('lang-vi').click()
    await page.getByTestId('lang-en').click()
    await expect(page.getByText('Overview')).toBeVisible()
  })

  // --- Theme Switcher ---
  test('should show theme toggle button', async ({ page }) => {
    await expect(page.getByTestId('btn-theme-toggle')).toBeVisible()
  })

  test('should expand theme panel when toggle is clicked', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await expect(page.getByTestId('theme-sovereign')).toBeVisible()
    await expect(page.getByTestId('theme-verdant')).toBeVisible()
  })

  test('should have 3 theme options: editorial, sovereign, verdant', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await expect(page.getByTestId('theme-sovereign')).toBeVisible()
    await expect(page.getByTestId('theme-verdant')).toBeVisible()
  })

  test('should apply sovereign theme when selected', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-sovereign').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'sovereign')
  })

  test('should apply verdant theme when selected', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-verdant').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'verdant')
  })

  test('should apply editorial theme when selected', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-sovereign').click()
    await page.getByTestId('theme-editorial').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'editorial')
  })

  test('should collapse theme panel when toggle is clicked again', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).not.toBeVisible()
  })
})
