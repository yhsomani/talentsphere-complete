import crypto from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateCheckoutSessionInputSchema } from '@talentsphere/contracts';
import {
  DomainError,
  PLATFORM_PLANS,
  invoiceFromStripe,
  reconcileStripeSubscription,
  type AuthPayload,
  type PriceCatalog,
  type Subscription,
} from '@talentsphere/domain';
import type { Storage } from './storage/index.js';
import type { NormalizedStripeEvent, StripeGateway } from './stripe-gateway.js';

/**
 * Stripe billing (F-16, X-03).
 *
 * Stripe is the source of truth for payment state. This API never marks a plan
 * paid because a browser says so: a paid tier exists only after a signed
 * webhook reports a paid-up Stripe subscription whose price is in the
 * server-side catalog. The Checkout success redirect is a courtesy page, not
 * evidence.
 */

export interface StripeBillingDeps {
  appUrl: string;
  storage: Pick<Storage, 'billing'>;
  gateway: StripeGateway;
  catalog: PriceCatalog;
  extractUser(req: FastifyRequest): AuthPayload;
  /** The account's email, or undefined when the account does not exist. */
  getAccountEmail(userId: string): string | undefined;
  dispatchJob(event: { type: string; payload: Record<string, unknown> }): Promise<void>;
  log: {
    warn(obj: Record<string, unknown>, msg: string): void;
  };
}

/** Who may buy which plan: the catalog's targetRole mapped onto platform roles. */
const ROLES_FOR_PLAN: Record<'candidate' | 'recruiter', readonly string[]> = {
  candidate: ['candidate'],
  recruiter: ['recruiter', 'hiring_manager'],
};

/** A subscription that still bills or grants access; a second one must not start. */
const isLive = (s: Subscription): boolean =>
  s.planTier !== 'free' && ['active', 'trialing', 'past_due'].includes(s.status);

export type StripeEventOutcome =
  { status: 'processed' } | { status: 'replayed' } | { status: 'ignored'; reason: string };

/**
 * Applies one verified, normalised Stripe event. Safe under retries, duplicate
 * delivery and out-of-order delivery: the event is recorded and its state
 * change committed in one transaction keyed by Stripe's event id.
 */
