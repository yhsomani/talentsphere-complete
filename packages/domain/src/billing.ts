/**
 * TalentSphere Billing, Subscriptions & Monetization Domain
 * Features: F-16, Section 19 (Integer Minor Units), Section 64 (Monetization Invariants), WF-16, WIT-016
 */

import { DomainError } from './index.js';
import crypto from 'node:crypto';

export type PlanTier = 'free' | 'candidate_pro' | 'recruiter_starter' | 'recruiter_enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  description: string;
  priceMonthlyCents: number; // Integer minor units (USD cents)
  priceYearlyCents: number; // Integer minor units (USD cents)
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
export const PLATFORM_PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'TalentSphere Free',
    description: 'Free forever candidate career OS with standard AI quota and digital credentials.',
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    currency: 'USD',
    targetRole: 'candidate',
    features: [
      'Verified Skill Evidence Graph',
      'Course enrollments & challenges',
      'Standard AI Career Assistant (5 req/day, 5,000 tokens/day)',
      'Digital Credential export',
      'Direct messaging & networking',
    ],
  },
  candidate_pro: {
    tier: 'candidate_pro',
    name: 'Candidate Pro',
    description:
      'For ambitious professionals seeking accelerated career growth and high-capacity AI assistance.',
    priceMonthlyCents: 1999, // $19.99
    priceYearlyCents: 19990, // $199.90 (2 months free)
    currency: 'USD',
    targetRole: 'candidate',
    features: [
      'Everything in Free',
      'Advanced AI Career Assistant (50 req/day, 100,000 tokens/day)',
      'Detailed career gap analytics',
      'Unlimited resume variations & ATS preview',
      'Priority showcase visibility to verified recruiters',
    ],
  },
  recruiter_starter: {
    tier: 'recruiter_starter',
    name: 'Recruiter Starter',
    description: 'For growing teams to post jobs and evaluate verified candidate talent.',
    priceMonthlyCents: 9900, // $99.00
    priceYearlyCents: 99000, // $990.00
    currency: 'USD',
    targetRole: 'recruiter',
    features: [
      'Up to 5 active verified job listings',
      'Candidate ATS pipeline with verified skill matching',
      'Direct messaging with candidate applicants',
      'Standard recruitment analytics',
    ],
  },
  recruiter_enterprise: {
    tier: 'recruiter_enterprise',
    name: 'Recruiter Enterprise',
    description:
      'High-volume talent acquisition with unlimited postings, team seats, and deep graph analytics.',
    priceMonthlyCents: 29900, // $299.00
    priceYearlyCents: 299000, // $2,990.00
    currency: 'USD',
    targetRole: 'recruiter',
    features: [
      'Unlimited active job postings',
      'Multi-seat workspace team access',
      'Deep Talent Graph candidate discovery',
      'Advanced recruitment intelligence & benchmarking',
      'Dedicated support & custom billing SLAs',
    ],
  },
};

/**
 * Derives user entitlements pure model based on active plan tier.
 */
export function getPlanEntitlements(
  userId: string,
  planTier: PlanTier,
  nowIso: string = new Date().toISOString()
): Entitlements {
  switch (planTier) {
    case 'candidate_pro':
      return {
        userId,
        planTier,
        aiDailyRequestsLimit: 50,
        aiDailyTokensLimit: 100000,
        activeJobsLimit: 0,
        canExportCredentials: true,
        hasAdvancedAnalytics: true,
        updatedAt: nowIso,
      };
    case 'recruiter_starter':
      return {
        userId,
        planTier,
        aiDailyRequestsLimit: 25,
        aiDailyTokensLimit: 50000,
        activeJobsLimit: 5,
        canExportCredentials: true,
        hasAdvancedAnalytics: true,
        updatedAt: nowIso,
      };
    case 'recruiter_enterprise':
      return {
        userId,
        planTier,
        aiDailyRequestsLimit: 200,
        aiDailyTokensLimit: 500000,
        activeJobsLimit: 1000,
        canExportCredentials: true,
        hasAdvancedAnalytics: true,
        updatedAt: nowIso,
      };
    case 'free':
    default:
      return {
        userId,
        planTier: 'free',
        aiDailyRequestsLimit: 5,
        aiDailyTokensLimit: 5000,
        activeJobsLimit: 0,
        canExportCredentials: true,
        hasAdvancedAnalytics: false,
        updatedAt: nowIso,
      };
  }
}

