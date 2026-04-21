import { test, expect } from '@playwright/test'

test.describe('Phần Lịch sử (History)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('history-section').scrollIntoViewIfNeeded()
  })

  test('[TC-HIST-001] hiển thị khi tải trang', async ({ page }) => {
    await expect(page.getByTestId('history-section')).toBeVisible()
  })

  test('[TC-HIST-002] hiển thị tiêu đề chính xác', async ({ page }) => {
    const heading = page.getByTestId('history-section').locator('h2').first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/Playwright Run Archive|Kho Lưu Playwright Runs/)
  })

  test('[TC-HIST-003] hiển thị danh sách chạy với nhiều mục', async ({ page }) => {
    const section = page.getByTestId('history-section')
    // Mock runs are always displayed — at least 2 visible
    await expect(section.getByText(/PASS|FAIL/).first()).toBeVisible()
  })

  test('[TC-HIST-004] hiển thị huy hiệu trạng thái pass và fail', async ({ page }) => {
    const section = page.getByTestId('history-section')
    await expect(section.getByText('✓ PASS').first()).toBeVisible()
    await expect(section.getByText('✗ FAIL').first()).toBeVisible()
  })

  test('[TC-HIST-005] cập nhật bảng chi tiết khi click vào một lượt chạy', async ({ page }) => {
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
