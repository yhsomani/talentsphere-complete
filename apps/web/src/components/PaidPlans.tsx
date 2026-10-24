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

interface CurrentState {
  planTier: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
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
  const [current, setCurrent] = useState<CurrentState | null>(null);
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
    Promise.all([
      apiJson<{ subscription: Omit<CurrentState, 'aiRequestsUsed' | 'aiRequestsLimit'> }>(
        '/api/v1/billing/subscription',
        { signal: controller.signal }
      ),
      apiJson<{ usage: { requestsCount: number }; limits: { maxRequestsPerDay: number } }>(
        '/api/v1/ai/usage',
        { signal: controller.signal }
      ),
    ])
      .then(([sub, ai]) =>
        setCurrent({
          ...sub.subscription,
          aiRequestsUsed: ai.usage.requestsCount,
          aiRequestsLimit: ai.limits.maxRequestsPerDay,
        })
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, [signedIn]);

  if (plans.length === 0) return null;

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
      {current && (
        <div data-testid="current-plan" style={{ marginTop: spacing.md }}>
          <p style={{ margin: 0 }}>
            Current plan: <strong>{current.planTier.replace(/_/g, ' ')}</strong> ({current.status}
            {current.cancelAtPeriodEnd
              ? `, ends ${new Date(current.currentPeriodEnd).toLocaleDateString()}`
              : ''}
            )
          </p>
          <label>
            AI assistant today: {current.aiRequestsUsed} of {current.aiRequestsLimit} requests
            <progress
              value={current.aiRequestsUsed}
              max={current.aiRequestsLimit}
              style={{ display: 'block', width: '100%' }}
            />
          </label>
          {current.aiRequestsUsed >= current.aiRequestsLimit && (
            <Notice tone="error">
              You have reached today&apos;s AI limit. Choose a higher plan below for more.
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
