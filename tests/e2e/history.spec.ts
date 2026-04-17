import { test, expect } from '@playwright/test'

test.describe('History Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('history section is visible', async ({ page }) => {
    // Initial state: history is hidden
    await expect(page.getByTestId('history-section')).not.toBeVisible()

    // 1. Start v1
    await page.getByTestId('btn-run-pipeline').click()
    
    // 2. Click "Simulate Again" (this saves v1 snapshot and switches to v2)
    const simulateAgainBtn = page.locator('button:has-text("Simulate Again")')
    await expect(simulateAgainBtn).toBeVisible()
    await simulateAgainBtn.click()
    
    // 3. Click "Simulate Again" once more (this saves v2 snapshot)
    // Now we should have both v1 and v2 in history
    await expect(simulateAgainBtn).toBeVisible()
    await simulateAgainBtn.click()
    
    const historySection = page.getByTestId('history-section')
    await expect(historySection).toBeVisible({ timeout: 10000 })
  })

  test('displays correct heading', async ({ page }) => {
    await page.getByTestId('btn-run-pipeline').click()
    const simulateAgainBtn = page.locator('button:has-text("Simulate Again")')
    await simulateAgainBtn.click()
    await simulateAgainBtn.click()

    const heading = page.getByTestId('history-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('AI Agent Learning Cycle')
  })
})
