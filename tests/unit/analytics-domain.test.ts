import { describe, it, expect } from 'vitest';
import {
  sanitizeAnalyticsMetadata,
  recordAnalyticsEvent,
  computeKPIs,
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
