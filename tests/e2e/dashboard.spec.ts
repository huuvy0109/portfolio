import { test, expect } from '@playwright/test'
import path from 'path'

const OWNER_FILE = path.join(__dirname, '.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, '.auth/member.json')

test.describe('Dashboard - Header Section', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('[TC-DASH-001] Render dashboard page', async ({ page }) => {
    const dashboardPage = page.getByTestId('dashboard-page')
    await expect(dashboardPage).toBeVisible()
  })

  test('[TC-DASH-002] Header welcome section visible', async ({ page }) => {
    const welcome = page.getByTestId('dashboard-welcome')
    await expect(welcome).toBeVisible()
  })

  test('[TC-DASH-003] Header welcome message with username', async ({ page }) => {
    const welcome = page.getByTestId('dashboard-welcome')
    await expect(welcome).toContainText('Welcome back')
    await expect(welcome).toContainText('huuvy')
  })
})

test.describe('Dashboard - Stats Grid', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('[TC-DASH-004] Stats grid visible', async ({ page }) => {
    const stats = page.getByTestId('dashboard-stats')
    await expect(stats).toBeVisible()
  })

  test('[TC-DASH-005] Projects stat card', async ({ page }) => {
    const stats = page.getByTestId('dashboard-stats')
    await expect(stats).toContainText('Projects')
  })

  test('[TC-DASH-006] Total Runs stat card', async ({ page }) => {
    const stats = page.getByTestId('dashboard-stats')
    await expect(stats).toContainText('Total Runs')
  })

  test('[TC-DASH-007] Pass Rate stat card', async ({ page }) => {
    const stats = page.getByTestId('dashboard-stats')
    await expect(stats).toContainText('Pass Rate')
  })

  test('[TC-DASH-008] Active Users stat card', async ({ page }) => {
    const stats = page.getByTestId('dashboard-stats')
    await expect(stats).toContainText('Active Users')
  })
})

test.describe('Dashboard - Recent Activity', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('[TC-DASH-009] Recent Activity section visible when runs exist', async ({ page }) => {
    const body = page.locator('body')
    const hasActivity = await body.locator('text=Recent Activity').count()
    if (hasActivity > 0) {
      await expect(page.locator('text=Recent Activity')).toBeVisible()
    }
  })

  test('[TC-DASH-010] Sidebar Projects nav links to /dashboard/projects', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    const link = sidebar.getByTestId('nav-link-projects')
    await link.click()
    await expect(page).toHaveURL(/projects/)
  })

  test('[TC-DASH-011] Sidebar Users nav links to /dashboard/users', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    const link = sidebar.getByTestId('nav-link-users')
    await link.click()
    await expect(page).toHaveURL(/users/)
  })

  test('[TC-DASH-012] Dashboard page does not have quick action cards', async ({ page }) => {
    await expect(page.getByTestId('nav-projects')).not.toBeVisible()
    await expect(page.getByTestId('nav-users')).not.toBeVisible()
  })
})

test.describe('Dashboard - Sidebar Navigation Desktop', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('[TC-DASH-013] Sidebar visible desktop', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    await expect(sidebar).toBeVisible()
  })

  test('[TC-DASH-014] Overview nav link desktop', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    const link = sidebar.getByTestId('nav-link-overview')
    await expect(link).toBeVisible()
  })

  test('[TC-DASH-015] Projects nav link desktop', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    const link = sidebar.getByTestId('nav-link-projects')
    await expect(link).toBeVisible()
    await expect(link).toContainText('Projects')
  })

  test('[TC-DASH-016] Users nav link desktop', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar-nav')
    const link = sidebar.getByTestId('nav-link-users')
    await expect(link).toBeVisible()
    await expect(link).toContainText('Users')
  })
})

test.describe('Dashboard - Mobile Navigation', () => {
  test.use({ storageState: OWNER_FILE })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('[TC-DASH-017] Bottom tab bar visible mobile', async ({ page }) => {
    const link = page.getByTestId('nav-link-overview').nth(1)
    await expect(link).toBeVisible()
  })

  test('[TC-DASH-018] Mobile nav projects tab', async ({ page }) => {
    const link = page.getByTestId('nav-link-projects').nth(1)
    await expect(link).toBeVisible()
  })

  test('[TC-DASH-019] Mobile nav users tab', async ({ page }) => {
    const link = page.getByTestId('nav-link-users').nth(1)
    await expect(link).toBeVisible()
  })
})

test.describe('Dashboard - Member Access', () => {
  test.use({ storageState: MEMBER_FILE })

  test('[TC-DASH-020] Member access', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(page.getByTestId('dashboard-welcome')).toContainText('testmember')
  })
})

test.describe('Dashboard - Responsive Design', () => {
  test.use({ storageState: OWNER_FILE })

  test('[TC-DASH-021] Responsive tablet 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('[TC-DASH-022] Responsive mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })
})
