import { createHash } from 'node:crypto';
import { z } from 'zod';

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_NAME: z.string().default('TalentSphere'),
  APP_VERSION: z.string().default('0.1.0'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:4000'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Supabase
  SUPABASE_URL: z.string().url().default('https://localhost.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('dev-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('dev-service-role-key'),
  SUPABASE_JWKS_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/postgres'),
  DIRECT_URL: z.string().optional(),
  // Identifies the expected hosted Supabase tenant; no credentials live here.
  SUPABASE_PROJECT_REF: z.string().regex(/^[a-z0-9]{20}$/).optional(),
  // Persistence backend: 'pg' (real Postgres, the product default) or
  // 'memory' (explicit non-durable Maps, tests only). Unset resolves to
  // memory when NODE_ENV=test, pg otherwise — see apps/api/src/storage.
  STORAGE: z.enum(['pg', 'memory']).optional(),

  // Separate 256-bit key for AES-GCM encryption of user-supplied BYO API keys.
  // Rotation requires re-encryption of existing ciphertext; do not silently
  // reuse TOKEN_SECRET for this purpose.
  BYO_AI_KEY_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),

  // Security & Rate Limiting
  // TOKEN_SECRET signs session tokens. It is optional so local development works
  // without it (the domain layer then generates a random per-process key, so tokens
  // are unforgeable but do not survive a restart). If provided it must be at least
  // 32 characters. Production deployments should always set it.
  TOKEN_SECRET: z.string().min(32).optional(),
  // Password hashing work factor (PBKDF2-SHA512). Unset uses the domain default.
  // Deployed environments must not go below MIN_DEPLOYED_PBKDF2_ITERATIONS.
  PASSWORD_PBKDF2_ITERATIONS: z.coerce.number().int().min(1000).optional(),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  // Global limiter: requests per window per signed-in account (or per client
  // address for anonymous callers). The former default (100 per 15 minutes)
  // locked a normal user out after ~20 page views — one dashboard load makes
  // five API calls — and behind a load balancer every user shared one bucket.
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(10),
  // Client address behind a reverse proxy / load balancer. Unset: the socket
  // address is the client (direct exposure). Set to the number of trusted
  // proxy hops (e.g. "1"), "true" to trust every X-Forwarded-For hop, or a
  // comma-separated list of proxy IPs/CIDRs. Without it, rate limits behind a
  // proxy key everyone to the proxy's address.
  TRUST_PROXY: z.string().optional(),

  // Storage
  SUPABASE_BUCKET_AVATARS: z.string().default('avatars'),
  SUPABASE_BUCKET_RESUMES: z.string().default('resumes'),
  SUPABASE_BUCKET_COURSE_CONTENT: z.string().default('course-content'),
  SUPABASE_BUCKET_PORTFOLIO: z.string().default('portfolio'),

  // Optional, server-only transactional email. 'none' fails closed in deployed
  // environments. Brevo is the only provider; it still needs a verified sender
  // domain (SPF/DKIM/DMARC at the DNS host) and a real mailbox test outside CI.
  EMAIL_PROVIDER: z.enum(['none', 'brevo']).default('none'),
  BREVO_API_KEY: z.string().min(12).optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().min(1).optional(),
  EMAIL_REPLY_TO: z.string().email().optional(),

  // Billing. 'disabled' (default) refuses paid subscriptions honestly;
  // 'simulated' activates them WITHOUT payment for development and tests only
  // (refused in production by productionConfigProblems); 'stripe' sells them
  // through Stripe Checkout and mirrors Stripe's subscription state (needs the
  // STRIPE_* settings below; stripeConfigProblems refuses a half-configured one).
  BILLING_MODE: z.enum(['disabled', 'simulated', 'stripe']).default('disabled'),
  // HMAC-SHA256 secret for /api/v1/billing/webhook. Unset = the webhook is
  // not configured and refuses every call (it never accepts unsigned events).
  BILLING_WEBHOOK_SECRET: z.string().min(16).optional(),
  // Stripe (server-only; never sent to the browser). Secret or restricted key,
  // and the signing secret of this API's /api/v1/billing/stripe-webhook endpoint.
  STRIPE_SECRET_KEY: z
    .string()
    .regex(/^(sk|rk)_(test|live)_[A-Za-z0-9]{16,}$/, 'must be a Stripe secret or restricted key')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .regex(/^whsec_[A-Za-z0-9]{16,}$/, 'must be a Stripe webhook signing secret (whsec_…)')
    .optional(),
  // Stripe Price ids for each paid plan and cycle (server-side catalog: the
  // client never supplies a price or an amount).
  STRIPE_PRICE_CANDIDATE_PRO_MONTHLY: z.string().regex(/^price_\w+$/).optional(),
  STRIPE_PRICE_CANDIDATE_PRO_YEARLY: z.string().regex(/^price_\w+$/).optional(),
  STRIPE_PRICE_RECRUITER_STARTER_MONTHLY: z.string().regex(/^price_\w+$/).optional(),
  STRIPE_PRICE_RECRUITER_STARTER_YEARLY: z.string().regex(/^price_\w+$/).optional(),
  STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY: z.string().regex(/^price_\w+$/).optional(),
  STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY: z.string().regex(/^price_\w+$/).optional(),

  // AI Policy Invariants
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_FREE_USER_PAID_INFERENCE: z.coerce.boolean().default(false),
  AI_CLOUD_FALLBACK_ENABLED: z.coerce.boolean().default(false),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Staging and production are deployed: reachable by people other than the
 * developer, so they get the same hardening (configuration refusals below,
 * Content-Security-Policy, internal error messages hidden from clients).
 */
export function isDeployed(env: Pick<ServerEnv, 'NODE_ENV'>): boolean {
  return env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';
}

/**
 * Settings that are optional for local development but mandatory once
 * deployed, where a missing value would silently weaken security:
 * - TOKEN_SECRET: without it every process invents its own signing key, so
 *   sessions die on each restart and two replicas reject each other's tokens.
 * - STORAGE=memory: would run on non-durable state.
 * - default database credentials: the schema default is a local dev DSN.
 * - the test secrets published in this repository (TOKEN_SECRET,
 *   BILLING_WEBHOOK_SECRET).
 * Production only (staging may need them for demos and testing):
 * - BILLING_MODE=simulated, and a localhost CORS origin.
 *
 * Enforced by the process entry point (apps/api/src/index.ts), which refuses
 * to start; buildApp() itself stays a composable factory for tests.
 */
/**
 * SHA-256 of the secrets published in this repository for tests
 * (test-secrets.mjs). Anyone can read them, so a deployment using one is as
 * good as unsigned: with the token secret, anyone can mint a platform-admin
 * session. Only the hashes live here; tests/unit/production-config.test.ts checks they
 * still match the file.
 */
export const PUBLISHED_TEST_SECRET_SHA256: ReadonlySet<string> = new Set([
  'd0df1b94a32a90941b5a75ce05c8e84b8f8c34e1064fc6431df64ed52ff430c3', // TEST_TOKEN_SECRET
  'd042feab86b525c2db643c6e507e006cce35a51533fddb1801fe2b4391d34f62', // TEST_WEBHOOK_SECRET
]);

/** OWASP 2023 minimum for PBKDF2-HMAC-SHA512. Must equal the domain default
 * (packages/domain/src/auth.ts PBKDF2_DEFAULT_ITERATIONS); tests/unit/production-config.test.ts checks that. */
export const MIN_DEPLOYED_PBKDF2_ITERATIONS = 210_000;

const isPublishedTestSecret = (value: string | undefined) =>
  !!value && PUBLISHED_TEST_SECRET_SHA256.has(createHash('sha256').update(value).digest('hex'));

/**
 * Settings BILLING_MODE=stripe cannot work without. Checked at boot in every
 * environment: selling plans with a missing key or webhook secret would either
 * fail at the first purchase or, worse, accept unverifiable events.
 */
export function stripeConfigProblems(env: ServerEnv): string[] {
  if (env.BILLING_MODE !== 'stripe') return [];
  const problems: string[] = [];
  if (!env.STRIPE_SECRET_KEY) problems.push('BILLING_MODE=stripe requires STRIPE_SECRET_KEY');
  if (!env.STRIPE_WEBHOOK_SECRET) {
    problems.push('BILLING_MODE=stripe requires STRIPE_WEBHOOK_SECRET');
  }
  const prices = [
    env.STRIPE_PRICE_CANDIDATE_PRO_MONTHLY,
    env.STRIPE_PRICE_CANDIDATE_PRO_YEARLY,
    env.STRIPE_PRICE_RECRUITER_STARTER_MONTHLY,
    env.STRIPE_PRICE_RECRUITER_STARTER_YEARLY,
    env.STRIPE_PRICE_RECRUITER_ENTERPRISE_MONTHLY,
    env.STRIPE_PRICE_RECRUITER_ENTERPRISE_YEARLY,
  ].filter(Boolean) as string[];
  if (prices.length === 0) {
    problems.push('BILLING_MODE=stripe requires at least one STRIPE_PRICE_* id');
  }
  if (new Set(prices).size !== prices.length) {
    problems.push('STRIPE_PRICE_* ids must be distinct: one price cannot grant two plans');
  }
  return problems;
}

/** True when deployed email delivery is fully configured. The single gate the API routes use. */
export function emailDeliveryConfigured(env: ServerEnv): boolean {
  return (
    env.EMAIL_PROVIDER === 'brevo' &&
    !!env.BREVO_API_KEY &&
    !!env.EMAIL_FROM &&
    env.APP_URL.startsWith('https://')
  );
}

export function productionConfigProblems(env: ServerEnv): string[] {
  if (!isDeployed(env)) return [];
  const where = env.NODE_ENV;
  const problems: string[] = [];
  if (!env.TOKEN_SECRET) {
    problems.push(`TOKEN_SECRET is required in ${where} (>= 32 random characters)`);
  } else if (isPublishedTestSecret(env.TOKEN_SECRET)) {
    problems.push(
      `TOKEN_SECRET is the test secret published in this repository; generate a new one for ${where}`
    );
  }
  if (isPublishedTestSecret(env.BILLING_WEBHOOK_SECRET)) {
    problems.push(
      `BILLING_WEBHOOK_SECRET is the test secret published in this repository; generate a new one for ${where}`
    );
  }
  if (env.STORAGE === 'memory') {
    problems.push(`STORAGE=memory is not allowed in ${where} (data would be lost on restart)`);
  }
  if (
    env.PASSWORD_PBKDF2_ITERATIONS !== undefined &&
    env.PASSWORD_PBKDF2_ITERATIONS < MIN_DEPLOYED_PBKDF2_ITERATIONS
  ) {
    problems.push(
      `PASSWORD_PBKDF2_ITERATIONS=${env.PASSWORD_PBKDF2_ITERATIONS} is below ${MIN_DEPLOYED_PBKDF2_ITERATIONS} in ${where}; weak password hashes`
    );
  }
  if (/postgres:postgres@localhost/.test(env.DATABASE_URL)) {
    problems.push('DATABASE_URL still points at the local development default');
  }
  if (env.SUPABASE_PROJECT_REF) {
    // Supabase direct connections have the project ref in the host; session/
    // transaction poolers use postgres.<ref> in their database username.
    // Refuse a wrong database rather than writing TalentSphere data elsewhere.
    try {
      const url = new URL(env.DATABASE_URL);
      const hostname = url.hostname.toLowerCase();
      const username = decodeURIComponent(url.username).toLowerCase();
      const ref = env.SUPABASE_PROJECT_REF;
      const isExpected =
        hostname === `db.${ref}.supabase.co` ||
        ((hostname.endsWith('.pooler.supabase.com') ||
          hostname.endsWith('.pooler.supabase.co')) &&
          username === `postgres.${ref}`);
      if (!isExpected) {
        problems.push('DATABASE_URL does not match SUPABASE_PROJECT_REF');
      }
      if (url.searchParams.get('sslmode') !== 'verify-full') {
        problems.push('Hosted Supabase DATABASE_URL must set sslmode=verify-full');
      }
    } catch {
      problems.push('Hosted Supabase DATABASE_URL is not a valid URL');
    }
  }
  if (env.EMAIL_PROVIDER === 'brevo') {
    if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
      problems.push('EMAIL_PROVIDER=brevo requires BREVO_API_KEY and EMAIL_FROM');
    }
    if (!env.APP_URL.startsWith('https://')) {
      problems.push('Email reference links require an HTTPS APP_URL in deployed environments');
    }
  }
  if (env.BILLING_MODE === 'stripe') {
    if (!env.APP_URL.startsWith('https://')) {
      problems.push('Stripe Checkout return links require an HTTPS APP_URL in deployed environments');
    }
  }
  if (env.NODE_ENV === 'production') {
    if (env.BILLING_MODE === 'stripe' && /^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY ?? '')) {
      problems.push('STRIPE_SECRET_KEY is a test-mode key: production would take no real payments');
    }
    if (env.BILLING_MODE === 'simulated') {
      problems.push('BILLING_MODE=simulated activates paid plans without payment');
    }
    if (/localhost/.test(env.CORS_ALLOWED_ORIGINS)) {
      problems.push('CORS_ALLOWED_ORIGINS still allows localhost in production');
    }
  }
  problems.push(...stripeConfigProblems(env));
  return problems;
}

export function validateServerEnv(
  env: Record<string, string | undefined> = process.env
): ServerEnv {
  const result = ServerEnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid server environment configuration: ${issues}`);
  }
  return result.data;
}
