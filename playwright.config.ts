import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    ...devices['iPhone 13'],
    browserName: 'chromium',
    viewport: { width: 375, height: 812 }
  },
  // Reuses a running dev server (port 3000); starts one when none is up
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000
      }
})
