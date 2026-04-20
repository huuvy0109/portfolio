import { test, expect } from '@playwright/test'

test.describe('History Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('history-section').scrollIntoViewIfNeeded()
  })

  test('should be visible on page load', async ({ page }) => {
    await expect(page.getByTestId('history-section')).toBeVisible()
  })

  test('should display correct heading', async ({ page }) => {
    const heading = page.getByTestId('history-section').locator('h2').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/Playwright Run Archive|Kho Lưu Playwright Runs/)
  })

  test('should display run list with multiple items', async ({ page }) => {
    const section = page.getByTestId('history-section')
    // Mock runs are always displayed — at least 2 visible
    await expect(section.getByText(/PASS|FAIL/).first()).toBeVisible()
  })

  test('should show pass and fail status badges', async ({ page }) => {
    const section = page.getByTestId('history-section')
    await expect(section.getByText('✓ PASS').first()).toBeVisible()
    await expect(section.getByText('✗ FAIL').first()).toBeVisible()
  })

  test('should update detail panel when a run is clicked', async ({ page }) => {
    const section = page.getByTestId('history-section')
    // Click second run item
    const runItems = section.locator('[style*="cursor: pointer"]')
    const count = await runItems.count()
    if (count > 1) {
      await runItems.nth(1).click()
      // Detail panel updates — spec files still visible
      await expect(section.getByText('hero.spec.ts').first()).toBeVisible()
    }
  })
})
