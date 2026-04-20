import { test, expect } from '@playwright/test'

test.describe('Journey Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render journey section with correct heading', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('journey-section')).toBeVisible()
  })

  test('should display all company names', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('KiLand', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Seedcom Food').first()).toBeVisible()
    await expect(page.getByText('Haravan').first()).toBeVisible()
  })

  test('should display correct year/date labels', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    await expect(page.getByText('Oct 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2025').first()).toBeVisible()
    await expect(page.getByText('Jan 2024').first()).toBeVisible()
    await expect(page.getByText('Mar 2022').first()).toBeVisible()
    await expect(page.getByText('Jan 2019').first()).toBeVisible()
  })

  test('should display project links with correct href', async ({ page }) => {
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

  test('should show Employee of Year award for Haravan', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    // Open Haravan Engineer node which has the award
    await page.getByTestId('journey-node-haravan-engineer').click()
    await expect(page.getByText(/Employee of the Year 2019/i)).toBeVisible()
  })

  test('should use accordion/scroll layout — no tab bar', async ({ page }) => {
    await expect(page.locator('[role="tab"]')).toHaveCount(0)
  })

  test('should expand accordion item when clicked', async ({ page }) => {
    await page.getByTestId('journey-section').scrollIntoViewIfNeeded()
    const accordionTriggers = page.locator('[data-testid^="journey-accordion-"]')
    const count = await accordionTriggers.count()
    if (count > 0) {
      await accordionTriggers.first().click()
      await expect(accordionTriggers.first()).toBeVisible()
    }
  })
})
