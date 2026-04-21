import { test, expect } from '@playwright/test'

test.describe('Trang đăng nhập', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('[TC-AUTH-001] hiển thị trang đăng nhập với đầy đủ các thành phần', async ({ page }) => {
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('input-username')).toBeVisible()
    await expect(page.getByTestId('input-password')).toBeVisible()
    await expect(page.getByTestId('btn-login')).toBeVisible()
  })

  test('[TC-AUTH-002] đăng nhập thành công với thông tin hợp lệ', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('[TC-AUTH-003] hiển thị thông báo lỗi khi sai mật khẩu', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('wrongpassword')
    await page.getByTestId('btn-login').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
    await expect(page.getByTestId('login-error')).toContainText('Invalid username or password')
  })

  test('[TC-AUTH-004] hiển thị thông báo lỗi khi sai tên đăng nhập', async ({ page }) => {
    await page.getByTestId('input-username').fill('nonexistent')
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
  })

  test('[TC-AUTH-005] không gửi form khi để trống tên đăng nhập', async ({ page }) => {
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-error')).not.toBeVisible()
  })

  test('[TC-AUTH-006] không gửi form khi để trống mật khẩu', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('[TC-AUTH-007] giữ nguyên trang đăng nhập sau khi đăng nhập thất bại', async ({ page }) => {
    await page.getByTestId('input-username').fill('huuvy')
    await page.getByTestId('input-password').fill('wrong')
    await page.getByTestId('btn-login').click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Bảo vệ phiên đăng nhập — truy cập khi chưa xác thực', () => {
  test('[TC-AUTH-008] chuyển hướng /dashboard sang /login khi chưa xác thực', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('[TC-AUTH-009] chuyển hướng /dashboard/projects sang /login khi chưa xác thực', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('[TC-AUTH-010] chuyển hướng /dashboard/users sang /login khi chưa xác thực', async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
