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
  currency: string;
  targetRole: string;
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
              <p style={{ margin: 0 }}>
                {formatMoney(plan.priceMonthlyCents, plan.currency)} / month
              </p>
            </div>
            {signedIn ? (
              <Button
                loading={busy === plan.tier}
                disabled={busy !== null}
                onClick={() =>
                  go(
                    '/api/v1/billing/checkout',
                    { planTier: plan.tier, billingCycle: 'monthly' },
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
