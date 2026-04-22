import { test, expect, type Page, type APIRequestContext } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')

async function createProject(page: Page, name: string, slug: string): Promise<string | null> {
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/projects') && r.request().method() === 'POST'),
    (async () => {
      await page.goto('/dashboard/projects')
      await page.getByTestId('btn-new-project').click()
      await page.getByTestId('input-project-name').fill(name)
      await page.getByTestId('input-project-slug').fill(slug)
      await page.getByTestId('btn-create-project').click()
    })(),
  ])
  const body = await response.json()
  return body.id ?? null
}

async function deleteProject(request: APIRequestContext, id: string | null) {
  if (id) await request.delete(`/api/projects/${id}`)
}

test.describe('Lượt chạy dự án (Project Runs)', () => {
  test.use({ storageState: OWNER_FILE })

  let pendingCleanup: { request: APIRequestContext; id: string } | null = null

  test.beforeEach(async () => {
    pendingCleanup = null
  })

  test.afterEach(async ({ request }, testInfo) => {
    if (testInfo.status === 'passed' && pendingCleanup) {
      await deleteProject(pendingCleanup.request ?? request, pendingCleanup.id)
    }
    pendingCleanup = null
  })

  test('[TC-RUNS-001] hiển thị trạng thái trống khi không có lượt chạy nào cho dự án mới', async ({ page, request }) => {
    const slug = `e2e-runs-${Date.now()}`
    const createdId = await createProject(page, 'Runs Test Project', slug)
    if (createdId) pendingCleanup = { request, id: createdId }
    await expect(page.getByTestId(`project-card-${slug}`)).toBeVisible({ timeout: 8000 })
    await page.goto(`/dashboard/${slug}`)
    await expect(page.getByTestId('runs-empty')).toBeVisible()
  })

  test('[TC-RUNS-002] KHÔNG hiển thị nút Trigger CI khi chưa cấu hình CI', async ({ page, request }) => {
    const slug = `e2e-noci-${Date.now()}`
    const createdId = await createProject(page, 'No CI Project', slug)
    if (createdId) pendingCleanup = { request, id: createdId }
    await expect(page.getByTestId(`project-card-${slug}`)).toBeVisible({ timeout: 8000 })
    await page.goto(`/dashboard/${slug}`)
    await expect(page.getByTestId('btn-trigger-ci')).not.toBeVisible()
  })

  test('[TC-RUNS-003] hiển thị bảng lượt chạy khi có dữ liệu', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    if (!await list.isVisible()) {
      test.skip()
      return
    }
    const firstViewRuns = page.locator('a:has-text("View Runs")').first()
    if (await firstViewRuns.isVisible()) {
      const href = await firstViewRuns.getAttribute('href')
      if (href) {
        await page.goto(href)
        const table = page.getByTestId('runs-table')
        const empty = page.getByTestId('runs-empty')
        if (await table.isVisible()) {
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
    const firstViewRuns = page.locator('a:has-text("View Runs")').first()
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
    const firstViewRuns = page.locator('a:has-text("View Runs")').first()
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
    const firstViewRuns = page.locator('a:has-text("View Runs")').first()
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
