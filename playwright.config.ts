import { defineConfig, devices } from '@playwright/test'
import path from 'path'

if (process.env.CI) {
  if (!process.env.DATABASE_URL)   console.error('❌ DATABASE_URL is required for Playwright tests in CI')
  if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET)
    console.error('❌ NEXTAUTH_SECRET (or AUTH_SECRET) is required for Playwright tests in CI')
}

const OWNER_FILE = path.join(__dirname, 'tests/e2e/.auth/owner.json')
const MEMBER_FILE = path.join(__dirname, 'tests/e2e/.auth/member.json')

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  workers: 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup — runs first, once, saves session state
    {
      name: 'setup-owner',
      testMatch: '**/setup/auth.setup.ts',
      testIgnore: [],
      grep: /authenticate as owner/,
    },
    {
      name: 'setup-member',
      testMatch: '**/setup/auth.setup.ts',
      testIgnore: [],
      grep: /authenticate as member/,
    },

    // Public portfolio — no auth needed
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '**/hero.spec.ts',
        '**/pipeline.spec.ts',
        '**/journey.spec.ts',
        '**/sanitizer.spec.ts',
        '**/footer.spec.ts',
        '**/history.spec.ts',
        '**/theme-lang.spec.ts',
      ],
    },

    // Auth tests — login/session guard (no storageState needed)
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/auth.spec.ts',
    },

    // Dashboard tests — require owner session
    {
      name: 'chromium-dashboard-owner',
      use: {
        ...devices['Desktop Chrome'],
        storageState: OWNER_FILE,
      },
      testMatch: [
        '**/dashboard.spec.ts',
        '**/projects.spec.ts',
        '**/project-runs.spec.ts',
      ],
      dependencies: ['setup-owner'],
    },

    // Member-scoped tests
    {
      name: 'chromium-dashboard-member',
      use: {
        ...devices['Desktop Chrome'],
        storageState: MEMBER_FILE,
      },
      testMatch: [
        '**/dashboard.spec.ts',
        '**/projects.spec.ts',
      ],
      dependencies: ['setup-member'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
