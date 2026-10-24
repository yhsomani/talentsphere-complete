import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatMoney } from '../lib/format.js';
import { Button, Notice } from './ui/index.js';

interface Plan {
  tier: string;
  name: string;
  description: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  features: string[];
  currency: string;
  targetRole: string;
}

interface SubscriptionState {
  planTier: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}

interface UsageState {
  requestsUsed: number;
  requestsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
}

interface PlansResponse {
  plans: Plan[];
  checkoutEnabled?: boolean;
}

/**
 * Paid plans, shown only when the server says a purchase can really be
 * started (Stripe configured). Otherwise this renders nothing and the page
 * keeps its honest "free while payments are set up" copy. The browser sends
 * a plan name only; the price is chosen and charged by Stripe on the server.
 */
export const PaidPlans: React.FC<{ signedIn: boolean }> = ({ signedIn }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [entitledTier, setEntitledTier] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const [usageFailed, setUsageFailed] = useState(false);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiJson<PlansResponse>('/api/v1/billing/plans', { signal: controller.signal })
      .then((data) => {
        if (data.checkoutEnabled) setPlans(data.plans.filter((p) => p.tier !== 'free'));
      })
      .catch(() => undefined); // The free pricing page stands on its own.
    return () => controller.abort();
  }, []);

  // Display only: the server decides the plan and the limits.
  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    // Independent calls: one failing must not hide the other.
    setSubscription(null);
    setEntitledTier(null);
    setUsage(null);
    setSubscriptionFailed(false);
    setUsageFailed(false);
    apiJson<{ subscription: SubscriptionState; entitlements: { planTier: string } }>(
      '/api/v1/billing/subscription',
      {
        signal: controller.signal,
      }
    )
      .then((data) => {
        setSubscription(data.subscription);
        setEntitledTier(data.entitlements.planTier);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSubscriptionFailed(true);
      });
    apiJson<{
      usage: { requestsCount: number; tokensConsumed: number };
      limits: { maxRequestsPerDay: number; maxTokensPerDay: number };
    }>('/api/v1/ai/usage', { signal: controller.signal })
      .then((data) =>
        setUsage({
          requestsUsed: data.usage.requestsCount,
          requestsLimit: data.limits.maxRequestsPerDay,
          tokensUsed: data.usage.tokensConsumed,
          tokensLimit: data.limits.maxTokensPerDay,
        })
      )
      .catch(() => {
        if (!controller.signal.aborted) setUsageFailed(true);
      });
    return () => controller.abort();
  }, [signedIn]);

  if (plans.length === 0) return null;

  const allFeatures = Array.from(new Set(plans.flatMap((p) => p.features)));
  const cellStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: spacing.sm,
    border: `1px solid ${colors.neutral[200]}`,
    verticalAlign: 'top',
  };

  const go = async (path: string, body: unknown, key: string) => {
    setBusy(key);
    setError(null);
    try {
      const { url } = await apiJson<{ url: string }>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  return (
    <section
      aria-labelledby="paid-plans-title"
      data-testid="paid-plans"
      style={{ marginTop: spacing.xl }}
    >
      <h2 id="paid-plans-title" style={{ fontSize: '1.125rem', color: colors.neutral[700] }}>
        Paid plans
      </h2>
      <div role="group" aria-label="Billing period" style={{ display: 'flex', gap: spacing.sm }}>
        {(['monthly', 'yearly'] as const).map((c) => (
          <Button
            key={c}
            variant={cycle === c ? 'primary' : 'outline'}
            aria-pressed={cycle === c}
            onClick={() => setCycle(c)}
            data-testid={`cycle-${c}`}
          >
            {c === 'monthly' ? 'Monthly' : 'Yearly'}
          </Button>
        ))}
      </div>
      {signedIn && (
        <div data-testid="current-plan" style={{ marginTop: spacing.md }}>
          {subscription && (
            <p style={{ margin: 0 }}>
              Current plan: <strong>{(entitledTier ?? 'free').replace(/_/g, ' ')}</strong>
              {entitledTier === 'free' && subscription.planTier !== 'free'
                ? ` (subscription ${subscription.status})`
                : ` (${subscription.status}${
                    subscription.cancelAtPeriodEnd
                      ? `, ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : ''
                  })`}
            </p>
          )}
          {subscriptionFailed && (
            <Notice tone="warning" data-testid="subscription-unavailable">
              Your current plan could not be loaded right now.
            </Notice>
          )}
          {usage && (
            <>
              <label style={{ display: 'block' }}>
                AI assistant today: {usage.requestsUsed} of {usage.requestsLimit} requests
                <progress
                  value={usage.requestsUsed}
                  max={usage.requestsLimit}
                  style={{ display: 'block', width: '100%' }}
                />
              </label>
              <label style={{ display: 'block', marginTop: spacing.sm }}>
                AI assistant today: {usage.tokensUsed.toLocaleString()} of{' '}
                {usage.tokensLimit.toLocaleString()} tokens
                <progress
                  value={usage.tokensUsed}
                  max={usage.tokensLimit}
                  style={{ display: 'block', width: '100%' }}
                />
              </label>
              {(usage.requestsUsed >= usage.requestsLimit ||
                usage.tokensUsed >= usage.tokensLimit) && (
                <Notice tone="error">
                  You have reached today&apos;s AI limit. Choose a higher plan below for more.
                </Notice>
              )}
            </>
          )}
          {usageFailed && (
            <Notice tone="warning" data-testid="usage-unavailable">
              Your AI usage could not be loaded right now.
            </Notice>
          )}
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <div style={{ display: 'grid', gap: spacing.md, marginTop: spacing.md }}>
        {plans.map((plan) => (
          <div
            key={plan.tier}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.md,
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1px solid ${colors.neutral[200]}`,
              padding: spacing.lg,
            }}
          >
            <div>
              <strong>{plan.name}</strong>
              <p style={{ color: colors.neutral[600], margin: 0 }}>{plan.description}</p>
              <ul style={{ margin: `${spacing.sm} 0`, paddingLeft: spacing.lg }}>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p style={{ margin: 0 }} data-testid={`price-${plan.tier}`}>
                {cycle === 'monthly'
                  ? `${formatMoney(plan.priceMonthlyCents, plan.currency)} / month`
                  : `${formatMoney(plan.priceYearlyCents, plan.currency)} / year`}
              </p>
            </div>
            {signedIn ? (
              <Button
                loading={busy === plan.tier}
                disabled={busy !== null}
                onClick={() =>
                  go(
                    '/api/v1/billing/checkout',
                    { planTier: plan.tier, billingCycle: cycle },
                    plan.tier
                  )
                }
                data-testid={`subscribe-${plan.tier}`}
              >
                Subscribe
              </Button>
            ) : (
              <span style={{ color: colors.neutral[600] }}>Sign in to subscribe</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table
          data-testid="plan-comparison"
          style={{ marginTop: spacing.lg, width: '100%', borderCollapse: 'collapse' }}
        >
          <caption style={{ textAlign: 'left', fontWeight: 600, marginBottom: spacing.sm }}>
            Compare paid plans ({cycle === 'monthly' ? 'monthly' : 'yearly'} billing)
          </caption>
          <thead>
            <tr>
              <th scope="col" style={cellStyle}>
                Feature
              </th>
              {plans.map((plan) => (
                <th key={plan.tier} scope="col" style={cellStyle}>
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" style={cellStyle}>
                Price per {cycle === 'monthly' ? 'month' : 'year'}
              </th>
              {plans.map((plan) => (
                <td key={plan.tier} style={cellStyle}>
                  {formatMoney(
                    cycle === 'monthly' ? plan.priceMonthlyCents : plan.priceYearlyCents,
                    plan.currency
                  )}
                </td>
              ))}
            </tr>
            {allFeatures.map((feature) => (
              <tr key={feature}>
                <th scope="row" style={{ ...cellStyle, fontWeight: 400 }}>
                  {feature}
                </th>
                {plans.map((plan) => (
                  <td key={plan.tier} style={cellStyle}>
                    {plan.features.includes(feature) ? 'Included' : 'Not included'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {signedIn && (
        <p style={{ marginTop: spacing.md }}>
          <Button
            variant="outline"
            loading={busy === 'portal'}
            disabled={busy !== null}
            onClick={() => go('/api/v1/billing/portal', {}, 'portal')}
            data-testid="manage-billing"
          >
            Manage billing
          </Button>
        </p>
      )}
    </section>
  );
};
