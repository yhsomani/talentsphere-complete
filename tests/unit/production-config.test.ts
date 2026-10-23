import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import {
  MIN_DEPLOYED_PBKDF2_ITERATIONS,
  PUBLISHED_TEST_SECRET_SHA256,
  productionConfigProblems,
  stripeConfigProblems,
  validateServerEnv,
} from '../../packages/config/src/env.js';
import { PBKDF2_DEFAULT_ITERATIONS } from '../../packages/domain/src/auth.js';
import { TEST_TOKEN_SECRET, TEST_WEBHOOK_SECRET } from '../../test-secrets.mjs';

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

  it('only accepts the configured Mumbai Supabase project with verified TLS', () => {
    const ref = 'qidckctwrkxyiwworchd';
    const base = { ...SAFE_PRODUCTION, SUPABASE_PROJECT_REF: ref };
    const direct = `postgresql://postgres:secret@db.${ref}.supabase.co:5432/postgres?sslmode=verify-full`;
    expect(productionConfigProblems(validateServerEnv({ ...base, DATABASE_URL: direct }))).toEqual([]);
    expect(
      productionConfigProblems(
        validateServerEnv({
          ...base,
          DATABASE_URL: `postgresql://postgres.${ref}:secret@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=verify-full`,
        })
      )
    ).toEqual([]);
    expect(
      productionConfigProblems(
        validateServerEnv({ ...base, DATABASE_URL: direct.replace('verify-full', 'require') })
      ).join(' | ')
    ).toMatch(/sslmode=verify-full/);
    expect(
      productionConfigProblems(
        validateServerEnv({
          ...base,
          DATABASE_URL: direct.replace(ref, 'abcdefghijklmnopqrst'),
        })
      ).join(' | ')
    ).toMatch(/does not match SUPABASE_PROJECT_REF/);
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

  it('refuses PBKDF2 work factors below the OWASP floor in deployed environments (audit F-04)', () => {
    const weak = validateServerEnv({ ...SAFE_PRODUCTION, PASSWORD_PBKDF2_ITERATIONS: '1000' });
    expect(productionConfigProblems(weak).join('\n')).toContain('PASSWORD_PBKDF2_ITERATIONS=1000');
    const staging = validateServerEnv({
      ...SAFE_PRODUCTION,
      NODE_ENV: 'staging',
      PASSWORD_PBKDF2_ITERATIONS: '209999',
    });
    expect(productionConfigProblems(staging).length).toBeGreaterThan(0);
    const floor = validateServerEnv({
      ...SAFE_PRODUCTION,
      PASSWORD_PBKDF2_ITERATIONS: String(MIN_DEPLOYED_PBKDF2_ITERATIONS),
    });
    expect(productionConfigProblems(floor)).toEqual([]);
    // Unset uses the domain default, which is itself above the floor.
    expect(productionConfigProblems(validateServerEnv(SAFE_PRODUCTION))).toEqual([]);
  });

  it('keeps the deployed PBKDF2 floor equal to the domain default (audit F-04)', () => {
    expect(MIN_DEPLOYED_PBKDF2_ITERATIONS).toBe(PBKDF2_DEFAULT_ITERATIONS);
  });

  it('refuses the test secrets published in this repository', () => {
    // Anyone can read test-secrets.mjs: with its token secret anyone could
    // mint a platform-admin session on a deployment that reused it.
    for (const NODE_ENV of ['production', 'staging']) {
      const problems = productionConfigProblems(
        validateServerEnv({
          ...SAFE_PRODUCTION,
          NODE_ENV,
          TOKEN_SECRET: TEST_TOKEN_SECRET,
          BILLING_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
        })
      ).join(' | ');
      expect(problems).toMatch(/TOKEN_SECRET is the test secret published/);
      expect(problems).toMatch(/BILLING_WEBHOOK_SECRET is the test secret published/);
    }
    // A real secret passes.
    expect(
      productionConfigProblems(
        validateServerEnv({ ...SAFE_PRODUCTION, BILLING_WEBHOOK_SECRET: 'w'.repeat(32) })
      )
    ).toEqual([]);
  });

  it('keeps the published-secret hashes in step with test-secrets.mjs', () => {
    const sha = (v: string) => createHash('sha256').update(v).digest('hex');
    expect(PUBLISHED_TEST_SECRET_SHA256.has(sha(TEST_TOKEN_SECRET))).toBe(true);
    expect(PUBLISHED_TEST_SECRET_SHA256.has(sha(TEST_WEBHOOK_SECRET))).toBe(true);
  });
});

describe('Stripe billing configuration', () => {
  const STRIPE = {
    BILLING_MODE: 'stripe',
    STRIPE_SECRET_KEY: `sk_test_${'a'.repeat(24)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_${'b'.repeat(32)}`,
    STRIPE_PRICE_CANDIDATE_PRO_MONTHLY: 'price_pro_m',
  };
  const problems = (over: Record<string, unknown> = {}) =>
    stripeConfigProblems(validateServerEnv({ ...STRIPE, ...over }));

  it('accepts a complete configuration and ignores other billing modes', () => {
    expect(problems()).toEqual([]);
    expect(stripeConfigProblems(validateServerEnv({ BILLING_MODE: 'disabled' }))).toEqual([]);
  });

  it('refuses a half-configured Stripe mode', () => {
    expect(problems({ STRIPE_SECRET_KEY: undefined }).join()).toContain('STRIPE_SECRET_KEY');
    expect(problems({ STRIPE_WEBHOOK_SECRET: undefined }).join()).toContain('STRIPE_WEBHOOK_SECRET');
    expect(problems({ STRIPE_PRICE_CANDIDATE_PRO_MONTHLY: undefined }).join()).toContain(
      'STRIPE_PRICE_'
    );
  });

  it('refuses one price id that would grant two plans', () => {
    expect(problems({ STRIPE_PRICE_CANDIDATE_PRO_YEARLY: 'price_pro_m' }).join()).toContain('distinct');
  });

  it('rejects malformed keys at parse time', () => {
    expect(() => validateServerEnv({ ...STRIPE, STRIPE_SECRET_KEY: 'not-a-key' })).toThrow();
    expect(() => validateServerEnv({ ...STRIPE, STRIPE_WEBHOOK_SECRET: 'nope' })).toThrow();
  });

  it('refuses test-mode keys and an insecure return URL in production', () => {
    const prod = (over: Record<string, unknown> = {}) =>
      productionConfigProblems(
        validateServerEnv({ ...SAFE_PRODUCTION, ...STRIPE, APP_URL: 'https://app.talentsphere.example', ...over })
      );
    expect(prod().join()).toContain('test-mode');
    expect(
      prod({ STRIPE_SECRET_KEY: `sk_live_${'a'.repeat(24)}` })
    ).toEqual([]);
    expect(
      prod({ STRIPE_SECRET_KEY: `sk_live_${'a'.repeat(24)}`, APP_URL: 'http://app.example' }).join()
    ).toContain('HTTPS');
  });
});
