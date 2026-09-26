import { defineConfig } from 'vitest/config';
import { TEST_TOKEN_SECRET } from './test-secrets.mjs';

export default defineConfig({
  test: {
    // Tests import the domain package from source (../../packages/domain/src) while
    // the API imports the built package, so two copies of auth.ts are loaded in the
    // same process. Both read TOKEN_SECRET, so pinning it keeps them in agreement.
    env: {
      TOKEN_SECRET: TEST_TOKEN_SECRET,
    },
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/security/**/*.test.ts',
      'tests/accessibility/**/*.test.ts',
      'tests/performance/**/*.test.ts',
    ],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', '.turbo/**'],
  },
});
