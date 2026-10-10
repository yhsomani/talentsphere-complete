import { describe, expect, it } from 'vitest';
import { productionConfigProblems, validateServerEnv } from '../../packages/config/src/env.js';

const SAFE_PRODUCTION = {
  NODE_ENV: 'production',
  TOKEN_SECRET: 'k'.repeat(48),
  DATABASE_URL: 'postgresql://app:s3cret@db.internal:5432/talentsphere',
  CORS_ALLOWED_ORIGINS: 'https://app.talentsphere.example',
  STORAGE: 'pg',
};

describe('Production configuration guard (apps/api/src/index.ts refuses to start)', () => {
  it('accepts a complete production configuration', () => {
    expect(productionConfigProblems(validateServerEnv(SAFE_PRODUCTION))).toEqual([]);
  });

  it('never applies outside production', () => {
    expect(productionConfigProblems(validateServerEnv({ NODE_ENV: 'development' }))).toEqual([]);
  });

  it.each([
    ['TOKEN_SECRET', { TOKEN_SECRET: undefined }, /TOKEN_SECRET/],
    ['STORAGE=memory', { STORAGE: 'memory' }, /STORAGE=memory/],
    [
      'default database DSN',
      { DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres' },
      /DATABASE_URL/,
    ],
    ['localhost CORS origin', { CORS_ALLOWED_ORIGINS: 'http://localhost:5173' }, /CORS/],
  ])('flags a missing or unsafe %s', (_label, override, pattern) => {
    const problems = productionConfigProblems(
      validateServerEnv({ ...SAFE_PRODUCTION, ...override } as Record<string, string | undefined>)
    );
    expect(problems.join(' | ')).toMatch(pattern);
  });
});
