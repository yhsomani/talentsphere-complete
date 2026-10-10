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
  // Persistence backend: 'pg' (real Postgres, the product default) or
  // 'memory' (explicit non-durable Maps, tests only). Unset resolves to
  // memory when NODE_ENV=test, pg otherwise — see apps/api/src/storage.
  STORAGE: z.enum(['pg', 'memory']).optional(),

  // Security & Rate Limiting
  // TOKEN_SECRET signs session tokens. It is optional so local development works
  // without it (the domain layer then generates a random per-process key, so tokens
  // are unforgeable but do not survive a restart). If provided it must be at least
  // 32 characters. Production deployments should always set it.
  TOKEN_SECRET: z.string().min(32).optional(),
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

  // Billing. No payment processor is integrated yet, so paid plans cannot be
  // bought: 'disabled' (default) refuses paid subscriptions honestly;
  // 'simulated' activates them WITHOUT payment for development and tests
  // only (refused in production by productionConfigProblems).
  BILLING_MODE: z.enum(['disabled', 'simulated']).default('disabled'),
  // HMAC-SHA256 secret for /api/v1/billing/webhook. Unset = the webhook is
  // not configured and refuses every call (it never accepts unsigned events).
  BILLING_WEBHOOK_SECRET: z.string().min(16).optional(),

  // AI Policy Invariants
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_FREE_USER_PAID_INFERENCE: z.coerce.boolean().default(false),
  AI_CLOUD_FALLBACK_ENABLED: z.coerce.boolean().default(false),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Settings that are optional for local development but mandatory in
 * production, where a missing value would silently weaken security:
 * - TOKEN_SECRET: without it every process invents its own signing key, so
 *   sessions die on each restart and two replicas reject each other's tokens.
 * - STORAGE=memory: would run production on non-durable state.
 * - default database credentials: the schema default is a local dev DSN.
 *
 * Enforced by the process entry point (apps/api/src/index.ts), which refuses
 * to start; buildApp() itself stays a composable factory for tests.
 */
export function productionConfigProblems(env: ServerEnv): string[] {
  if (env.NODE_ENV !== 'production') return [];
  const problems: string[] = [];
  if (!env.TOKEN_SECRET) {
    problems.push('TOKEN_SECRET is required in production (>= 32 random characters)');
  }
  if (env.STORAGE === 'memory') {
    problems.push('STORAGE=memory is not allowed in production (data would be lost on restart)');
  }
  if (/postgres:postgres@localhost/.test(env.DATABASE_URL)) {
    problems.push('DATABASE_URL still points at the local development default');
  }
  if (env.BILLING_MODE === 'simulated') {
    problems.push('BILLING_MODE=simulated activates paid plans without payment');
  }
  if (/localhost/.test(env.CORS_ALLOWED_ORIGINS)) {
    problems.push('CORS_ALLOWED_ORIGINS still allows localhost in production');
  }
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
