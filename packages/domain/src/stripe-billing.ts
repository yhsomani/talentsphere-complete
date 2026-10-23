/**
 * Stripe billing reconciliation (F-16, X-03): pure rules that turn a verified
 * Stripe object into TalentSphere subscription, entitlement and invoice state.
 *
 * No SDK, network or clock access lives here. The API adapter maps a verified
 * Stripe event into the snapshot shapes below; these functions decide what the
 * resulting state is. Stripe is the source of truth for payment state, so a
 * paid tier is only ever derived from a Stripe subscription whose price id is
 * in the server-side catalog — never from a client-supplied plan or amount.
 */

import crypto from 'node:crypto';
import {
  getPlanEntitlements,
  type BillingCycle,
  type Entitlements,
  type Invoice,
  type InvoiceStatus,
  type PlanTier,
  type Subscription,
  type SubscriptionStatus,
} from './billing.js';

export type StripeSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

/** The fields of a Stripe subscription this platform acts on. */
export interface StripeSubscriptionSnapshot {
  id: string;
  customerId: string;
  status: StripeSubscriptionStatus;
  priceId: string | undefined;
  cancelAtPeriodEnd: boolean;
  /** Unix seconds, or null when never canceled. */
  canceledAt: number | null;
  /** Unix seconds; Stripe reports the period on the subscription item. */
  currentPeriodStart: number;
  currentPeriodEnd: number;
  /** `created` (unix seconds) of the event that carried this snapshot. */
  eventCreated: number;
}

/** The fields of a Stripe invoice this platform records. */
export interface StripeInvoiceSnapshot {
  id: string;
  customerId: string;
  subscriptionId: string | undefined;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountPaid: number;
  amountDue: number;
  currency: string;
  hostedInvoiceUrl: string | undefined;
  /** Unix seconds when the invoice was paid, if it was. */
  paidAt: number | undefined;
}

export type PriceCatalogInput = Partial<Record<`${PlanTier}:${BillingCycle}`, string>>;

export interface PriceCatalog {
  /** The Stripe price id to charge for a plan and cycle, if one is configured. */
  priceIdFor(tier: PlanTier, cycle: BillingCycle): string | undefined;
  /** The plan a Stripe price id grants, if it is one of ours. */
  planForPrice(priceId: string | undefined): { tier: PlanTier; cycle: BillingCycle } | undefined;
}

/** Builds a bidirectional lookup from server configuration. Free has no price. */
export function buildPriceCatalog(input: PriceCatalogInput): PriceCatalog {
  const forward = new Map<string, string>();
  const reverse = new Map<string, { tier: PlanTier; cycle: BillingCycle }>();
  for (const [key, priceId] of Object.entries(input)) {
    if (!priceId) continue;
    const [tier, cycle] = key.split(':') as [PlanTier, BillingCycle];
    if (tier === 'free') continue;
    forward.set(key, priceId);
    reverse.set(priceId, { tier, cycle });
  }
  return {
    priceIdFor: (tier, cycle) => forward.get(`${tier}:${cycle}`),
    planForPrice: (priceId) => (priceId ? reverse.get(priceId) : undefined),
  };
}

/** Stripe → platform subscription status. Nothing unknown is treated as active. */
export function mapStripeStatus(status: StripeSubscriptionStatus): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'incomplete':
      return 'incomplete';
    case 'past_due':
    case 'unpaid':
    case 'paused':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'incomplete';
  }
}

/**
 * Paid access exists only while Stripe says the subscription is paid up
 * (active or trialing). past_due, unpaid, paused, incomplete and canceled all
 * fall back to the free tier: access is never extended on a failed payment.
 */
export function entitledTier(status: SubscriptionStatus, tier: PlanTier): PlanTier {
  return status === 'active' || status === 'trialing' ? tier : 'free';
}

export interface ReconcileSubscriptionResult {
  /** True when the snapshot is older than state already applied: change nothing. */
  stale: boolean;
  subscription: Subscription;
  entitlements: Entitlements;
}

const iso = (unixSeconds: number): string => new Date(unixSeconds * 1000).toISOString();

/**
 * Applies a Stripe subscription snapshot to the stored subscription.
 *
 * - A snapshot whose price is not in the catalog never grants a paid tier.
 * - A snapshot older than the newest one already applied is stale (Stripe does
 *   not guarantee delivery order) and leaves existing state untouched.
 * - Entitlements follow the resulting status through {@link entitledTier}.
 */
export function reconcileStripeSubscription(params: {
  userId: string;
  snapshot: StripeSubscriptionSnapshot;
  catalog: PriceCatalog;
  existing?: Subscription | undefined;
  nowIso?: string;
}): ReconcileSubscriptionResult {
  const { userId, snapshot, catalog, existing } = params;
  const now = params.nowIso ?? new Date().toISOString();

  if (
    existing?.providerEventCreatedAt &&
    snapshot.eventCreated < Math.floor(new Date(existing.providerEventCreatedAt).getTime() / 1000)
  ) {
    return {
      stale: true,
      subscription: existing,
      entitlements: getPlanEntitlements(userId, entitledTier(existing.status, existing.planTier)),
    };
  }

  const plan = catalog.planForPrice(snapshot.priceId);
  const status = mapStripeStatus(snapshot.status);
  // An unrecognised price keeps whatever tier we already recorded (or free):
  // it can never mint a paid tier.
  const planTier: PlanTier = plan?.tier ?? existing?.planTier ?? 'free';
  const effectiveTier = plan ? entitledTier(status, planTier) : 'free';

  const subscription: Subscription = {
    id: existing?.id ?? crypto.randomUUID(),
    userId,
    planTier,
    status,
    currentPeriodStart: iso(snapshot.currentPeriodStart),
    currentPeriodEnd: iso(snapshot.currentPeriodEnd),
    cancelAtPeriodEnd: status === 'canceled' ? false : snapshot.cancelAtPeriodEnd,
    ...(snapshot.canceledAt !== null ? { canceledAt: iso(snapshot.canceledAt) } : {}),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    stripeSubscriptionId: snapshot.id,
    ...(snapshot.priceId ? { stripePriceId: snapshot.priceId } : {}),
    providerEventCreatedAt: iso(snapshot.eventCreated),
  };

  return {
    stale: false,
    subscription,
    entitlements: getPlanEntitlements(userId, effectiveTier, now),
  };
}

/** Stripe invoice → platform invoice. Amounts stay in integer minor units. */
export function invoiceFromStripe(params: {
  userId: string;
  snapshot: StripeInvoiceSnapshot;
  subscriptionId?: string | undefined;
  existingId?: string | undefined;
  nowIso?: string;
}): Invoice {
  const { userId, snapshot } = params;
  const now = params.nowIso ?? new Date().toISOString();
  const status: InvoiceStatus = snapshot.status;
  const id = params.existingId ?? crypto.randomUUID();
  return {
    id,
    userId,
    ...(params.subscriptionId ? { subscriptionId: params.subscriptionId } : {}),
    amountCents: status === 'paid' ? snapshot.amountPaid : snapshot.amountDue,
    currency: snapshot.currency.toUpperCase(),
    status,
    ...(status === 'paid' ? { paidAt: snapshot.paidAt ? iso(snapshot.paidAt) : now } : {}),
    ...(snapshot.hostedInvoiceUrl ? { hostedInvoiceUrl: snapshot.hostedInvoiceUrl } : {}),
    stripeInvoiceId: snapshot.id,
    createdAt: now,
  };
}
