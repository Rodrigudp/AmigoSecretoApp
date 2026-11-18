import { defineConfig, devices } from "@playwright/test";

/**
 * Expo Web em modo live contra o Next local (APP-FE-03 / BUG-008).
 * O Metro encaminha /api/v1 para o Next na mesma origem; nada aponta para produção.
 */
export default defineConfig({
  testDir: "./tests/e2e-app",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "test-results-app",
  use: {
    baseURL: "http://localhost:8081",
    trace: "retain-on-failure",
    screenshot: "off",
  },
  projects: [
    {
      name: "Expo Web 360",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 800 } },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: "http://localhost:3000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run web -- --localhost --port 8081",
      cwd: "./mobile",
      url: "http://localhost:8081",
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        CI: "1",
        EXPO_NO_TELEMETRY: "1",
        EXPO_PUBLIC_MOBILE_API: "live",
        EXPO_PUBLIC_API_URL: "http://127.0.0.1:3000",
      },
    },
  ],
});
