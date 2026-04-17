import { test, expect } from '@playwright/test'

test.describe('Footer Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('footer is visible', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toBeVisible()
  })

  test('contains contact information', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toContainText('huuvy0109@gmail.com')
  })

  test('mentions tech stack', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toContainText('Built with Next.js')
    await expect(footer).toContainText('this page is the SUT')
  })
})
