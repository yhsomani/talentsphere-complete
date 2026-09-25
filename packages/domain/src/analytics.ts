import { DomainError } from './index.js';

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
 * Validates and sanitizes analytics metadata per BR-27 (whitelist-only; zero secrets/tokens/raw passwords).
 */
export function sanitizeAnalyticsMetadata(
  metadata?: Record<string, unknown>
): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Check key against forbidden patterns (BR-27)
    for (const pattern of FORBIDDEN_KEY_PATTERNS) {
      if (pattern.test(key)) {
        throw new DomainError(
          'VALIDATION_FAILED',
          `Prohibited field "${key}" detected in analytics metadata. Secrets and tokens are disallowed (BR-27).`
        );
      }
    }

    // Check string values for sensitive tokens
    if (typeof value === 'string') {
      if (JWT_BEARER_PATTERN.test(value)) {
        throw new DomainError(
          'VALIDATION_FAILED',
          `Prohibited auth token or JWT detected in metadata value for key "${key}" (BR-27).`
        );
      }
      sanitized[key] = value.slice(0, 1000); // Bounded string length
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 50);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeAnalyticsMetadata(value as Record<string, unknown>);
    }
  }

  return sanitized;
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
