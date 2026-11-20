import { DomainError } from './core.js';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  anonymousId?: string;
  eventType: string;
  metadata: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
  isAnonymized?: boolean;
  timestamp: string;
}

export interface RecordAnalyticsEventParams {
  userId?: string;
  anonymousId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
  telemetryConsent?: boolean; // UserSettings.telemetryEnabled
}

export interface KPISummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  funnels: {
    registrationToProfileRate: number;
    jobViewToApplyRate: number;
  };
  topJobViews: Record<string, number>;
}

const FORBIDDEN_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /auth_header/i,
  /api_?key/i,
  /credit_?card/i,
  /ssn/i,
];

const JWT_BEARER_PATTERN = /^(Bearer\s+|eyJ[a-zA-Z0-9_-]{10,}\.)/;

/**
 * Size bounds for client-supplied metadata (BR-27). Ingestion is anonymous, so
 * without them one request could store an arbitrarily wide or deep object.
 * Key count and depth are refused (422); longer strings and arrays are cut.
 */
export const ANALYTICS_METADATA_LIMITS = {
  maxKeys: 30,
  maxDepth: 4,
  maxArrayItems: 50,
  maxStringLength: 1000,
} as const;

/** Events the in-memory analytics store keeps; older ones are dropped (C-03). */
export const ANALYTICS_EVENT_RETENTION = 10_000;

const tooLarge = () =>
  new DomainError('VALIDATION_FAILED', 'Analytics metadata is too large (BR-27).');

function sanitizeString(key: string, value: string): string {
  if (JWT_BEARER_PATTERN.test(value)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `Prohibited auth token or JWT detected in metadata value for key "${key}" (BR-27).`
    );
  }
  return value.slice(0, ANALYTICS_METADATA_LIMITS.maxStringLength);
}

/**
 * Validates and sanitizes analytics metadata per BR-27 (whitelist-only; zero secrets/tokens/raw passwords).
 * Array elements get the same checks as object values, so a list cannot carry
 * a forbidden key or a bearer token past the filter; nested arrays are dropped.
 */
export function sanitizeAnalyticsMetadata(
  metadata?: Record<string, unknown>,
  depth = 0
): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }
  if (depth > ANALYTICS_METADATA_LIMITS.maxDepth) throw tooLarge();
  const entries = Object.entries(metadata);
  if (entries.length > ANALYTICS_METADATA_LIMITS.maxKeys) throw tooLarge();

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    // Check key against forbidden patterns (BR-27)
    for (const pattern of FORBIDDEN_KEY_PATTERNS) {
      if (pattern.test(key)) {
        throw new DomainError(
          'VALIDATION_FAILED',
          `Prohibited field "${key}" detected in analytics metadata. Secrets and tokens are disallowed (BR-27).`
        );
      }
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(key, value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      const items: unknown[] = [];
      for (const item of value.slice(0, ANALYTICS_METADATA_LIMITS.maxArrayItems)) {
        if (typeof item === 'string') items.push(sanitizeString(key, item));
        else if (typeof item === 'number' || typeof item === 'boolean') items.push(item);
        else if (item && typeof item === 'object' && !Array.isArray(item)) {
          items.push(sanitizeAnalyticsMetadata(item as Record<string, unknown>, depth + 1));
        }
      }
      sanitized[key] = items;
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeAnalyticsMetadata(value as Record<string, unknown>, depth + 1);
    }
  }

  return sanitized;
}

/**
 * Refuses client metadata that exceeds ANALYTICS_METADATA_LIMITS anywhere in
 * the tree (too many keys, too deep, an over-long array or string) without
 * changing it. Every nested object or array is one level of depth. For stores
 * that keep metadata verbatim (activity events, M-1).
 */
export function assertMetadataWithinLimits(metadata: unknown, depth = 0): void {
  const limits = ANALYTICS_METADATA_LIMITS;
  if (typeof metadata === 'string') {
    if (metadata.length > limits.maxStringLength) throw tooLarge();
    return;
  }
  if (!metadata || typeof metadata !== 'object') return;
  if (depth > limits.maxDepth) throw tooLarge();
  const children = Array.isArray(metadata) ? metadata : Object.values(metadata);
  if (
    Array.isArray(metadata)
      ? children.length > limits.maxArrayItems
      : children.length > limits.maxKeys
  ) {
    throw tooLarge();
  }
  for (const child of children) assertMetadataWithinLimits(child, depth + 1);
}

/**
 * Appends to an in-memory event log and drops the oldest entries beyond `cap`,
 * so a non-durable store cannot grow without bound (C-03).
 */
export function appendBounded<T>(list: T[], item: T, cap: number): void {
  list.push(item);
  if (list.length > cap) list.splice(0, list.length - cap);
}

/**
 * Records an analytics event with telemetry consent enforcement and metadata sanitization (F-19, BR-27).
 */
export function recordAnalyticsEvent(params: RecordAnalyticsEventParams): AnalyticsEvent {
  if (!params.eventType || params.eventType.trim().length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'Event type is required for telemetry recording.');
  }

  const cleanMetadata = sanitizeAnalyticsMetadata(params.metadata);
  const now = new Date().toISOString();

  // If user explicitly opted out of telemetry, anonymize the event completely
  const isAnonymized = params.telemetryConsent === false;
  const effectiveUserId = isAnonymized ? undefined : params.userId;

  return {
    id: crypto.randomUUID(),
    userId: effectiveUserId,
    anonymousId: params.anonymousId,
    eventType: params.eventType.trim().toLowerCase(),
    metadata: cleanMetadata,
    ipHash: params.ipHash,
    userAgent: params.userAgent?.slice(0, 255),
    isAnonymized,
    timestamp: now,
  };
}

/**
 * Aggregates events into key performance indicators (KPIs) and conversion funnels (F-31).
 */
export function computeKPIs(events: AnalyticsEvent[]): KPISummary {
  const eventsByType: Record<string, number> = {};
  const uniqueUsersSet = new Set<string>();
  const topJobViews: Record<string, number> = {};

  let registeredCount = 0;
  let profileCompletedCount = 0;
  let jobViewCount = 0;
  let appSubmittedCount = 0;

  for (const ev of events) {
    eventsByType[ev.eventType] = (eventsByType[ev.eventType] || 0) + 1;

    if (ev.userId) {
      uniqueUsersSet.add(ev.userId);
    }

    if (ev.eventType === 'user_registered') {
      registeredCount++;
    } else if (ev.eventType === 'profile_completed') {
      profileCompletedCount++;
    } else if (ev.eventType === 'job_viewed') {
      jobViewCount++;
      const jobId = typeof ev.metadata.jobId === 'string' ? ev.metadata.jobId : undefined;
      if (jobId) {
        topJobViews[jobId] = (topJobViews[jobId] || 0) + 1;
      }
    } else if (ev.eventType === 'application_submitted') {
      appSubmittedCount++;
    }
  }

  const registrationToProfileRate =
    registeredCount > 0 ? Number((profileCompletedCount / registeredCount).toFixed(4)) : 0;

  const jobViewToApplyRate =
    jobViewCount > 0 ? Number((appSubmittedCount / jobViewCount).toFixed(4)) : 0;

  return {
    totalEvents: events.length,
    uniqueUsers: uniqueUsersSet.size,
    eventsByType,
    funnels: {
      registrationToProfileRate,
      jobViewToApplyRate,
    },
    topJobViews,
  };
}
