import type pg from 'pg';
import type { Entitlements, Invoice, Subscription } from '@talentsphere/domain';

/** An inbound provider event, recorded once and only once (durable idempotency). */
export interface BillingEventRecord {
  provider: string;
  /** The provider's own event id (Stripe `evt_…`), or a signed generic key. */
  providerEventId: string;
  eventType: string;
  userId?: string | undefined;
  payload: Record<string, unknown>;
}

/** State changes that must commit atomically with the event (or on their own). */
export interface BillingStateWrite {
  subscription?: Subscription;
  entitlements?: Entitlements;
  invoice?: Invoice;
  stripeCustomer?: { userId: string; customerId: string };
}

export interface BillingStore {
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getEntitlements(userId: string): Promise<Entitlements | undefined>;
  listInvoices(userId: string): Promise<Invoice[]>;
  findInvoiceByIdempotencyKey(userId: string, key: string): Promise<Invoice | undefined>;

  getStripeCustomerId(userId: string): Promise<string | undefined>;
  /** Insert-or-get: returns the customer id that is linked after the call. */
  linkStripeCustomer(userId: string, customerId: string): Promise<string>;
  findUserIdByStripeCustomer(customerId: string): Promise<string | undefined>;
  findUserIdByStripeSubscription(subscriptionId: string): Promise<string | undefined>;

  /**
   * Writes state with no provider event (the simulated, non-payment path).
   * 'duplicate' = the invoice's per-user idempotency key was already used; no
   * state was changed.
   */
  saveState(write: BillingStateWrite): Promise<'saved' | 'duplicate'>;

  /**
   * Records the event and applies `write` in ONE transaction. A replay of the
   * same (provider, providerEventId) changes nothing and reports 'duplicate'.
   * A subscription write older than the stored one is skipped (stale events),
   * together with its entitlements.
   */
  applyEvent(
    event: BillingEventRecord,
    write?: BillingStateWrite
  ): Promise<'applied' | 'duplicate'>;

