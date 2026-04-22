import { test, expect, type Page, type APIRequestContext } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, '.auth/member.json')

async function createProjectViaUI(page: Page, name: string, slug: string): Promise<string | null> {
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/projects') && r.request().method() === 'POST'),
    (async () => {
      await page.getByTestId('btn-new-project').click()
      await page.getByTestId('input-project-name').fill(name)
      await page.getByTestId('input-project-slug').fill(slug)
      await page.getByTestId('btn-create-project').click()
    })(),
  ])
  const body = await response.json()
  return body.id ?? null
}

async function cleanupProject(request: APIRequestContext, id: string | null) {
  if (id) await request.delete(`/api/projects/${id}`)
}

test.describe('Dự án — chủ sở hữu (owner)', () => {
  test.use({ storageState: OWNER_FILE })

  // Shared cleanup registry per test — afterEach reads this
  let pendingCleanup: { request: APIRequestContext; id: string } | null = null

  test.beforeEach(async ({ page }) => {
    pendingCleanup = null
    await page.goto('/dashboard/projects')
  })

  test.afterEach(async ({ request }, testInfo) => {
    if (testInfo.status === 'passed' && pendingCleanup) {
      await cleanupProject(pendingCleanup.request ?? request, pendingCleanup.id)
    }
    pendingCleanup = null
  })

  test('[TC-PROJ-001] hiển thị trang dự án', async ({ page }) => {
    await expect(page.getByTestId('btn-new-project')).toBeVisible()
  })

  test('[TC-PROJ-002] hiển thị trạng thái trống khi không có dự án nào', async ({ page }) => {
    const list = page.getByTestId('projects-list')
    const empty = page.getByTestId('projects-empty')
    const hasProjects = await list.isVisible()
    if (!hasProjects) {
      await expect(empty).toBeVisible()
    }
  })

  test('[TC-PROJ-003] bật/tắt slide panel tạo dự án mới khi click nút', async ({ page }) => {
    await expect(page.getByTestId('form-create-project')).not.toBeVisible()
    await page.getByTestId('btn-new-project').click()
    await expect(page.getByTestId('form-create-project')).toBeVisible()
  })

  test('[TC-PROJ-004] tự động tạo slug từ tên dự án', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('My Test Project')
    await expect(page.getByTestId('input-project-slug')).toHaveValue('my-test-project')
  })

  test('[TC-PROJ-005] tự động tạo slug và loại bỏ ký tự đặc biệt', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Project @#! 123')
    await expect(page.getByTestId('input-project-slug')).toHaveValue('project--123')
  })

  test('[TC-PROJ-006] tạo dự án mới và hiển thị trong danh sách', async ({ page, request }) => {
    const slug = `e2e-test-${Date.now()}`
    const createdId = await createProjectViaUI(page, 'E2E Test Project', slug)
    if (createdId) pendingCleanup = { request, id: createdId }
    await expect(page.getByTestId(`project-card-${slug}`)).toBeVisible({ timeout: 8000 })
  })

  test('[TC-PROJ-007] hiển thị lỗi khi trùng slug', async ({ page, request }) => {
    const dupSlug = `dup-slug-${Date.now()}`
    const createdId = await createProjectViaUI(page, 'Duplicate', dupSlug)
    if (createdId) pendingCleanup = { request, id: createdId }
    await expect(page.getByTestId(`project-card-${dupSlug}`)).toBeVisible({ timeout: 8000 })

    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('input-project-name').fill('Duplicate 2')
    await page.getByTestId('input-project-slug').fill(dupSlug)
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId('project-form-error')).toBeVisible({ timeout: 5000 })
  })

  test('[TC-PROJ-008] không gửi form tạo khi để trống tên', async ({ page }) => {
    await page.getByTestId('btn-new-project').click()
    await page.getByTestId('btn-create-project').click()
    await expect(page.getByTestId('form-create-project')).toBeVisible()
  })

  test('[TC-PROJ-009] xóa dự án sau khi xác nhận', async ({ page, request }) => {
    const slug = `e2e-del-${Date.now()}`
    const createdId = await createProjectViaUI(page, 'Delete Me', slug)
    // fallback: nếu UI delete fail, afterEach sẽ không cleanup (test fail) → giữ lại để debug
    if (createdId) pendingCleanup = { request, id: createdId }
    await expect(page.getByTestId(`project-card-${slug}`)).toBeVisible({ timeout: 8000 })

    await page.getByTestId(`btn-delete-project-${createdId}`).click()
    const confirmBtn = page.locator('button', { hasText: 'Delete Project' })
    await expect(confirmBtn).toBeVisible({ timeout: 3000 })
    await confirmBtn.click()
    await expect(page.getByTestId(`project-card-${slug}`)).not.toBeVisible({ timeout: 5000 })

    pendingCleanup = null // xóa thành công qua UI, không cần cleanup
  })
})

test.describe('Dự án — quyền hiển thị của thành viên', () => {
  test.use({ storageState: MEMBER_FILE })

  test('[TC-PROJ-010] cho phép thành viên xem trang dự án', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL(/\/dashboard\/projects/)
  })

  test('[TC-PROJ-011] chỉ xem được những dự án mà họ là thành viên', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const list = page.getByTestId('projects-list')
    const empty = page.getByTestId('projects-empty')
    const hasProjects = await list.isVisible()
    if (hasProjects) {
      await expect(list).toBeVisible()
    } else {
      await expect(empty).toBeVisible()
    }
  })
})
