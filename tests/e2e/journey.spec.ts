import { test, expect } from '@playwright/test'

test.describe('Journey Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('journey section is visible', async ({ page }) => {
    const section = page.getByTestId('journey-section')
    await expect(section).toBeVisible()
  })

  test('displays correct heading', async ({ page }) => {
    const heading = page.getByTestId('journey-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('7 Years in the Trenches')
  })

  test('lists professional roles', async ({ page }) => {
    const roles = page.locator('#journey .group')
    await expect(roles).toHaveCount(3)
    
    // Check first role
    const firstRole = roles.first()
    await expect(firstRole).toContainText('Haraworks')
    await expect(firstRole).toContainText('QA Lead')
  })
})
