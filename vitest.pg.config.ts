import { defineConfig } from 'vitest/config';
import { TEST_TOKEN_SECRET } from './test-secrets.mjs';

// Real-PostgreSQL suite (ADR-015). Separate from the default suite because it
// needs a database server: `TEST_DATABASE_URL=... pnpm test:pg`. CI provides
// one as a service container, so a missing database fails CI rather than
// silently skipping the only tests that prove durability.
export default defineConfig({
  test: {
    env: { TOKEN_SECRET: TEST_TOKEN_SECRET, PASSWORD_PBKDF2_ITERATIONS: '10000' },
    include: ['tests/pg/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
