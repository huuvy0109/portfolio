import { test, expect } from '@playwright/test'

test.describe('Thanh bên — Giao diện & Ngôn ngữ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-THEM-001] hiển thị thanh bên', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  // --- Language Switcher ---
  test('[TC-THEM-002] hiển thị các nút ngôn ngữ EN và VI', async ({ page }) => {
    await expect(page.getByTestId('lang-en')).toBeVisible()
    await expect(page.getByTestId('lang-vi')).toBeVisible()
  })

  test('[TC-THEM-003] chuyển sang tiếng Việt khi click VI', async ({ page }) => {
    await page.getByTestId('lang-vi').click()
    await expect(page.getByTestId('lang-vi')).toBeVisible()
    // Navigation items should update to Vietnamese
    await expect(page.getByText('Tổng Quan')).toBeVisible()
  })

  test('[TC-THEM-004] chuyển lại tiếng Anh khi click EN', async ({ page }) => {
    await page.getByTestId('lang-vi').click()
    await page.getByTestId('lang-en').click()
    await expect(page.getByText('Overview')).toBeVisible()
  })

  // --- Theme Switcher ---
  test('[TC-THEM-005] hiển thị nút chuyển đổi giao diện', async ({ page }) => {
    await expect(page.getByTestId('btn-theme-toggle')).toBeVisible()
  })

  test('[TC-THEM-006] mở rộng bảng giao diện khi click chuyển đổi', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await expect(page.getByTestId('theme-sovereign')).toBeVisible()
    await expect(page.getByTestId('theme-verdant')).toBeVisible()
  })

  test('[TC-THEM-007] có 3 tùy chọn giao diện: editorial, sovereign, verdant', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await expect(page.getByTestId('theme-sovereign')).toBeVisible()
    await expect(page.getByTestId('theme-verdant')).toBeVisible()
  })

  test('[TC-THEM-008] áp dụng giao diện sovereign khi được chọn', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-sovereign').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'sovereign')
  })

  test('[TC-THEM-009] áp dụng giao diện verdant khi được chọn', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-verdant').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'verdant')
  })

  test('[TC-THEM-010] áp dụng giao diện editorial khi được chọn', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await page.getByTestId('theme-sovereign').click()
    await page.getByTestId('theme-editorial').click()
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'editorial')
  })

  test('[TC-THEM-011] thu gọn bảng giao diện khi click chuyển đổi lần nữa', async ({ page }) => {
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).toBeVisible()
    await page.getByTestId('btn-theme-toggle').click()
    await expect(page.getByTestId('theme-editorial')).not.toBeVisible()
  })
})
