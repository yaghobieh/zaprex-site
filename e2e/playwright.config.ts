import { defineConfig, devices } from "@playwright/test";

/**
 * Zaprex e2e (QA, Oct 27). Runs against ZAPREX_E2E_URL (default: the live site, https://zaprex.dev).
 * The app tests mock /api/me and /api/bot/* in the browser, so they never sign in, never call a model and never spend.
 * Set PW_CHROME=/path/to/chrome to use an installed Chrome instead of the Playwright download.
 */
export const BASE_URL = (process.env.ZAPREX_E2E_URL ?? "https://zaprex.dev").replace(/\/$/, "");
const executablePath = process.env.PW_CHROME;

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["json", { outputFile: "../test-results/e2e-results.json" }]],
  outputDir: "../test-results/e2e",
  use: { baseURL: BASE_URL, trace: "retain-on-failure", screenshot: "only-on-failure", launchOptions: executablePath ? { executablePath, args: ["--no-sandbox"] } : undefined },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, grepInvert: /@mobile-nav/ },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" }, grep: /@mobile(?!-)/ },
    // Phone menu and mobile fit (e2e/mobile-nav.spec.ts) on a real iPhone (WebKit) and an Android phone (Chromium).
    { name: "iphone-13", use: { ...devices["iPhone 13"] }, grep: /@mobile-nav/ },
    { name: "pixel-7", use: { ...devices["Pixel 7"] }, grep: /@mobile-nav/ },
  ],
});