  /** Removes every billing record held for the user (account erasure, F-17). */
  eraseUser(userId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Memory implementation: same contract, explicitly non-durable.
// ---------------------------------------------------------------------------

export class MemoryBillingStore implements BillingStore {
  private readonly subscriptions = new Map<string, Subscription>();
  private readonly entitlements = new Map<string, Entitlements>();
  private readonly invoices = new Map<string, Invoice[]>();
  private readonly customers = new Map<string, string>();
  private readonly events = new Map<string, BillingEventRecord>();

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(userId);
  }

  async getEntitlements(userId: string): Promise<Entitlements | undefined> {
    return this.entitlements.get(userId);
  }

  async listInvoices(userId: string): Promise<Invoice[]> {
    return [...(this.invoices.get(userId) ?? [])];
  }

  async findInvoiceByIdempotencyKey(userId: string, key: string): Promise<Invoice | undefined> {
    return (this.invoices.get(userId) ?? []).find((i) => i.idempotencyKey === key);
  }

  async getStripeCustomerId(userId: string): Promise<string | undefined> {
    return this.customers.get(userId);
  }

  async linkStripeCustomer(userId: string, customerId: string): Promise<string> {
    const existing = this.customers.get(userId);
    if (existing) return existing;
    this.customers.set(userId, customerId);
    return customerId;
  }

  async findUserIdByStripeCustomer(customerId: string): Promise<string | undefined> {
    for (const [userId, id] of this.customers) if (id === customerId) return userId;
    return undefined;
  }

  async findUserIdByStripeSubscription(subscriptionId: string): Promise<string | undefined> {
    for (const [userId, sub] of this.subscriptions) {
      if (sub.stripeSubscriptionId === subscriptionId) return userId;
    }
    return undefined;
  }

  private write(write: BillingStateWrite): 'saved' | 'duplicate' {
    const invoice = write.invoice;
    if (invoice?.idempotencyKey) {
      const dup = (this.invoices.get(invoice.userId) ?? []).some(
        (i) => i.idempotencyKey === invoice.idempotencyKey
      );
      if (dup) return 'duplicate';
    }
    if (write.stripeCustomer && !this.customers.has(write.stripeCustomer.userId)) {
      this.customers.set(write.stripeCustomer.userId, write.stripeCustomer.customerId);
    }
    let skipEntitlements = false;
    if (write.subscription) {
      const current = this.subscriptions.get(write.subscription.userId);
      const incoming = write.subscription.providerEventCreatedAt;
      const stale =
        incoming !== undefined &&
        current?.providerEventCreatedAt !== undefined &&
        new Date(current.providerEventCreatedAt) > new Date(incoming);
      if (stale) skipEntitlements = true;
      else this.subscriptions.set(write.subscription.userId, write.subscription);
    }
    if (write.entitlements && !skipEntitlements) {
      this.entitlements.set(write.entitlements.userId, write.entitlements);
    }
    if (invoice) {
      const list = this.invoices.get(invoice.userId) ?? [];
      const at = invoice.stripeInvoiceId
        ? list.findIndex((i) => i.stripeInvoiceId === invoice.stripeInvoiceId)
        : -1;
      if (at >= 0) {
        // A paid invoice is terminal: a late "open" update must not reopen it.
        if (list[at]!.status !== 'paid') list[at] = { ...invoice, id: list[at]!.id };
      } else {
        list.unshift(invoice);
      }
      this.invoices.set(invoice.userId, list);
    }
    return 'saved';
  }

  async saveState(write: BillingStateWrite): Promise<'saved' | 'duplicate'> {
    return this.write(write);
  }

  async applyEvent(
    event: BillingEventRecord,
    write?: BillingStateWrite
  ): Promise<'applied' | 'duplicate'> {
    const key = `${event.provider}:${event.providerEventId}`;
    if (this.events.has(key)) return 'duplicate';
    this.events.set(key, event);
    if (write) this.write(write);
    return 'applied';
  }

  async eraseUser(userId: string): Promise<void> {
    this.subscriptions.delete(userId);
    this.entitlements.delete(userId);
    this.invoices.delete(userId);
    this.customers.delete(userId);
    for (const [key, event] of this.events) if (event.userId === userId) this.events.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Postgres implementation (tables from migrations 00014 and 00052).
// ---------------------------------------------------------------------------

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_tier: Subscription['planTier'];
  status: Subscription['status'];
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  provider_event_created_at: Date | null;
}

interface InvoiceRow {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount_cents: number;
  currency: string;
  status: Invoice['status'];
  paid_at: Date | null;
  hosted_invoice_url: string | null;
  idempotency_key: string | null;
  stripe_invoice_id: string | null;
  created_at: Date;
}

interface EntitlementRow {
  user_id: string;
  plan_tier: Entitlements['planTier'];
  ai_daily_requests_limit: number;
  ai_daily_tokens_limit: number;
  active_jobs_limit: number;
  can_export_credentials: boolean;
  has_advanced_analytics: boolean;
  updated_at: Date;
}

const toIso = (d: Date): string => new Date(d).toISOString();

function toSubscription(r: SubscriptionRow): Subscription {
  return {
    id: r.id,
    userId: r.user_id,
    planTier: r.plan_tier,
    status: r.status,
    currentPeriodStart: toIso(r.current_period_start),
    currentPeriodEnd: toIso(r.current_period_end),
    cancelAtPeriodEnd: r.cancel_at_period_end,
    ...(r.canceled_at ? { canceledAt: toIso(r.canceled_at) } : {}),
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    ...(r.stripe_subscription_id ? { stripeSubscriptionId: r.stripe_subscription_id } : {}),
    ...(r.stripe_price_id ? { stripePriceId: r.stripe_price_id } : {}),
    ...(r.provider_event_created_at
      ? { providerEventCreatedAt: toIso(r.provider_event_created_at) }
      : {}),
  };
}

function toInvoice(r: InvoiceRow): Invoice {
  return {
    id: r.id,
    userId: r.user_id,
    ...(r.subscription_id ? { subscriptionId: r.subscription_id } : {}),
    amountCents: r.amount_cents,
    currency: r.currency,
    status: r.status,
    ...(r.paid_at ? { paidAt: toIso(r.paid_at) } : {}),
    ...(r.hosted_invoice_url ? { hostedInvoiceUrl: r.hosted_invoice_url } : {}),
    ...(r.idempotency_key ? { idempotencyKey: r.idempotency_key } : {}),
    ...(r.stripe_invoice_id ? { stripeInvoiceId: r.stripe_invoice_id } : {}),
    createdAt: toIso(r.created_at),
  };
}

function toEntitlements(r: EntitlementRow): Entitlements {
  return {
    userId: r.user_id,
    planTier: r.plan_tier,
    aiDailyRequestsLimit: r.ai_daily_requests_limit,
    aiDailyTokensLimit: r.ai_daily_tokens_limit,
    activeJobsLimit: r.active_jobs_limit,
    canExportCredentials: r.can_export_credentials,
    hasAdvancedAnalytics: r.has_advanced_analytics,
    updatedAt: toIso(r.updated_at),
  };
}

const UNIQUE_VIOLATION = '23505';

export class PgBillingStore implements BillingStore {
  constructor(private readonly pool: pg.Pool) {}

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const r = await this.pool.query<SubscriptionRow>(
      'SELECT * FROM public.subscriptions WHERE user_id = $1',
      [userId]
    );
    return r.rows[0] ? toSubscription(r.rows[0]) : undefined;
  }

  async getEntitlements(userId: string): Promise<Entitlements | undefined> {
    const r = await this.pool.query<EntitlementRow>(
      'SELECT * FROM public.entitlements WHERE user_id = $1',
      [userId]
    );
    return r.rows[0] ? toEntitlements(r.rows[0]) : undefined;
  }

  async listInvoices(userId: string): Promise<Invoice[]> {
    const r = await this.pool.query<InvoiceRow>(
      'SELECT * FROM public.invoices WHERE user_id = $1 ORDER BY created_at DESC, id',
      [userId]
    );
    return r.rows.map(toInvoice);
  }

  async findInvoiceByIdempotencyKey(userId: string, key: string): Promise<Invoice | undefined> {
    const r = await this.pool.query<InvoiceRow>(
      'SELECT * FROM public.invoices WHERE user_id = $1 AND idempotency_key = $2',
      [userId, key]
    );
    return r.rows[0] ? toInvoice(r.rows[0]) : undefined;
  }

  async getStripeCustomerId(userId: string): Promise<string | undefined> {
    const r = await this.pool.query<{ stripe_customer_id: string }>(
      'SELECT stripe_customer_id FROM public.stripe_customers WHERE user_id = $1',
      [userId]
    );
    return r.rows[0]?.stripe_customer_id;
  }

  async linkStripeCustomer(userId: string, customerId: string): Promise<string> {
    await this.pool.query(
      `INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
       VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
      [userId, customerId]
    );
    return (await this.getStripeCustomerId(userId)) ?? customerId;
  }

  async findUserIdByStripeCustomer(customerId: string): Promise<string | undefined> {
    const r = await this.pool.query<{ user_id: string }>(
      'SELECT user_id FROM public.stripe_customers WHERE stripe_customer_id = $1',
      [customerId]
    );
    return r.rows[0]?.user_id;
  }

  async findUserIdByStripeSubscription(subscriptionId: string): Promise<string | undefined> {
    const r = await this.pool.query<{ user_id: string }>(
      'SELECT user_id FROM public.subscriptions WHERE stripe_subscription_id = $1',
      [subscriptionId]
    );
    return r.rows[0]?.user_id;
  }

  /** Runs the state writes on an open transaction. Returns false on a duplicate invoice key. */
  private async writeState(client: pg.PoolClient, write: BillingStateWrite): Promise<boolean> {
    if (write.stripeCustomer) {
      await client.query(
        `INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
         VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
        [write.stripeCustomer.userId, write.stripeCustomer.customerId]
      );
    }

    let skipEntitlements = false;
    let subscriptionId: string | undefined;
    if (write.subscription) {
      const s = write.subscription;
      // The WHERE clause is the stale-event guard: it holds across concurrent
      // transactions because the conflicting row is locked for the update.
      const r = await client.query<{ id: string }>(
        `INSERT INTO public.subscriptions
           (id, user_id, plan_tier, status, current_period_start, current_period_end,
            cancel_at_period_end, canceled_at, created_at, updated_at,
            stripe_subscription_id, stripe_price_id, provider_event_created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (user_id) DO UPDATE SET
           plan_tier = EXCLUDED.plan_tier,
           status = EXCLUDED.status,
           current_period_start = EXCLUDED.current_period_start,
           current_period_end = EXCLUDED.current_period_end,
           cancel_at_period_end = EXCLUDED.cancel_at_period_end,
           canceled_at = EXCLUDED.canceled_at,
           updated_at = EXCLUDED.updated_at,
           stripe_subscription_id = EXCLUDED.stripe_subscription_id,
           stripe_price_id = EXCLUDED.stripe_price_id,
           provider_event_created_at = EXCLUDED.provider_event_created_at
         WHERE EXCLUDED.provider_event_created_at IS NULL
            OR public.subscriptions.provider_event_created_at IS NULL
            OR public.subscriptions.provider_event_created_at <= EXCLUDED.provider_event_created_at
         RETURNING id`,
        [
          s.id,
          s.userId,
          s.planTier,
          s.status,
          s.currentPeriodStart,
          s.currentPeriodEnd,
          s.cancelAtPeriodEnd,
          s.canceledAt ?? null,
          s.createdAt,
          s.updatedAt,
          s.stripeSubscriptionId ?? null,
          s.stripePriceId ?? null,
          s.providerEventCreatedAt ?? null,
        ]
      );
      if (r.rows.length === 0) skipEntitlements = true;
      else subscriptionId = r.rows[0]!.id;
    }

    if (write.entitlements && !skipEntitlements) {
      const e = write.entitlements;
      await client.query(
        `INSERT INTO public.entitlements
           (user_id, plan_tier, ai_daily_requests_limit, ai_daily_tokens_limit,
            active_jobs_limit, can_export_credentials, has_advanced_analytics, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (user_id) DO UPDATE SET
           plan_tier = EXCLUDED.plan_tier,
           ai_daily_requests_limit = EXCLUDED.ai_daily_requests_limit,
           ai_daily_tokens_limit = EXCLUDED.ai_daily_tokens_limit,
           active_jobs_limit = EXCLUDED.active_jobs_limit,
           can_export_credentials = EXCLUDED.can_export_credentials,
           has_advanced_analytics = EXCLUDED.has_advanced_analytics,
           updated_at = EXCLUDED.updated_at`,
        [
          e.userId,
          e.planTier,
          e.aiDailyRequestsLimit,
          e.aiDailyTokensLimit,
          e.activeJobsLimit,
          e.canExportCredentials,
          e.hasAdvancedAnalytics,
          e.updatedAt,
        ]
      );
    }

    if (write.invoice) {
      const i = write.invoice;
      // Link to the stored subscription row (its id may differ from the
      // in-memory one when the row already existed).
      const linkedSubscription =
        subscriptionId ??
        (
          await client.query<{ id: string }>(
            'SELECT id FROM public.subscriptions WHERE user_id = $1',
            [i.userId]
          )
        ).rows[0]?.id ??
        null;
      try {
        await client.query(
          `INSERT INTO public.invoices
             (id, user_id, subscription_id, amount_cents, currency, status, paid_at,
              hosted_invoice_url, idempotency_key, stripe_invoice_id, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL DO UPDATE SET
             status = EXCLUDED.status,
             amount_cents = EXCLUDED.amount_cents,
             paid_at = EXCLUDED.paid_at,
             hosted_invoice_url = EXCLUDED.hosted_invoice_url
           WHERE public.invoices.status <> 'paid'`,
          [
            i.id,
            i.userId,
            linkedSubscription,
            i.amountCents,
            i.currency,
            i.status,
            i.paidAt ?? null,
            i.hostedInvoiceUrl ?? null,
            i.idempotencyKey ?? null,
            i.stripeInvoiceId ?? null,
            i.createdAt,
          ]
        );
      } catch (error) {
        if ((error as { code?: string }).code === UNIQUE_VIOLATION && i.idempotencyKey) {
          return false;
        }
        throw error;
      }
    }
    return true;
  }

