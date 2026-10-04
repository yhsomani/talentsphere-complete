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
    telemetryConsent?: boolean;
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
/**
 * Validates and sanitizes analytics metadata per BR-27 (whitelist-only; zero secrets/tokens/raw passwords).
 */
export declare function sanitizeAnalyticsMetadata(metadata?: Record<string, unknown>): Record<string, unknown>;
/**
 * Records an analytics event with telemetry consent enforcement and metadata sanitization (F-19, BR-27).
 */
export declare function recordAnalyticsEvent(params: RecordAnalyticsEventParams): AnalyticsEvent;
/**
 * Aggregates events into key performance indicators (KPIs) and conversion funnels (F-31).
 */
export declare function computeKPIs(events: AnalyticsEvent[]): KPISummary;
//# sourceMappingURL=analytics.d.ts.map