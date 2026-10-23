import Stripe from 'stripe';
import {
  DomainError,
  type BillingCycle,
  type PlanTier,
  type StripeInvoiceSnapshot,
  type StripeSubscriptionSnapshot,
  type StripeSubscriptionStatus,
} from '@talentsphere/domain';

/**
 * The only module that talks to the Stripe SDK. Routes and tests depend on
 * {@link StripeGateway}; Stripe objects are normalised into the domain's
 * snapshot shapes here, so nothing else needs to know the SDK's types or the
 * API version's field layout (e.g. subscription periods live on the item).
 */

export type NormalizedStripeEvent =
  | {
      kind: 'checkout.completed';
      id: string;
      type: string;
      created: number;
      customerId: string | undefined;
      subscriptionId: string | undefined;
      /** The user the session was created for (client_reference_id), if any. */
      userId: string | undefined;
    }
  | {
      kind: 'subscription';
      id: string;
      type: string;
      created: number;
      snapshot: StripeSubscriptionSnapshot;
    }
  | {
      kind: 'invoice';
      id: string;
      type: string;
      created: number;
      snapshot: StripeInvoiceSnapshot;
    }
  | {
      kind: 'refund';
      id: string;
      type: string;
      created: number;
      customerId: string | undefined;
      /** True only when the whole charge was refunded; partial refunds keep access. */
      fullyRefunded: boolean;
      /** Unix seconds when the refunded charge was made. */
      chargeCreated: number;
      /** The payment the charge belongs to; links it to an invoice and subscription. */
      paymentIntentId: string | undefined;
    }
  | { kind: 'ignored'; id: string; type: string; created: number };

export interface StripeGateway {
  /** Creates the Stripe customer for a user (idempotent per user). */
  createCustomer(input: { userId: string; email: string }): Promise<string>;
  createCheckoutSession(input: {
    customerId: string;
    priceId: string;
    userId: string;
    planTier: PlanTier;
    billingCycle: BillingCycle;
    successUrl: string;
    cancelUrl: string;
    idempotencyKey: string;
  }): Promise<{ url: string }>;
  createPortalSession(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;
  /** Cancels at period end, or immediately; returns Stripe's resulting state. */
  setCancellation(subscriptionId: string, immediate: boolean): Promise<StripeSubscriptionSnapshot>;
  /**
   * The subscription an invoice payment was made for, or undefined when the
   * payment is not a subscription invoice (or cannot be resolved).
   */
  subscriptionIdForPayment(paymentIntentId: string): Promise<string | undefined>;
  /** Deleting a customer also ends its subscriptions in Stripe. */
  deleteCustomer(customerId: string): Promise<void>;
  /**
   * Verifies the Stripe-Signature over the exact bytes received and returns the
   * normalised event. Throws UNAUTHENTICATED when the signature is missing,
   * wrong or stale.
   */
  verifyWebhook(rawBody: string, signature: string | undefined): NormalizedStripeEvent;
}

interface GatewayLogger {
  error(obj: Record<string, unknown>, msg: string): void;
}

const idOf = (value: string | { id: string } | null | undefined): string | undefined =>
  typeof value === 'string' ? value : (value?.id ?? undefined);

export function normalizeSubscription(
  sub: Stripe.Subscription,
  eventCreated: number
): StripeSubscriptionSnapshot {
  // One price per subscription is sold; the period is reported on the item.
  const item = sub.items.data[0];
  return {
    id: sub.id,
    customerId: idOf(sub.customer) ?? '',
    status: sub.status as StripeSubscriptionStatus,
    priceId: item?.price?.id,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: sub.canceled_at ?? null,
    currentPeriodStart: item?.current_period_start ?? sub.start_date,
    currentPeriodEnd: item?.current_period_end ?? sub.start_date,
    eventCreated,
  };
}

export function normalizeInvoice(invoice: Stripe.Invoice): StripeInvoiceSnapshot {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  return {
    id: invoice.id ?? '',
    customerId: idOf(invoice.customer) ?? '',
    subscriptionId: idOf(parentSubscription),
    status: (invoice.status ?? 'draft') as StripeInvoiceSnapshot['status'],
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
    currency: invoice.currency,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
    paidAt: invoice.status_transitions?.paid_at ?? undefined,
  };
}

export function normalizeEvent(event: Stripe.Event): NormalizedStripeEvent {
  const base = { id: event.id, type: event.type, created: event.created };
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      return {
        kind: 'checkout.completed',
        ...base,
        customerId: idOf(session.customer),
        subscriptionId: idOf(session.subscription),
        userId: session.client_reference_id ?? undefined,
      };
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return {
        kind: 'subscription',
        ...base,
        snapshot: normalizeSubscription(event.data.object, event.created),
      };
    case 'invoice.paid':
    case 'invoice.payment_failed':
      return { kind: 'invoice', ...base, snapshot: normalizeInvoice(event.data.object) };
    case 'charge.refunded': {
      const charge = event.data.object;
      return {
        kind: 'refund',
        ...base,
        customerId: idOf(charge.customer),
        fullyRefunded: charge.refunded === true,
        chargeCreated: charge.created,
        paymentIntentId: idOf(charge.payment_intent),
      };
    }
    default:
      return { kind: 'ignored', ...base };
  }
}

