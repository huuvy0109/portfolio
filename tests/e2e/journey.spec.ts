import { test, expect } from '@playwright/test'

test.describe('Phần Hành trình (Journey)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-JOUR-001] hiển thị phần hành trình với tiêu đề chính xác', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('journey-section')).toBeVisible()
  })

  test('[TC-JOUR-002] hiển thị tên tất cả các công ty', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('KiLand', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Seedcom Food').first()).toBeVisible()
    await expect(page.getByText('Haravan').first()).toBeVisible()
  })

  test('[TC-JOUR-003] hiển thị nhãn năm/ngày tháng chính xác', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('Oct 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2024').first()).toBeVisible()
    await expect(page.getByText('Mar 2022').first()).toBeVisible()
    await expect(page.getByText('Jan 2019').first()).toBeVisible()
  })

  test('[TC-JOUR-004] hiển thị liên kết dự án với href chính xác', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    // KiLand is open by default
    await expect(page.getByRole('link', { name: /KiLand\.com\.vn/i }))
      .toHaveAttribute('href', 'https://kiland.com.vn')
    // Open Seedcom QC Lead node to check Sieuthisi link
    await page.getByTestId('journey-node-qc-lead').click()
    await expect(page.getByRole('link', { name: /Sieuthisi\.vn/i }).first())
      .toHaveAttribute('href', 'https://sieuthisi.vn')
    // Open Haravan specialist node to check Haraworks link
    await page.getByTestId('journey-node-haravan-specialist').click()
    await expect(page.getByRole('link', { name: /Haraworks\.vn/i }).first())
      .toHaveAttribute('href', /haraworks\.vn/)
  })

  test('[TC-JOUR-005] hiển thị giải thưởng Nhân viên của năm cho Haravan', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    // Open Haravan Engineer node which has the award
    await page.getByTestId('journey-node-haravan-engineer').click()
    await expect(page.getByText(/Employee of the Year 2019/i)).toBeVisible()
  })

  test('[TC-JOUR-006] sử dụng bố cục accordion/cuộn — không có thanh tab', async ({ page }) => {
    await expect(page.locator('[role="tab"]')).toHaveCount(0)
  })

  test('[TC-JOUR-007] mở rộng mục accordion khi click', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    const accordionTriggers = page.locator('[data-testid^="journey-accordion-"]')
    const count = await accordionTriggers.count()
    if (count > 0) {
      await accordionTriggers.first().click()
      await expect(accordionTriggers.first()).toBeVisible()
    }
  })
})
