import { EmailError } from './types.js';

/** Providers this build ships an adapter for. 'none' = no delivery configured. */
export const SUPPORTED_EMAIL_PROVIDERS = ['none', 'brevo'] as const;
export type EmailProviderName = (typeof SUPPORTED_EMAIL_PROVIDERS)[number];

/**
 * The worker's single reader of email-related environment variables. Secrets
 * are read here and nowhere else in the worker. (The API validates the same
 * names through @talentsphere/config; the worker cannot import that package
 * until its package.json/tsconfig reference it, which are protected files.)
 */
export interface EmailConfig {
  provider: EmailProviderName;
  appUrl: string;
  from?: string;
  fromName: string;
  replyTo?: string;
  brevo: { apiKey?: string; baseUrl: string };
  timeoutMs: number;
}

const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadEmailConfig(env: Record<string, string | undefined>): EmailConfig {
  const requested = (env.EMAIL_PROVIDER ?? 'none').trim().toLowerCase();
  if (!(SUPPORTED_EMAIL_PROVIDERS as readonly string[]).includes(requested)) {
    // Never fall back to another provider (or to none) for an unrecognised value.
    throw new EmailError(
      'configuration',
      `Unsupported EMAIL_PROVIDER "${requested}". Supported: ${SUPPORTED_EMAIL_PROVIDERS.join(', ')}.`
    );
  }
  return {
    provider: requested as EmailProviderName,
    appUrl: (env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
    from: env.EMAIL_FROM?.trim() || undefined,
    fromName: env.EMAIL_FROM_NAME?.trim() || 'TalentSphere',
    replyTo: env.EMAIL_REPLY_TO?.trim() || undefined,
    brevo: {
      apiKey: env.BREVO_API_KEY?.trim() || undefined,
      baseUrl: 'https://api.brevo.com/v3',
    },
    timeoutMs: 20_000,
  };
}

/** Returns human-readable problems; empty means the selected provider is usable. */
export function emailConfigProblems(config: EmailConfig): string[] {
  if (config.provider === 'none') return [];
  const problems: string[] = [];
  if (!config.from || !ADDRESS.test(config.from)) {
    problems.push('EMAIL_FROM must be a valid, provider-verified sender address');
  }
  if (config.replyTo && !ADDRESS.test(config.replyTo)) {
    problems.push('EMAIL_REPLY_TO must be a valid address');
  }
  if (config.provider === 'brevo' && !config.brevo.apiKey) {
    problems.push('EMAIL_PROVIDER=brevo requires BREVO_API_KEY');
  }
  return problems;
}