export async function processStripeEvent(
  deps: StripeBillingDeps,
  event: NormalizedStripeEvent
): Promise<StripeEventOutcome> {
  const { billing } = deps.storage;
  const record = (userId: string, payload: Record<string, unknown>) => ({
    provider: 'stripe',
    providerEventId: event.id,
    eventType: event.type,
    userId,
    payload,
  });
  const done = (outcome: 'applied' | 'duplicate'): StripeEventOutcome =>
    outcome === 'duplicate' ? { status: 'replayed' } : { status: 'processed' };

  switch (event.kind) {
    case 'ignored':
      return { status: 'ignored', reason: 'event type is not handled' };

    case 'checkout.completed': {
      if (!event.userId || !event.customerId || !deps.getAccountEmail(event.userId)) {
        deps.log.warn({ eventId: event.id }, 'Stripe checkout completed for an unknown account');
        return { status: 'ignored', reason: 'unknown account' };
      }
      // A customer already linked to another account would violate the unique
      // customer mapping and make Stripe retry the event for days.
      const linkedTo = await billing.findUserIdByStripeCustomer(event.customerId);
      if (linkedTo && linkedTo !== event.userId) {
        deps.log.warn({ eventId: event.id }, 'Stripe checkout customer belongs to another account');
        return { status: 'ignored', reason: 'customer linked to another account' };
      }
      // Links the customer only. Access is granted by the subscription events.
      return done(
        await billing.applyEvent(record(event.userId, { subscriptionId: event.subscriptionId }), {
          stripeCustomer: { userId: event.userId, customerId: event.customerId },
        })
      );
    }

    case 'subscription': {
      const { snapshot } = event;
      const userId =
        (await billing.findUserIdByStripeSubscription(snapshot.id)) ??
        (await billing.findUserIdByStripeCustomer(snapshot.customerId));
      if (!userId || !deps.getAccountEmail(userId)) {
        deps.log.warn({ eventId: event.id }, 'Stripe subscription event for an unknown customer');
        return { status: 'ignored', reason: 'unknown customer' };
      }
      const existing = await billing.getSubscription(userId);
      const payload = { subscriptionId: snapshot.id, status: snapshot.status };

      // A late event for an older subscription must not overwrite a live newer
      // one (e.g. the old subscription's "deleted" arriving after re-subscribing).
      if (
        existing?.stripeSubscriptionId &&
        existing.stripeSubscriptionId !== snapshot.id &&
        isLive(existing)
      ) {
        deps.log.warn({ eventId: event.id }, 'Stripe event for a superseded subscription ignored');
        return done(await billing.applyEvent(record(userId, payload)));
      }

      if (!deps.catalog.planForPrice(snapshot.priceId)) {
        deps.log.warn({ eventId: event.id }, 'Stripe subscription price is not in the catalog');
      }
      const result = reconcileStripeSubscription({
        userId,
        snapshot,
        catalog: deps.catalog,
        existing,
      });
      const outcome = await billing.applyEvent(
        record(userId, payload),
        result.stale
          ? undefined
          : { subscription: result.subscription, entitlements: result.entitlements }
      );
      if (outcome === 'applied' && !result.stale) {
        await deps.dispatchJob({
          type: 'billing.subscription.synced',
          payload: {
            userId,
            subscriptionId: result.subscription.id,
            status: result.subscription.status,
            planTier: result.subscription.planTier,
          },
        });
      }
      return done(outcome);
    }

    case 'refund': {
      const userId = event.customerId
        ? await billing.findUserIdByStripeCustomer(event.customerId)
        : undefined;
      if (!userId || !deps.getAccountEmail(userId)) {
        deps.log.warn({ eventId: event.id }, 'Stripe refund event for an unknown customer');
        return { status: 'ignored', reason: 'unknown customer' };
      }
      const subscription = await billing.getSubscription(userId);
      const periodStart = subscription ? Date.parse(subscription.currentPeriodStart) / 1000 : 0;
      // Only a full refund of the charge that paid for the current period of the
      // subscription that grants access ends it. A partial refund, an older
      // charge, another subscription's charge or a one-off charge does not.
      if (
        !event.fullyRefunded ||
        !subscription?.stripeSubscriptionId ||
        !isLive(subscription) ||
        !event.paymentIntentId ||
        event.chargeCreated < periodStart ||
        (await deps.gateway.subscriptionIdForPayment(event.paymentIntentId)) !==
          subscription.stripeSubscriptionId
      ) {
        return done(await billing.applyEvent(record(userId, { chargeRefunded: true })));
      }
      // Cancel before recording: a Stripe failure throws, so Stripe retries the
      // event instead of it being recorded as handled.
      await cancelWithStripe(deps, subscription, true);
      return done(await billing.applyEvent(record(userId, { chargeRefunded: true })));
    }

    case 'invoice': {
      const { snapshot } = event;
      const userId = await billing.findUserIdByStripeCustomer(snapshot.customerId);
      if (!userId || !deps.getAccountEmail(userId)) {
        deps.log.warn({ eventId: event.id }, 'Stripe invoice event for an unknown customer');
        return { status: 'ignored', reason: 'unknown customer' };
      }
      const subscription = await billing.getSubscription(userId);
      const linked =
        subscription &&
        snapshot.subscriptionId &&
        subscription.stripeSubscriptionId === snapshot.subscriptionId
          ? subscription.id
          : undefined;
      const invoice = invoiceFromStripe({ userId, snapshot, subscriptionId: linked });
      return done(
        await billing.applyEvent(
          record(userId, { invoiceId: snapshot.id, status: snapshot.status }),
          {
            invoice,
          }
        )
      );
    }
  }
}

/**
 * Cancels a Stripe-backed subscription at Stripe, then mirrors Stripe's answer
 * locally so the response is truthful even before the webhook arrives.
 */
