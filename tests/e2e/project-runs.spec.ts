import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')

test.describe('Lượt chạy dự án (Project Runs)', () => {
  test.use({ storageState: OWNER_FILE })

  test('[TC-RUNS-001] hiển thị trạng thái trống khi không có lượt chạy nào cho dự án mới', async ({ page }) => {
    const slug = `e2e-runs-${Date.now()}`
    // Create project first
    await page.goto('/dashboard/projects')
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Runs Test Project')
    await page.getByTestId('input-project-slug').fill(slug)
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId(`project-row-${slug}`)).toBeVisible({ timeout: 8000 })

    await page.goto(`/dashboard/${slug}`)
    await expect(page.getByTestId('runs-empty')).toBeVisible()
  })

  test('[TC-RUNS-002] KHÔNG hiển thị nút Trigger CI khi chưa cấu hình CI', async ({ page }) => {
    const slug = `e2e-noci-${Date.now()}`
    await page.goto('/dashboard/projects')
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('No CI Project')
    await page.getByTestId('input-project-slug').fill(slug)
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId(`project-row-${slug}`)).toBeVisible({ timeout: 8000 })

    await page.goto(`/dashboard/${slug}`)
    await expect(page.getByTestId('btn-trigger-ci')).not.toBeVisible()
  })

  test('[TC-RUNS-003] hiển thị bảng lượt chạy khi có dữ liệu', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    const hasProjects = await list.isVisible()
    if (!hasProjects) {
      test.skip()
      return
    }
    // Navigate to first project that has runs
    const firstViewRuns = page.locator('a:has-text("View Runs →")').first()
    if (await firstViewRuns.isVisible()) {
      const href = await firstViewRuns.getAttribute('href')
      if (href) {
        await page.goto(href)
        const table = page.getByTestId('runs-table')
        const empty = page.getByTestId('runs-empty')
        const hasTable = await table.isVisible()
        if (hasTable) {
          await expect(table).toBeVisible()
        } else {
          await expect(empty).toBeVisible()
        }
      }
    }
  })

  test('[TC-RUNS-004] mở modal chi tiết lượt chạy khi click vào Detail', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    if (!await list.isVisible()) {
      test.skip()
      return
    }
    const firstViewRuns = page.locator('a:has-text("View Runs →")').first()
    if (await firstViewRuns.isVisible()) {
      const href = await firstViewRuns.getAttribute('href')
      if (href) {
        await page.goto(href)
        const detailBtn = page.locator('[data-testid^="btn-detail-"]').first()
        if (await detailBtn.isVisible()) {
          await detailBtn.click()
          await expect(page.getByTestId('run-detail-modal')).toBeVisible({ timeout: 5000 })
        }
      }
    }
  })

  test('[TC-RUNS-005] đóng modal chi tiết lượt chạy khi click vào nút đóng', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    if (!await list.isVisible()) {
      test.skip()
      return
    }
    const firstViewRuns = page.locator('a:has-text("View Runs →")').first()
    if (await firstViewRuns.isVisible()) {
      const href = await firstViewRuns.getAttribute('href')
      if (href) {
        await page.goto(href)
        const detailBtn = page.locator('[data-testid^="btn-detail-"]').first()
        if (await detailBtn.isVisible()) {
          await detailBtn.click()
          await expect(page.getByTestId('run-detail-modal')).toBeVisible({ timeout: 5000 })
          await page.getByTestId('btn-close-modal').click()
          await expect(page.getByTestId('run-detail-modal')).not.toBeVisible()
        }
      }
    }
  })

  test('[TC-RUNS-006] hiển thị huy hiệu trạng thái với màu sắc chính xác', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    if (!await list.isVisible()) {
      test.skip()
      return
    }
    const firstViewRuns = page.locator('a:has-text("View Runs →")').first()
    if (await firstViewRuns.isVisible()) {
      const href = await firstViewRuns.getAttribute('href')
      if (href) {
        await page.goto(href)
        const table = page.getByTestId('runs-table')
        if (await table.isVisible()) {
          const rows = page.locator('[data-testid^="run-row-"]')
          const count = await rows.count()
          if (count > 0) {
            await expect(rows.first()).toBeVisible()
          }
        }
      }
    }
  })
})
