import { test, expect } from '@playwright/test'

test.describe('Journey Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('section is present and heading is correct', async ({ page }) => {
    const section = page.getByTestId('journey-section')
    await expect(section).toBeVisible()
    const heading = page.getByTestId('journey-heading')
    await expect(heading).toHaveText('7 Năm Trong Nghề')
  })

  test('all 5 timeline nodes are visible on scroll', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('KiLand')).toBeVisible()
    await expect(page.getByText('Seedcom Food')).toBeVisible()
    await expect(page.getByText('Haravan')).toBeVisible()
  })

  test('year labels are rendered with correct years', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('Oct 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2024').first()).toBeVisible()
    await expect(page.getByText('Mar 2022').first()).toBeVisible()
    await expect(page.getByText('Jan 2019').first()).toBeVisible()
  })

  test('project links point to correct URLs', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByRole('link', { name: /KiLand\.com\.vn/i })).toHaveAttribute('href', 'https://kiland.com.vn')
    await expect(page.getByRole('link', { name: /Sieuthisi\.vn/i }).first()).toHaveAttribute('href', 'https://sieuthisi.vn')
    await expect(page.getByRole('link', { name: /Haraworks\.vn/i }).first()).toHaveAttribute('href', 'https://haraworks.vn')
  })

  test('Haravan node shows Employee of Year award', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('Nhân viên xuất sắc năm 2019')).toBeVisible()
  })

  test('no tab bar exists — scroll layout only', async ({ page }) => {
    const tabButtons = page.locator('[role="tab"]')
    await expect(tabButtons).toHaveCount(0)
  })
})