export async function cancelWithStripe(
  deps: StripeBillingDeps,
  current: Subscription,
  immediate: boolean
): Promise<Subscription> {
  if (!current.stripeSubscriptionId) {
    throw new DomainError(
      'INVALID_STATE_TRANSITION',
      'This subscription is not managed by Stripe.'
    );
  }
  // Re-requesting a scheduled cancellation is a no-op and must not call Stripe.
  if (!immediate && current.cancelAtPeriodEnd) return current;
  const snapshot = await deps.gateway.setCancellation(current.stripeSubscriptionId, immediate);
  const result = reconcileStripeSubscription({
    userId: current.userId,
    snapshot,
    catalog: deps.catalog,
    existing: current,
  });
  await deps.storage.billing.saveState({
    subscription: result.subscription,
    entitlements: result.entitlements,
  });
  return result.subscription;
}

export async function registerStripeBilling(
  app: FastifyInstance,
  deps: StripeBillingDeps
): Promise<void> {
  const { billing } = deps.storage;

  // Start a purchase. The client names a plan and cycle; the price comes from
  // the server-side catalog.
  app.post('/api/v1/billing/checkout', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = deps.extractUser(req);
    const input = CreateCheckoutSessionInputSchema.parse(req.body ?? {});
    const plan = PLATFORM_PLANS[input.planTier];

    const targetRole = plan.targetRole;
    if (
      targetRole !== 'all' &&
      !session.roles.some((role) => ROLES_FOR_PLAN[targetRole].includes(role))
    ) {
      throw new DomainError(
        'FORBIDDEN',
        `The ${plan.name} plan is not available for your account type.`
      );
    }
    const priceId = deps.catalog.priceIdFor(input.planTier, input.billingCycle);
    if (!priceId) {
      throw new DomainError('SERVICE_UNAVAILABLE', 'That plan is not available for purchase yet.');
    }
    const current = await billing.getSubscription(session.userId);
    if (current && isLive(current)) {
      throw new DomainError(
        'CONFLICT',
        'You already have a paid subscription. Manage or change it from the billing portal.'
      );
    }

    let customerId = await billing.getStripeCustomerId(session.userId);
    if (!customerId) {
      const email = deps.getAccountEmail(session.userId);
      if (!email) throw new DomainError('NOT_FOUND', 'Account not found.');
      const created = await deps.gateway.createCustomer({ userId: session.userId, email });
      customerId = await billing.linkStripeCustomer(session.userId, created);
    }

    // The key covers plan and cycle, so changing either starts a new session
    // instead of colliding with the previous request's parameters.
    const clientKey = input.idempotencyKey ?? crypto.randomUUID();
    const checkout = await deps.gateway.createCheckoutSession({
      customerId,
      priceId,
      userId: session.userId,
      planTier: input.planTier,
      billingCycle: input.billingCycle,
      successUrl: `${deps.appUrl}/checkout?checkout=success`,
      cancelUrl: `${deps.appUrl}/checkout?checkout=cancelled`,
      idempotencyKey: `checkout:${session.userId}:${input.planTier}:${input.billingCycle}:${clientKey}`,
    });
    return reply.status(201).send({ url: checkout.url });
  });

  // Stripe-hosted self-service: update the card, view invoices, cancel.
  app.post('/api/v1/billing/portal', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = deps.extractUser(req);
    const customerId = await billing.getStripeCustomerId(session.userId);
    if (!customerId) {
      throw new DomainError('NOT_FOUND', 'No billing account yet. Choose a plan first.');
    }
    const portal = await deps.gateway.createPortalSession({
      customerId,
      returnUrl: `${deps.appUrl}/checkout`,
    });
    return reply.status(200).send({ url: portal.url });
  });

  // Stripe → TalentSphere events. The signature covers the exact bytes
  // received, so this scope keeps the raw body; parsing still uses Fastify's
  // hardened JSON parser.
  await app.register(async (scope) => {
    const defaultJsonParser = scope.getDefaultJsonParser('error', 'error');
    scope.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
      (req as FastifyRequest & { rawBody?: string }).rawBody = body as string;
      defaultJsonParser(req, body as string, done);
    });

    scope.post(
      '/api/v1/billing/stripe-webhook',
      async (req: FastifyRequest, reply: FastifyReply) => {
        const signature = req.headers['stripe-signature'];
        const event = deps.gateway.verifyWebhook(
          (req as FastifyRequest & { rawBody?: string }).rawBody ?? '',
          typeof signature === 'string' ? signature : undefined
        );
        const outcome = await processStripeEvent(deps, event);
        return reply.status(200).send(outcome);
      }
    );
  });
}
