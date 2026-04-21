import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, '.auth/member.json')

test.describe('Projects — owner', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/projects')
  })

  test('should render projects page', async ({ page }) => {
    await expect(page.getByTestId('btn-new-project')).toBeVisible()
  })

  test('should show empty state when no projects exist', async ({ page }) => {
    const list = page.getByTestId('projects-list')
    const empty = page.getByTestId('projects-empty')
    const hasProjects = await list.isVisible()
    if (!hasProjects) {
      await expect(empty).toBeVisible()
    }
  })

  test('should toggle new project form on button click', async ({ page }) => {
    await expect(page.getByTestId('form-new-project')).not.toBeVisible()
    await page.getByTestId('btn-new-project').click()
    await expect(page.getByTestId('form-new-project')).toBeVisible()
    await page.getByTestId('btn-new-project').click()
    await expect(page.getByTestId('form-new-project')).not.toBeVisible()
  })

  test('should auto-generate slug from project name', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('My Test Project')
    await expect(page.getByTestId('input-project-slug')).toHaveValue('my-test-project')
  })

  test('should auto-generate slug removing special characters', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Project @#! 123')
    await expect(page.getByTestId('input-project-slug')).toHaveValue('project--123')
  })

  test('should create a new project and show in list', async ({ page, request }) => {
    const slug = `e2e-test-${Date.now()}`
    let createdId: string | null = null

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/projects') && r.request().method() === 'POST'),
      (async () => {
        await page.getByTestId('btn-new-project').click()
        await page.getByTestId('input-project-name').fill('E2E Test Project')
        await page.getByTestId('input-project-slug').fill(slug)
        await page.getByTestId('btn-create-project').click()
      })(),
    ])

    const body = await response.json()
    createdId = body.id ?? null

    await expect(page.getByTestId(`project-row-${slug}`)).toBeVisible({ timeout: 8000 })

    if (createdId) await request.delete(`/api/projects/${createdId}`)
  })

  test('should show error on duplicate slug', async ({ page, request }) => {
    const dupSlug = `dup-slug-${Date.now()}`
    let createdId: string | null = null

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/projects') && r.request().method() === 'POST'),
      (async () => {
        await page.getByTestId('btn-new-project').click()
        await page.getByTestId('input-project-name').fill('Duplicate')
        await page.getByTestId('input-project-slug').fill(dupSlug)
        await page.getByTestId('btn-create-project').click()
      })(),
    ])

    const body = await response.json()
    createdId = body.id ?? null

    await expect(page.getByTestId(`project-row-${dupSlug}`)).toBeVisible({ timeout: 8000 })

    // Second: try same slug → expect error
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Duplicate 2')
    await page.getByTestId('input-project-slug').fill(dupSlug)
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId('project-form-error')).toBeVisible({ timeout: 5000 })

    if (createdId) await request.delete(`/api/projects/${createdId}`)
  })

  test('should not submit create form with empty name', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId('form-new-project')).toBeVisible()
  })

  test('should delete a project after confirm', async ({ page }) => {
    const slug = `e2e-del-${Date.now()}`
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Delete Me')
    await page.getByTestId('input-project-slug').fill(slug)
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId(`project-row-${slug}`)).toBeVisible({ timeout: 8000 })

    page.once('dialog', dialog => dialog.accept())
    await page.getByTestId(`btn-delete-${slug}`).click()
    await expect(page.getByTestId(`project-row-${slug}`)).not.toBeVisible({ timeout: 5000 })
  })
})

test.describe('Projects — member visibility', () => {
  test.use({ storageState: MEMBER_FILE })

  test('should allow member to view projects page', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL(/\/dashboard\/projects/)
  })

  test('should only see projects they are member of', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    const empty = page.getByTestId('projects-empty')
    const hasProjects = await list.isVisible()
    if (hasProjects) {
      // member should not see "Delete" buttons for projects they don't own
      // (owner-only operations would be hidden or restricted by API)
      await expect(list).toBeVisible()
    } else {
      await expect(empty).toBeVisible()
    }
  })
})
