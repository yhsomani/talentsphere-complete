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

  // Security & Rate Limiting
  // TOKEN_SECRET signs session tokens. It is optional so local development works
  // without it (the domain layer then generates a random per-process key, so tokens
  // are unforgeable but do not survive a restart). If provided it must be at least
  // 32 characters. Production deployments should always set it.
  TOKEN_SECRET: z.string().min(32).optional(),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(10),

  // Storage
  SUPABASE_BUCKET_AVATARS: z.string().default('avatars'),
  SUPABASE_BUCKET_RESUMES: z.string().default('resumes'),
  SUPABASE_BUCKET_COURSE_CONTENT: z.string().default('course-content'),
  SUPABASE_BUCKET_PORTFOLIO: z.string().default('portfolio'),

  // AI Policy Invariants
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_FREE_USER_PAID_INFERENCE: z.coerce.boolean().default(false),
  AI_CLOUD_FALLBACK_ENABLED: z.coerce.boolean().default(false),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

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
