import { describe, it, expect } from 'vitest';
import {
  sanitizeAnalyticsMetadata,
  recordAnalyticsEvent,
  computeKPIs,
  assertMetadataWithinLimits,
  appendBounded,
  ANALYTICS_METADATA_LIMITS,
  telemetryConsentFrom,
  type AnalyticsEvent,
} from '../../packages/domain/src/analytics.js';

describe('Domain: Product Analytics, Telemetry & KPI Rollups (F-19, F-31, BR-27)', () => {
  it('records a valid analytics event with clean metadata', () => {
    const event = recordAnalyticsEvent({
      userId: 'user_123',
      eventType: 'job_viewed',
      metadata: {
        jobId: 'job_abc',
        device: 'desktop',
        browser: 'Chrome',
      },
    });

    expect(event.id).toBeDefined();
    expect(event.eventType).toBe('job_viewed');
    expect(event.userId).toBe('user_123');
    expect(event.metadata.jobId).toBe('job_abc');
    expect(event.metadata.device).toBe('desktop');
    expect(event.isAnonymized).toBe(false);
  });

  it('rejects event recording without event type', () => {
    expect(() =>
      recordAnalyticsEvent({
        eventType: '',
      })
    ).toThrowError(/Event type is required/);
  });

  it('enforces BR-27: rejects metadata containing password fields', () => {
    expect(() =>
      sanitizeAnalyticsMetadata({
        accountPassword: 'secret123Password',
      })
    ).toThrowError(/Prohibited field "accountPassword" detected in analytics metadata/);
  });

  it('enforces BR-27: rejects metadata containing secret or token keys', () => {
    expect(() =>
      sanitizeAnalyticsMetadata({
        api_token: 'tok_abc123',
      })
    ).toThrowError(/Prohibited field "api_token" detected/);

    expect(() =>
      sanitizeAnalyticsMetadata({
        clientSecret: 'secret_val',
      })
    ).toThrowError(/Prohibited field "clientSecret" detected/);
  });

  it('enforces BR-27: rejects metadata values containing JWT or Bearer authorization strings', () => {
    expect(() =>
      sanitizeAnalyticsMetadata({
        authContext: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
      })
    ).toThrowError(/Prohibited auth token or JWT detected/);
  });

  it('anonymizes telemetry event when user has opted out of telemetry consent', () => {
    const event = recordAnalyticsEvent({
      userId: 'user_privacy_conscious',
      eventType: 'session_active',
      telemetryConsent: false,
      metadata: { path: '/dashboard' },
    });

    expect(event.userId).toBeUndefined();
    expect(event.isAnonymized).toBe(true);
    expect(event.metadata.path).toBe('/dashboard');
  });

  it('computes aggregated KPIs and conversion funnels accurately (F-31)', () => {
    const mockEvents: AnalyticsEvent[] = [
      {
        id: '1',
        userId: 'u1',
        eventType: 'user_registered',
        metadata: {},
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'u2',
        eventType: 'user_registered',
        metadata: {},
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        userId: 'u1',
        eventType: 'profile_completed',
        metadata: {},
        timestamp: new Date().toISOString(),
      },
      {
        id: '4',
        userId: 'u1',
        eventType: 'job_viewed',
        metadata: { jobId: 'job_consensus' },
        timestamp: new Date().toISOString(),
      },
      {
        id: '5',
        userId: 'u2',
        eventType: 'job_viewed',
        metadata: { jobId: 'job_consensus' },
        timestamp: new Date().toISOString(),
      },
      {
        id: '6',
        userId: 'u1',
        eventType: 'application_submitted',
        metadata: { jobId: 'job_consensus' },
        timestamp: new Date().toISOString(),
      },
    ];

    const kpis = computeKPIs(mockEvents);

    expect(kpis.totalEvents).toBe(6);
    expect(kpis.uniqueUsers).toBe(2);
    expect(kpis.eventsByType.user_registered).toBe(2);
    expect(kpis.eventsByType.job_viewed).toBe(2);
    expect(kpis.eventsByType.application_submitted).toBe(1);

    // Funnels:
    // Registration to profile: 1 profile_completed / 2 user_registered = 0.5 (50%)
    expect(kpis.funnels.registrationToProfileRate).toBe(0.5);

    // Job view to apply: 1 application_submitted / 2 job_viewed = 0.5 (50%)
    expect(kpis.funnels.jobViewToApplyRate).toBe(0.5);

    // Top job views
    expect(kpis.topJobViews.job_consensus).toBe(2);
  });
});