export function createStripeGateway(options: {
  secretKey: string;
  webhookSecret: string;
  logger: GatewayLogger;
  /** Test seam: a stand-in for the SDK client. */
  client?: Stripe;
}): StripeGateway {
  const stripe =
    options.client ??
    new Stripe(options.secretKey, {
      maxNetworkRetries: 2,
      timeout: 15_000,
      appInfo: { name: 'TalentSphere' },
    });

  /** Provider failures never leak details to the client; they are logged without secrets. */
  const guard = async <T>(operation: string, run: () => Promise<T>): Promise<T> => {
    try {
      return await run();
    } catch (error) {
      if (error instanceof DomainError) throw error;
      const e = error as { type?: string; code?: string; statusCode?: number; requestId?: string };
      options.logger.error(
        {
          operation,
          stripeType: e.type,
          stripeCode: e.code,
          status: e.statusCode,
          requestId: e.requestId,
        },
        'Stripe request failed'
      );
      throw new DomainError(
        'SERVICE_UNAVAILABLE',
        'The payment provider could not complete that request. Try again in a moment.'
      );
    }
  };

  return {
    createCustomer: ({ userId, email }) =>
      guard('customers.create', async () => {
        const customer = await stripe.customers.create(
          { email, metadata: { userId } },
          { idempotencyKey: `customer:${userId}` }
        );
        return customer.id;
      }),

    createCheckoutSession: (input) =>
      guard('checkout.sessions.create', async () => {
        const session = await stripe.checkout.sessions.create(
          {
            mode: 'subscription',
            customer: input.customerId,
            client_reference_id: input.userId,
            line_items: [{ price: input.priceId, quantity: 1 }],
            metadata: {
              userId: input.userId,
              planTier: input.planTier,
              billingCycle: input.billingCycle,
            },
            subscription_data: { metadata: { userId: input.userId } },
            success_url: input.successUrl,
            cancel_url: input.cancelUrl,
          },
          { idempotencyKey: input.idempotencyKey }
        );
        if (!session.url) {
          throw new DomainError(
            'SERVICE_UNAVAILABLE',
            'The payment provider returned no checkout link.'
          );
        }
        return { url: session.url };
      }),

    createPortalSession: ({ customerId, returnUrl }) =>
      guard('billingPortal.sessions.create', async () => {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
        return { url: session.url };
      }),

    setCancellation: (subscriptionId, immediate) =>
      guard('subscriptions.cancel', async () => {
        const sub = immediate
          ? await stripe.subscriptions.cancel(subscriptionId)
          : await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        return normalizeSubscription(sub, Math.floor(Date.now() / 1000));
      }),

    subscriptionIdForPayment: (paymentIntentId) =>
      guard('invoicePayments.list', async () => {
        const payments = await stripe.invoicePayments.list({
          payment: { type: 'payment_intent', payment_intent: paymentIntentId },
          expand: ['data.invoice'],
          limit: 1,
        });
        const invoice = payments.data[0]?.invoice;
        if (!invoice || typeof invoice === 'string' || !('parent' in invoice)) return undefined;
        return idOf(invoice.parent?.subscription_details?.subscription);
      }),

    deleteCustomer: (customerId) =>
      guard('customers.del', async () => {
        try {
          await stripe.customers.del(customerId);
        } catch (error) {
          // Already deleted: a retried erasure must still be able to finish.
          if ((error as { code?: string }).code !== 'resource_missing') throw error;
        }
      }),

    verifyWebhook: (rawBody, signature) => {
      if (!signature) {
        throw new DomainError('UNAUTHENTICATED', 'Stripe signature is missing, invalid or stale.');
      }
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, options.webhookSecret);
      } catch {
        throw new DomainError('UNAUTHENTICATED', 'Stripe signature is missing, invalid or stale.');
      }
      return normalizeEvent(event);
    },
  };
}
