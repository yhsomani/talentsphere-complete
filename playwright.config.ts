import { defineConfig, devices } from '@playwright/test';
import { TEST_TOKEN_SECRET } from './test-secrets.mjs';

// The Playwright workers mint session tokens directly (see tests/e2e/*.spec.ts) and
// send them to the API server, which runs as a separate process. Both sides must sign
// with the same key, so it is pinned here for the workers and for the webServer below.
process.env.TOKEN_SECRET = TEST_TOKEN_SECRET;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node scripts/start-e2e-api.mjs',
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 20000,
      env: { TOKEN_SECRET: TEST_TOKEN_SECRET },
    },
    {
      command: 'pnpm --filter @talentsphere/web preview --port 4173 --host 127.0.0.1',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 20000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
