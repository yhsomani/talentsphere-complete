/**
 * Configuration validation and management for Talentsphere
 * 
 * Provides:
 * - Type-safe configuration loading
 * - Validation at startup (fail fast)
 * - Separation of required vs optional config
 * - Graceful degradation for optional features
 */

import { AppErrors } from '../errors/index';

/**
 * Environment name types
 */
export type EnvironmentName = 'development' | 'staging' | 'production' | 'test';

/**
 * Configuration schema definition
 */
export interface ConfigSchema {
  // Required configuration
  required: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    environment: EnvironmentName;
    appBaseUrl: string;
  };

  // Optional configuration with defaults
  optional: {
    supabaseServiceKey?: string;
    stripePublicKey?: string;
    stripeWebhookSecret?: string;
    resendApiKey?: string;
    githubClientId?: string;
    githubClientSecret?: string;
    googleClientId?: string;
    googleClientSecret?: string;
    sentryDsn?: string;
    posthogApiKey?: string;
    featureFlagsEnabled?: boolean;
    maintenanceMode?: boolean;
    maxUploadSizeMB?: number;
    sessionTimeoutMinutes?: number;
    rateLimitPerMinute?: number;
  };
}

/**
 * Default values for optional configuration
 */
const DEFAULT_OPTIONAL_CONFIG: ConfigSchema['optional'] = {
  featureFlagsEnabled: false,
  maintenanceMode: false,
  maxUploadSizeMB: 10,
  sessionTimeoutMinutes: 30,
  rateLimitPerMinute: 100,
};

/**
 * Validate that a value is not empty
 */
function validateRequired(value: string | undefined, key: string): string {
  if (!value || value.trim() === '') {
    throw AppErrors.configuration(
      `Missing required configuration: ${key}`,
      { key, provided: value ?? 'undefined' },
    );
  }
  return value.trim();
}

/**
 * Validate environment name
 */
function validateEnvironment(value: string): EnvironmentName {
  const validEnvironments: EnvironmentName[] = [
    'development',
    'staging',
    'production',
    'test',
  ];

  const env = value.toLowerCase() as EnvironmentName;
  
  if (!validEnvironments.includes(env)) {
    throw AppErrors.configuration(
      `Invalid environment: ${value}. Must be one of: ${validEnvironments.join(', ')}`,
      { provided: value, valid: validEnvironments },
    );
  }

  return env;
}

/**
 * Validate URL format
 */
function validateUrl(value: string, key: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw AppErrors.configuration(
      `Invalid URL format for ${key}: ${value}`,
      { key, provided: value },
    );
  }
}

/**
 * Parse integer from string with validation
 */
function parseInteger(value: string | undefined, defaultValue: number, key: string): number {
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw AppErrors.configuration(
      `Invalid positive integer for ${key}: ${value}`,
      { key, provided: value },
    );
  }
  return parsed;
}

/**
 * Parse boolean from string
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Load and validate configuration from environment variables
 * 
 * This function should be called once at application startup.
 * It will throw immediately if required configuration is missing,
 * implementing the "fail fast" principle.
 */
