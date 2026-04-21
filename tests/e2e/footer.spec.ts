import { test, expect } from '@playwright/test'

test.describe('Phần Footer (Chân trang)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-FOOT-001] hiển thị footer', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toBeVisible()
  })

  test('[TC-FOOT-002] chứa thông tin liên hệ', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toContainText('huuvy0109@gmail.com')
  })

  test('[TC-FOOT-003] đề cập đến tech stack', async ({ page }) => {
    const footer = page.getByTestId('footer')
    await expect(footer).toContainText('Built with Next.js')
    await expect(footer).toContainText('this page is the SUT')
  })
})
