import { test, expect } from '@playwright/test'

test.describe('Sanitizer Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('sanitizer section is visible', async ({ page }) => {
    const section = page.getByTestId('sanitizer-section')
    await expect(section).toBeVisible()
  })

  test('displays correct heading', async ({ page }) => {
    const heading = page.getByTestId('sanitizer-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Data Sanitization Pipeline')
  })

  test('re-scan button triggers scanning', async ({ page }) => {
    await page.getByTestId('sanitizer-section').scrollIntoViewIfNeeded()
    const rescanBtn = page.getByTestId('btn-rescan')
    await expect(rescanBtn).toBeVisible()
    await rescanBtn.click()
    // After scan completes, status shows redacted count
    await expect(page.getByTestId('sanitizer-section')).toContainText('redacted', { timeout: 8000 })
  })
})