/**
 * Section 64 Monetization Invariant:
 * Monetization must never:
 * - buy professional credibility;
 * - buy hiring rank / scorecard inflation;
 * - bypass proctored assessment AI blocks (ASSESSMENT_AI_PROHIBITED);
 * - expose private candidate evidence without consent.
 */
export function validateMonetizationIntegrity(planTier: PlanTier, attemptedAction: string): void {
  const prohibitedCommercialActions = [
    'bypass_assessment_proctoring',
    'inflate_hiring_rank',
    'fabricate_credentials',
    'bypass_candidate_privacy',
    'auto_pass_assessments',
  ];

  if (prohibitedCommercialActions.includes(attemptedAction)) {
    throw new DomainError(
      'POLICY_VIOLATION',
      `Violation of Section 64 Monetization Invariant: Commercial subscription tier (${planTier}) cannot be used to ${attemptedAction.replace(/_/g, ' ')}.`
    );
  }
}

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
export function createSubscription(params: CreateSubscriptionParams): CreateSubscriptionResult {
  const plan = PLATFORM_PLANS[params.planTier];
  if (!plan) {
    throw new DomainError('VALIDATION_FAILED', `Unknown plan tier: ${params.planTier}`);
  }

  const cycle = params.billingCycle || 'monthly';
  const now = params.nowIso || new Date().toISOString();
  const startDate = new Date(now);

  const durationDays = cycle === 'yearly' ? 365 : 30;
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const subscriptionId = crypto.randomUUID();
  const subscription: Subscription = {
    id: subscriptionId,
    userId: params.userId,
    planTier: params.planTier,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: endDate.toISOString(),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  const amountCents = cycle === 'yearly' ? plan.priceYearlyCents : plan.priceMonthlyCents;
  const invoiceId = crypto.randomUUID();
  const invoice: Invoice = {
    id: invoiceId,
    userId: params.userId,
    subscriptionId,
    amountCents,
    currency: plan.currency,
    status: amountCents === 0 ? 'paid' : 'paid', // In mock/test baseline, auto-marked paid
    paidAt: now,
    hostedInvoiceUrl: `/invoices/${invoiceId}`,
    idempotencyKey: params.idempotencyKey,
    createdAt: now,
  };

  const entitlements = getPlanEntitlements(params.userId, params.planTier, now);

  return {
    subscription,
    invoice,
    entitlements,
  };
}

/**
 * Cancels a subscription (either at period end or immediately).
 */
export function cancelSubscription(
  subscription: Subscription,
  immediate: boolean = false,
  nowIso: string = new Date().toISOString()
): Subscription {
  if (subscription.status === 'canceled') {
    throw new DomainError('INVALID_STATE_TRANSITION', 'Subscription is already canceled.');
  }

  if (immediate) {
    return {
      ...subscription,
      status: 'canceled',
      cancelAtPeriodEnd: false,
      canceledAt: nowIso,
      updatedAt: nowIso,
    };
  }

  return {
    ...subscription,
    cancelAtPeriodEnd: true,
    canceledAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Renews an active subscription for an additional cycle.
 */
export function renewSubscription(
  subscription: Subscription,
  cycleDays: number = 30,
  nowIso: string = new Date().toISOString()
): Subscription {
  if (subscription.status === 'canceled') {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'Cannot renew a subscription that has already been canceled.'
    );
  }

  const currentEnd = new Date(subscription.currentPeriodEnd);
  const newEnd = new Date(currentEnd.getTime() + cycleDays * 24 * 60 * 60 * 1000);

  return {
    ...subscription,
    status: 'active',
    currentPeriodStart: subscription.currentPeriodEnd,
    currentPeriodEnd: newEnd.toISOString(),
    updatedAt: nowIso,
  };
}
