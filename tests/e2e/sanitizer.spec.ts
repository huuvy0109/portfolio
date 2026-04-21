import { test, expect } from '@playwright/test'

test.describe('Phần Làm sạch dữ liệu (Sanitizer)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-SANI-001] hiển thị phần làm sạch dữ liệu', async ({ page }) => {
    const section = page.getByTestId('sanitizer-section')
    await expect(section).toBeVisible()
  })

  test('[TC-SANI-002] hiển thị tiêu đề chính xác', async ({ page }) => {
    const heading = page.getByTestId('sanitizer-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Data Sanitization Pipeline')
  })

  test('[TC-SANI-003] nút quét lại (re-scan) sẽ kích hoạt quá trình quét', async ({ page }) => {
    await page.getByTestId('sanitizer-section').scrollIntoViewIfNeeded()
    const rescanBtn = page.getByTestId('btn-rescan')
    await expect(rescanBtn).toBeVisible()
    await rescanBtn.click()
    // After scan completes, status shows redacted count
    await expect(page.getByTestId('sanitizer-section')).toContainText('redacted', { timeout: 8000 })
  })
})