// C-03 / M-2: ingestion is anonymous, so metadata is bounded in width and
// depth, and array elements get the same BR-27 checks as object values.
describe('Domain: analytics metadata bounds (C-03, M-2)', () => {
  const wide = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, i]));
  const nested = (levels: number): Record<string, unknown> =>
    levels === 0 ? { leaf: 1 } : { child: nested(levels - 1) };
  const code = (fn: () => unknown) => {
    try {
      fn();
    } catch (err) {
      return (err as { code?: string }).code;
    }
    return 'no error';
  };

  it('refuses more than maxKeys keys', () => {
    expect(ANALYTICS_METADATA_LIMITS.maxKeys).toBe(30);
    expect(code(() => sanitizeAnalyticsMetadata(wide(31)))).toBe('VALIDATION_FAILED');
    expect(code(() => sanitizeAnalyticsMetadata({ inner: wide(31) }))).toBe('VALIDATION_FAILED');
  });

  it('refuses nesting deeper than maxDepth', () => {
    expect(code(() => sanitizeAnalyticsMetadata(nested(6)))).toBe('VALIDATION_FAILED');
    expect(code(() => sanitizeAnalyticsMetadata(nested(5)))).toBe('VALIDATION_FAILED');
  });

  it('accepts 30 keys with nesting at depth 4 (the top level is depth 0)', () => {
    const metadata = { ...wide(29), deep: nested(3) };
    expect(Object.keys(metadata)).toHaveLength(30);
    expect(sanitizeAnalyticsMetadata(metadata)).toEqual(metadata);
    expect(sanitizeAnalyticsMetadata(nested(4))).toEqual(nested(4));
  });

  it('checks array elements: a forbidden key or bearer token inside a list is refused', () => {
    expect(code(() => sanitizeAnalyticsMetadata({ list: [{ password: 'x' }] }))).toBe(
      'VALIDATION_FAILED'
    );
    expect(
      code(() => sanitizeAnalyticsMetadata({ list: ['Bearer eyJhbGciOiJIUzI1NiJ9.e30.x'] }))
    ).toBe('VALIDATION_FAILED');
  });

  it('cuts array elements, drops nested arrays and bounds strings inside arrays', () => {
    const out = sanitizeAnalyticsMetadata({
      list: ['a'.repeat(2000), 3, true, ['nested'], { ok: 1 }, null],
      many: Array.from({ length: 80 }, (_, i) => i),
    });
    expect(out.list).toEqual(['a'.repeat(1000), 3, true, { ok: 1 }]);
    expect(out.many).toHaveLength(50);
  });

  it('assertMetadataWithinLimits refuses oversize trees without changing them', () => {
    expect(code(() => assertMetadataWithinLimits(wide(31)))).toBe('VALIDATION_FAILED');
    expect(code(() => assertMetadataWithinLimits({ list: Array(51).fill(1) }))).toBe(
      'VALIDATION_FAILED'
    );
    expect(code(() => assertMetadataWithinLimits({ s: 'x'.repeat(1001) }))).toBe(
      'VALIDATION_FAILED'
    );
    expect(code(() => assertMetadataWithinLimits(nested(5)))).toBe('VALIDATION_FAILED');
    // Arrays count as a level, so nested arrays cannot bypass the depth bound.
    expect(code(() => assertMetadataWithinLimits({ a: [[[[[1]]]]] }))).toBe('VALIDATION_FAILED');
    expect(code(() => assertMetadataWithinLimits({ ...wide(29), deep: nested(3) }))).toBe(
      'no error'
    );
  });

  it('appendBounded keeps only the newest `cap` items', () => {
    const list: number[] = [];
    for (let i = 0; i < 10_050; i++) appendBounded(list, i, 10_000);
    expect(list).toHaveLength(10_000);
    expect(list[0]).toBe(50);
    expect(list[list.length - 1]).toBe(10_049);
  });
});

describe('Domain: telemetry consent from stored settings (C-10)', () => {
  it('consents by default and withdraws only on an explicit showActivity: false', () => {
    expect(telemetryConsentFrom(undefined)).toBe(true);
    expect(telemetryConsentFrom(null)).toBe(true);
    expect(telemetryConsentFrom({ showActivity: true })).toBe(true);
    expect(telemetryConsentFrom({ showActivity: false })).toBe(false);
  });
});
