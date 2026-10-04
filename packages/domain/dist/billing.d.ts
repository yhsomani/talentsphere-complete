/**
 * TalentSphere Billing, Subscriptions & Monetization Domain
 * Features: F-16, Section 19 (Integer Minor Units), Section 64 (Monetization Invariants), WF-16, WIT-016
 */
export type PlanTier = 'free' | 'candidate_pro' | 'recruiter_starter' | 'recruiter_enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export interface PlanDefinition {
    tier: PlanTier;
    name: string;
    description: string;
    priceMonthlyCents: number;
    priceYearlyCents: number;
    currency: 'USD';
    targetRole: 'candidate' | 'recruiter' | 'all';
    features: string[];
}
export interface Entitlements {
    userId: string;
    planTier: PlanTier;
    aiDailyRequestsLimit: number;
    aiDailyTokensLimit: number;
    activeJobsLimit: number;
    canExportCredentials: boolean;
    hasAdvancedAnalytics: boolean;
    updatedAt: string;
}
export interface Subscription {
    id: string;
    userId: string;
    planTier: PlanTier;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Invoice {
    id: string;
    userId: string;
    subscriptionId?: string;
    amountCents: number;
    currency: string;
    status: InvoiceStatus;
    paidAt?: string;
    hostedInvoiceUrl?: string;
    idempotencyKey?: string;
    createdAt: string;
}
export interface BillingEvent {
    id: string;
    userId?: string;
    eventType: string;
    payload: Record<string, unknown>;
    idempotencyKey?: string;
    createdAt: string;
}
/**
 * Platform canonical plan definitions with strict integer minor unit pricing (USD cents).
 */
export declare const PLATFORM_PLANS: Record<PlanTier, PlanDefinition>;
/**
 * Derives user entitlements pure model based on active plan tier.
 */
export declare function getPlanEntitlements(userId: string, planTier: PlanTier, nowIso?: string): Entitlements;
/**
 * Section 64 Monetization Invariant:
 * Monetization must never:
 * - buy professional credibility;
 * - buy hiring rank / scorecard inflation;
 * - bypass proctored assessment AI blocks (ASSESSMENT_AI_PROHIBITED);
 * - expose private candidate evidence without consent.
 */
export declare function validateMonetizationIntegrity(planTier: PlanTier, attemptedAction: string): void;
export interface CreateSubscriptionParams {
    userId: string;
    planTier: PlanTier;
    billingCycle?: BillingCycle;
    idempotencyKey?: string;
    nowIso?: string;
}
export interface CreateSubscriptionResult {
    subscription: Subscription;
    invoice: Invoice;
    entitlements: Entitlements;
}
/**
 * Initializes or upgrades a subscription and generates the corresponding initial invoice.
 */
export declare function createSubscription(params: CreateSubscriptionParams): CreateSubscriptionResult;
/**
 * Cancels a subscription (either at period end or immediately).
 */
export declare function cancelSubscription(subscription: Subscription, immediate?: boolean, nowIso?: string): Subscription;
/**
 * Renews an active subscription for an additional cycle.
 */
export declare function renewSubscription(subscription: Subscription, cycleDays?: number, nowIso?: string): Subscription;
//# sourceMappingURL=billing.d.ts.map