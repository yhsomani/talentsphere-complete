import crypto from 'node:crypto';

/**
 * Test doubles for Stripe. Nothing here talks to Stripe or holds a real
 * credential: the values below are shaped to pass this repo's config
 * validation and are meaningless anywhere else.
 */
export const FAKE_STRIPE_ENV = {
  BILLING_MODE: 'stripe',
  STRIPE_SECRET_KEY: `sk_test_${'a'.repeat(24)}`,
  STRIPE_WEBHOOK_SECRET: `whsec_${'b'.repeat(32)}`,
  STRIPE_PRICE_CANDIDATE_PRO_MONTHLY: 'price_candidate_pro_monthly',
  STRIPE_PRICE_CANDIDATE_PRO_YEARLY: 'price_candidate_pro_yearly',
  STRIPE_PRICE_RECRUITER_STARTER_MONTHLY: 'price_recruiter_starter_monthly',
} as const;

export const FAKE_PRICES = {
  proMonthly: FAKE_STRIPE_ENV.STRIPE_PRICE_CANDIDATE_PRO_MONTHLY,
  proYearly: FAKE_STRIPE_ENV.STRIPE_PRICE_CANDIDATE_PRO_YEARLY,
  starterMonthly: FAKE_STRIPE_ENV.STRIPE_PRICE_RECRUITER_STARTER_MONTHLY,
} as const;

/** Signs a body exactly as Stripe does: `t=<unix>,v1=<HMAC-SHA256 of "t.body">`. */
export function signStripeWebhook(
  payload: unknown,
  options: { secret?: string; timestamp?: number } = {}
): { body: string; headers: Record<string, string> } {
  const body = JSON.stringify(payload);
  const t = options.timestamp ?? Math.floor(Date.now() / 1000);
  const v1 = crypto
    .createHmac('sha256', options.secret ?? FAKE_STRIPE_ENV.STRIPE_WEBHOOK_SECRET)
    .update(`${t}.${body}`)
    .digest('hex');
  return {
    body,
    headers: { 'content-type': 'application/json', 'stripe-signature': `t=${t},v1=${v1}` },
  };
}

const now = () => Math.floor(Date.now() / 1000);

export function checkoutCompletedEvent(o: {
  eventId: string;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  created?: number;
}) {
  return {
    id: o.eventId,
    object: 'event',
    type: 'checkout.session.completed',
    created: o.created ?? now(),
    data: {
      object: {
        id: 'cs_test_1',
        object: 'checkout.session',
        client_reference_id: o.userId,
        customer: o.customerId,
        subscription: o.subscriptionId ?? null,
        payment_status: 'paid',
      },
    },
  };
}

export function subscriptionEvent(o: {
  eventId: string;
  customerId: string;
  subscriptionId?: string;
  type?:
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted';
  status?: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: number | null;
  created?: number;
  periodStart?: number;
  periodEnd?: number;
}) {
  const created = o.created ?? now();
  const periodStart = o.periodStart ?? created;
  return {
    id: o.eventId,
    object: 'event',
    type: o.type ?? 'customer.subscription.updated',
    created,
    data: {
      object: {
        id: o.subscriptionId ?? 'sub_test_1',
        object: 'subscription',
        customer: o.customerId,
        status: o.status ?? 'active',
        cancel_at_period_end: o.cancelAtPeriodEnd ?? false,
        canceled_at: o.canceledAt ?? null,
        start_date: periodStart,
        items: {
          object: 'list',
          data: [
            {
              id: 'si_test_1',
              object: 'subscription_item',
              price: { id: o.priceId ?? FAKE_PRICES.proMonthly },
              current_period_start: periodStart,
              current_period_end: o.periodEnd ?? periodStart + 30 * 86400,
            },
          ],
        },
      },
    },
  };
}

export function chargeRefundedEvent(o: {
  eventId: string;
  customerId: string;
  /** False for a partial refund. */
  refunded?: boolean;
  /** When the refunded charge was made (unix seconds). */
  chargeCreated?: number;
  created?: number;
}) {
  return {
    id: o.eventId,
    object: 'event',
    type: 'charge.refunded',
    created: o.created ?? now(),
    data: {
      object: {
        id: 'ch_test_1',
        object: 'charge',
        customer: o.customerId,
        refunded: o.refunded ?? true,
        created: o.chargeCreated ?? now(),
      },
    },
  };
}

export function invoiceEvent(o: {
  eventId: string;
  customerId: string;
  invoiceId?: string;
  subscriptionId?: string;
  type?: 'invoice.paid' | 'invoice.payment_failed';
  status?: string;
  amount?: number;
  created?: number;
}) {
  const created = o.created ?? now();
  const status = o.status ?? (o.type === 'invoice.payment_failed' ? 'open' : 'paid');
  const amount = o.amount ?? 1999;
  return {
    id: o.eventId,
    object: 'event',
    type: o.type ?? 'invoice.paid',
    created,
    data: {
      object: {
        id: o.invoiceId ?? 'in_test_1',
        object: 'invoice',
        customer: o.customerId,
        status,
        amount_paid: status === 'paid' ? amount : 0,
        amount_due: amount,
        currency: 'usd',
        hosted_invoice_url: 'https://invoice.stripe.com/i/test',
        status_transitions: { paid_at: status === 'paid' ? created : null },
        parent: {
          type: 'subscription_details',
          subscription_details: { subscription: o.subscriptionId ?? 'sub_test_1' },
        },
      },
    },
  };
}
