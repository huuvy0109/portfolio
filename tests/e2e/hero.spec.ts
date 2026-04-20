import { test, expect } from '@playwright/test'

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders heading correctly', async ({ page }) => {
    const heading = page.getByTestId('hero-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('HUU VY')
  })

  test('CTA button is visible and clickable', async ({ page }) => {
    const btn = page.getByTestId('btn-run-pipeline')
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()
    await expect(btn).toContainText('Run Pipeline')
  })

  test('stats section renders 4 items', async ({ page }) => {
    const stats = page.getByTestId('hero-stats')
    await expect(stats).toBeVisible()
    const items = stats.locator('> div')
    await expect(items).toHaveCount(4)
  })

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/Vy Quang Huu/)
  })
})
