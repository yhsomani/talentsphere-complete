import { defineConfig, devices } from '@playwright/test';
import { TEST_TOKEN_SECRET } from './test-secrets.mjs';

// Throwaway: runs the e2e specs against the isolated stack on :4100 / :5199.
process.env.TOKEN_SECRET = TEST_TOKEN_SECRET;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5199' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
