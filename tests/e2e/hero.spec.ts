import { test, expect } from '@playwright/test'

test.describe('Phần Hero (Trang chủ)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-HERO-001] hiển thị tiêu đề chính xác', async ({ page }) => {
    const heading = page.getByTestId('hero-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('HUU VY')
  })

  test('[TC-HERO-002] nút CTA hiển thị và có thể click', async ({ page }) => {
    const btn = page.getByTestId('btn-run-pipeline')
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
    await expect(btn).toContainText('Run Pipeline')
  })

  test('[TC-HERO-003] phần thống kê hiển thị 4 mục', async ({ page }) => {
    const stats = page.getByTestId('hero-stats')
    await expect(stats).toBeVisible()
    const items = stats.locator('> div')
    await expect(items).toHaveCount(4)
  })

  test('[TC-HERO-004] tiêu đề trang web chính xác', async ({ page }) => {
    await expect(page).toHaveTitle(/Vy Quang Huu/)
  })
})
