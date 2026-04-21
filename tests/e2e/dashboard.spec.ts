import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, '.auth/member.json')

test.describe('Bảng điều khiển — chủ sở hữu (owner)', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('[TC-DASH-001] hiển thị trang bảng điều khiển', async ({ page }) => {
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('[TC-DASH-002] hiển thị thông báo chào mừng kèm tên người dùng', async ({ page }) => {
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible()
    await expect(page.getByTestId('dashboard-welcome')).toContainText('Welcome back')
    await expect(page.getByTestId('dashboard-welcome')).toContainText('huuvy')
  })

  test('[TC-DASH-003] hiển thị thẻ điều hướng Dự án (Projects)', async ({ page }) => {
    const nav = page.getByTestId('nav-projects')
    await expect(nav).toBeVisible()
    await expect(nav).toHaveAttribute('href', '/dashboard/projects')
  })

  test('[TC-DASH-004] hiển thị thẻ điều hướng Người dùng (Users)', async ({ page }) => {
    const nav = page.getByTestId('nav-users')
    await expect(nav).toBeVisible()
    await expect(nav).toHaveAttribute('href', '/dashboard/users')
  })

  test('[TC-DASH-005] chuyển hướng đến trang dự án khi click', async ({ page }) => {
    await page.getByTestId('nav-projects').click()
    await expect(page).toHaveURL(/\/dashboard\/projects/)
  })

  test('[TC-DASH-006] chuyển hướng đến trang người dùng khi click', async ({ page }) => {
    await page.getByTestId('nav-users').click()
    await expect(page).toHaveURL(/\/dashboard\/users/)
  })
})

test.describe('Bảng điều khiển — thành viên (member)', () => {
  test.use({ storageState: MEMBER_FILE })

  test('[TC-DASH-007] cho phép thành viên truy cập bảng điều khiển', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('dashboard-welcome')).toContainText('testmember')
  })
})