  async saveState(write: BillingStateWrite): Promise<'saved' | 'duplicate'> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const ok = await this.writeState(client, write);
      if (!ok) {
        await client.query('ROLLBACK');
        return 'duplicate';
      }
      await client.query('COMMIT');
      return 'saved';
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async applyEvent(
    event: BillingEventRecord,
    write?: BillingStateWrite
  ): Promise<'applied' | 'duplicate'> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query(
        `INSERT INTO public.billing_events
           (user_id, event_type, payload, idempotency_key, provider, provider_event_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (provider, provider_event_id) WHERE provider_event_id IS NOT NULL DO NOTHING
         RETURNING id`,
        [
          event.userId ?? null,
          event.eventType,
          JSON.stringify(event.payload),
          // The generic signed webhook's key is globally unique by design.
          event.provider === 'generic' ? event.providerEventId : null,
          event.provider,
          event.providerEventId,
        ]
      );
      if (inserted.rows.length === 0) {
        await client.query('ROLLBACK');
        return 'duplicate';
      }
      if (write) await this.writeState(client, write);
      await client.query('COMMIT');
      return 'applied';
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async eraseUser(userId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM public.invoices WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.entitlements WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.subscriptions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.billing_events WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM public.stripe_customers WHERE user_id = $1', [userId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}