export function loadConfig(): ConfigSchema {
  const isBrowser = typeof window !== 'undefined';
  
  // Helper to get env var (works in both Node and browser)
  const getEnv = (key: string): string | undefined => {
    if (isBrowser) {
      // In browser, look for Next.js public env vars
      return (window as any)[`__ENV_${key}`] || process.env[`NEXT_PUBLIC_${key}`];
    }
    return process.env[key];
  };

  // Validate required configuration
  const supabaseUrl = validateRequired(
    getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL'),
    'SUPABASE_URL',
  );
  
  const supabaseAnonKey = validateRequired(
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY'),
    'SUPABASE_ANON_KEY',
  );
  
  const environment = validateEnvironment(
    validateRequired(
      getEnv('NEXT_PUBLIC_ENVIRONMENT') || getEnv('NODE_ENV') || 'development',
      'NODE_ENV',
    ),
  );
  
  const appBaseUrl = validateUrl(
    validateRequired(
      getEnv('NEXT_PUBLIC_APP_URL') || getEnv('APP_URL') || 'http://localhost:3000',
      'APP_URL',
    ),
    'APP_URL',
  );

  // Load optional configuration with defaults
  const optional: ConfigSchema['optional'] = {
    supabaseServiceKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    stripePublicKey: getEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY') || getEnv('STRIPE_PUBLIC_KEY'),
    stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
    resendApiKey: getEnv('RESEND_API_KEY'),
    githubClientId: getEnv('GITHUB_CLIENT_ID'),
    githubClientSecret: getEnv('GITHUB_CLIENT_SECRET'),
    googleClientId: getEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    sentryDsn: getEnv('NEXT_PUBLIC_SENTRY_DSN') || getEnv('SENTRY_DSN'),
    posthogApiKey: getEnv('NEXT_PUBLIC_POSTHOG_KEY') || getEnv('POSTHOG_KEY'),
    featureFlagsEnabled: parseBoolean(
      getEnv('FEATURE_FLAGS_ENABLED'),
      DEFAULT_OPTIONAL_CONFIG.featureFlagsEnabled!,
    ),
    maintenanceMode: parseBoolean(
      getEnv('MAINTENANCE_MODE'),
      DEFAULT_OPTIONAL_CONFIG.maintenanceMode!,
    ),
    maxUploadSizeMB: parseInteger(
      getEnv('MAX_UPLOAD_SIZE_MB'),
      DEFAULT_OPTIONAL_CONFIG.maxUploadSizeMB!,
      'MAX_UPLOAD_SIZE_MB',
    ),
    sessionTimeoutMinutes: parseInteger(
      getEnv('SESSION_TIMEOUT_MINUTES'),
      DEFAULT_OPTIONAL_CONFIG.sessionTimeoutMinutes!,
      'SESSION_TIMEOUT_MINUTES',
    ),
    rateLimitPerMinute: parseInteger(
      getEnv('RATE_LIMIT_PER_MINUTE'),
      DEFAULT_OPTIONAL_CONFIG.rateLimitPerMinute!,
      'RATE_LIMIT_PER_MINUTE',
    ),
  };

  return {
    required: {
      supabaseUrl,
      supabaseAnonKey,
      environment,
      appBaseUrl,
    },
    optional,
  };
}

/**
 * Check if a feature is enabled based on configuration
 */
export function isFeatureEnabled(feature: keyof ConfigSchema['optional']): boolean {
  const config = getConfig();
  
  // Features that require specific config to be present
  const featuresRequiringConfig: (keyof ConfigSchema['optional'])[] = [
    'stripePublicKey',
    'resendApiKey',
    'githubClientId',
    'googleClientId',
    'sentryDsn',
    'posthogApiKey',
  ];

  if (featuresRequiringConfig.includes(feature)) {
    return !!config.optional[feature];
  }

  // Boolean feature flags
  if (feature === 'featureFlagsEnabled' || feature === 'maintenanceMode') {
    return !!config.optional[feature];
  }

  return false;
}

/**
 * Get configuration value safely
 * Returns undefined for optional features that are not configured
 */
export function getConfigValue<T extends keyof ConfigSchema['optional']>(
  key: T,
): ConfigSchema['optional'][T] {
  return getConfig().optional[key];
}

/**
 * Singleton instance - configuration is loaded once
 */
let _config: ConfigSchema | null = null;

/**
 * Get configuration instance
 * Loads configuration on first call if not already loaded
 */
export function getConfig(): ConfigSchema {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  _config = null;
}

/**
 * Check if application is in production environment
 */
export function isProduction(): boolean {
  return getConfig().required.environment === 'production';
}

/**
 * Check if application is in development environment
 */
export function isDevelopment(): boolean {
  return getConfig().required.environment === 'development';
}

/**
 * Check if application is in test environment
 */
export function isTest(): boolean {
  return getConfig().required.environment === 'test';
}

/**
 * Check if application is in maintenance mode
 */
export function isMaintenanceMode(): boolean {
  return getConfig().optional.maintenanceMode === true;
}

/**
 * Get feature availability status for all optional features
 */
export function getFeatureStatus(): Record<string, boolean> {
  const config = getConfig();
  
  return {
    payments: !!config.optional.stripePublicKey,
    emailNotifications: !!config.optional.resendApiKey,
    githubAuth: !!config.optional.githubClientId,
    googleAuth: !!config.optional.googleClientId,
    errorTracking: !!config.optional.sentryDsn,
    analytics: !!config.optional.posthogApiKey,
    featureFlags: config.optional.featureFlagsEnabled === true,
    maintenanceMode: config.optional.maintenanceMode === true,
  };
}

/**
 * Validate that all required features for a specific operation are available
 */
export function assertFeatureRequired(
  feature: string,
  configKey: keyof ConfigSchema['optional'],
): void {
  if (!isFeatureEnabled(configKey)) {
    throw AppErrors.serviceUnavailable(
      feature,
      `${feature} is not configured. Missing environment variable.`,
      { configKey },
    );
  }
}
