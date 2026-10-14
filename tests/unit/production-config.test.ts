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

  it('never applies in development or test', () => {
    expect(productionConfigProblems(validateServerEnv({ NODE_ENV: 'development' }))).toEqual([]);
    expect(productionConfigProblems(validateServerEnv({ NODE_ENV: 'test' }))).toEqual([]);
  });

  it('holds staging to the same signing key, storage and database rules', () => {
    // External audit TS-004: staging used to start with a per-process random
    // signing key and in-memory storage.
    const problems = productionConfigProblems(validateServerEnv({ NODE_ENV: 'staging' }));
    expect(problems.join(' | ')).toMatch(/TOKEN_SECRET is required in staging/);
    expect(problems.join(' | ')).toMatch(/DATABASE_URL/);
    expect(
      productionConfigProblems(
        validateServerEnv({ ...SAFE_PRODUCTION, NODE_ENV: 'staging', STORAGE: 'memory' })
      ).join(' | ')
    ).toMatch(/STORAGE=memory is not allowed in staging/);
    // Demos on staging may simulate billing and call it from a local frontend.
    expect(
      productionConfigProblems(
        validateServerEnv({
          ...SAFE_PRODUCTION,
          NODE_ENV: 'staging',
          BILLING_MODE: 'simulated',
          CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
        })
      )
    ).toEqual([]);
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
