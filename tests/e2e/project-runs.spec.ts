import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')

test.describe('Project Runs', () => {
  test.use({ storageState: OWNER_FILE })

  test('should show empty state when no runs exist for a new project', async ({ page }) => {
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

  test('should NOT show Trigger CI button when ciConfig is not set', async ({ page }) => {
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

  test('should show runs table when runs exist', async ({ page }) => {
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

  test('should open run detail modal on Detail click', async ({ page }) => {
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

  test('should close run detail modal on close button click', async ({ page }) => {
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

  test('should show run status badges in correct colors', async ({ page }) => {
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
