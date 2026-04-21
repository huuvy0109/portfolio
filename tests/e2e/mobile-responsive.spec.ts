/**
 * mobile-responsive.spec.ts
 * Covers: sidebar hamburger, main content visibility, dashboard pages on mobile viewport
 * Viewport: 390x844 (iPhone 14) — simulates real mobile
 */

import { test, expect } from '@playwright/test'

const MOBILE = { width: 390, height: 844 }

// ─── Portfolio main page — mobile ───────────────────────────────────────────

test.describe('Portfolio — Bố cục di động', () => {
  test.use({ viewport: MOBILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-MOB-001] hiển thị nút hamburger trên thiết bị di động', async ({ page }) => {
    await expect(page.getByTestId('btn-mobile-menu')).toBeVisible()
  })

  test('[TC-MOB-002] ẩn thanh bên theo mặc định trên thiết bị di động', async ({ page }) => {
    // Sidebar nav exists in DOM but must not be visible (display:none)
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).not.toBeVisible()
  })

  test('[TC-MOB-003] mở ngăn kéo thanh bên khi click vào hamburger', async ({ page }) => {
    await page.getByTestId('btn-mobile-menu').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  test('[TC-MOB-004] hiển thị backdrop khi thanh bên đang mở', async ({ page }) => {
    await page.getByTestId('btn-mobile-menu').click()
    await expect(page.getByTestId('sidebar-backdrop')).toBeVisible()
  })

  test('[TC-MOB-005] đóng thanh bên khi click vào backdrop', async ({ page }) => {
    await page.getByTestId('btn-mobile-menu').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
    await page.getByTestId('sidebar-backdrop').click()
    await expect(page.getByTestId('sidebar')).not.toBeVisible()
  })

  test('[TC-MOB-006] đóng thanh bên sau khi click vào mục điều hướng', async ({ page }) => {
    await page.getByTestId('btn-mobile-menu').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
    // Click a nav item — sidebar should close
    await page.getByText('Overview').first().click()
    await expect(page.getByTestId('sidebar')).not.toBeVisible()
  })

  test('[TC-MOB-007] hiển thị nội dung phần hero bên dưới nút hamburger', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toBeVisible()
    await expect(page.getByTestId('hero-heading')).toBeVisible()
  })

  test('[TC-MOB-008] hiển thị các nút CTA phần hero trên thiết bị di động', async ({ page }) => {
    await expect(page.getByTestId('btn-run-pipeline')).toBeVisible()
  })

  test('[TC-MOB-009] hiển thị thống kê phần hero trên thiết bị di động', async ({ page }) => {
    await expect(page.getByTestId('hero-stats')).toBeVisible()
  })

  test('[TC-MOB-010] hiển thị footer trên thiết bị di động', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByTestId('footer')).toBeVisible()
  })

  test('[TC-MOB-011] nội dung chính không bị che khuất bởi thanh bên trên thiết bị di động', async ({ page }) => {
    // Hero section must be visible without opening sidebar
    const heroSection = page.getByTestId('hero-section')
    await expect(heroSection).toBeVisible()
    // Check that hero section x position starts near 0 (not under sidebar)
    const box = await heroSection.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect(box.x).toBeLessThan(50)
    }
  })
})

// ─── Sidebar — Desktop still works after mobile changes ─────────────────────

test.describe('Thanh bên — Bố cục máy tính bàn', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('[TC-MOB-012] hiển thị thanh bên không có nút hamburger trên máy tính bàn', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible()
    await expect(page.getByTestId('btn-mobile-menu')).not.toBeVisible()
  })

  test('[TC-MOB-013] thanh bên chứa các mục điều hướng trên máy tính bàn', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar.getByRole('button', { name: 'Overview' })).toBeVisible()
    await expect(sidebar.getByRole('button', { name: 'Pipeline' })).toBeVisible()
  })
})

// ─── Dashboard home — mobile ─────────────────────────────────────────────────

test.describe('Trang chủ Dashboard — Bố cục di động', () => {
  test.use({ viewport: MOBILE })

  test('[TC-MOB-014] hiển thị trang dashboard trên thiết bị di động', async ({ page }) => {
    // Navigate to dashboard — if not authed will redirect to login, that's fine
    await page.goto('/dashboard')
    // Either dashboard or login page should render without blank screen
    const onLogin = page.url().includes('/login')
    if (onLogin) {
      await expect(page.getByTestId('login-page')).toBeVisible()
    } else {
      await expect(page.getByTestId('dashboard-page')).toBeVisible()
    }
  })

  test('[TC-MOB-015] trang đăng nhập phản hồi tốt trên thiết bị di động', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('input-username')).toBeVisible()
    await expect(page.getByTestId('input-password')).toBeVisible()
    await expect(page.getByTestId('btn-login')).toBeVisible()
  })

  test('[TC-MOB-016] các trường nhập liệu đăng nhập có chiều rộng tối đa trên thiết bị di động', async ({ page }) => {
    await page.goto('/login')
    const input = page.getByTestId('input-username')
    await expect(input).toBeVisible()
    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      // Should be close to full viewport width minus padding
      expect(box.width).toBeGreaterThan(300)
    }
  })
})

// ─── Dashboard projects — mobile ─────────────────────────────────────────────

test.describe('Dự án Dashboard — Bố cục di động', () => {
  test.use({ viewport: MOBILE })

  test('[TC-MOB-017] tiêu đề trang dự án không bị tràn trên thiết bị di động', async ({ page }) => {
    await page.goto('/dashboard/projects')
    const onLogin = page.url().includes('/login')
    if (onLogin) {
      // Expected if not authenticated in this project
      await expect(page.getByTestId('login-page')).toBeVisible()
      return
    }
    // If authenticated, check layout
    await expect(page.getByTestId('btn-new-project')).toBeVisible()
    const btn = page.getByTestId('btn-new-project')
    const btnBox = await btn.boundingBox()
    expect(btnBox).not.toBeNull()
    if (btnBox) {
      // Button should not overflow viewport
      expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(MOBILE.width + 2)
    }
  })
})
