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
    const rescanBtn = page.getByTestId('btn-rescan')
    await expect(rescanBtn).toBeVisible()
    await rescanBtn.click()
    
    // Verify scanning state (text changes to SCANNING...)
    const status = page.locator('text=sanitized_report.json — SCANNING...')
    await expect(status).toBeVisible()
  })
})
