import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
