// @ts-check
import { defineConfig } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // workers: 3,
  timeout: 45_000,
  expect: {
    timeout: 25_000
  },
  // ignoreSnapshots: !process.env.CI,
  testDir: './tests',
  // globalSetup: './projects/global-setup',
  testMatch: ['*.spec.js'],
  fullyParallel: true,
  reportSlowTests: null,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  reporter: [['list', { printSteps: true, open: 'never' }]],
  use: {
    bypassCSP: true,
    retries: 1,
    viewport: null,
    launchOptions: { args: ['--start-maximized', '--ignore-certificate-errors', '--disable-search-engine-choice-screen'] },
    baseURL: 'https://www.playwright.dev',
    testIdAttribute: 'data-qa',
    headless: true,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    ignoreHTTPSErrors: true,
    javaScriptEnabled: true,
    locale: 'en-US'
  },
  projects: [
    {
      name: 'Performance_tests',
      testMatch: /.*.spec.ts/,
      use: {
        channel: 'chrome'
      }
    }
  ]
})
