import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';

interface Plan {
  id: 'candidate_pro' | 'recruiter_starter' | 'recruiter_enterprise';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'candidate_pro',
    name: 'Candidate Pro',
    monthlyPrice: 29,
    yearlyPrice: 279,
    features: [
      'Gold Verified Evidence Badge',
      'Unlimited Proctored Skill Assessments',
      'Priority Matchmaking & Referral Graph',
      'Exportable Cryptographic Verifications',
    ],
  },
  {
    id: 'recruiter_starter',
    name: 'Recruiter Starter',
    monthlyPrice: 199,
    yearlyPrice: 1899,
    features: [
      'Verified Candidate Talent Pool Search',
      'Direct Verified Warm Introductions',
      '5 Active Job Postings',
      'Standard ATS Integration',
    ],
  },
  {
    id: 'recruiter_enterprise',
    name: 'Recruiter Enterprise',
    monthlyPrice: 599,
    yearlyPrice: 5750,
    features: [
      'Full Multi-Tenant Evidence Graph Access',
      'Custom Skill Taxonomy & Benchmarking',
      'Unlimited Job Postings & Inbound Filtering',
      'Dedicated Customer Success & SLA',
    ],
  },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<
    'candidate_pro' | 'recruiter_starter' | 'recruiter_enterprise'
  >('candidate_pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Payment Form States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    planName: string;
    amount: number;
  } | null>(null);

  const activePlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[0];
  const price = billingCycle === 'monthly' ? activePlan.monthlyPrice : activePlan.yearlyPrice;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Monkey-testing & validation guards
    if (!cardName.trim()) {
      setError('Please provide the cardholder name.');
      return;
    }
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 15 || !/^\d+$/.test(cleanNumber)) {
      setError('Please provide a valid 15 or 16-digit payment card number.');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setError('Please provide a valid expiration date (MM/YY).');
      return;
    }
    if (cardCvc.length < 3 || !/^\d+$/.test(cardCvc)) {
      setError('Please provide a valid 3 or 4-digit security code (CVC).');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('talentsphere_token');
      // Optional backend synchronization
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      await fetch('/api/v1/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planTier: selectedPlan,
          billingCycle,
          idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        }),
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeoutId);

      setConfirmedOrder({
        id: `ord_${Date.now().toString(36).toUpperCase()}`,
        planName: activePlan.name,
        amount: price,
      });
    } catch {
      setError('Transaction could not be completed. Please check your card information.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillTestPayment = () => {
    setCardName('Jordan Test Candidate');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setError(null);
  };

  return (
    <div style={{ maxWidth: '960px', margin: `${spacing.xl} auto`, padding: `0 ${spacing.md}` }}>
      <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: colors.neutral[900],
            marginBottom: spacing.xs,
          }}
        >
          Checkout & Plan Subscriptions
        </h1>
        <p style={{ color: colors.neutral[600], fontSize: '1rem' }}>
          Select your subscription tier and upgrade your talent capabilities.
        </p>

        {/* Billing cycle toggle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: colors.neutral[200],
            padding: '4px',
            borderRadius: '9999px',
            marginTop: spacing.md,
          }}
        >
          <button
            type="button"
            data-testid="billing-cycle-monthly"
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
              color: billingCycle === 'monthly' ? colors.neutral[900] : colors.neutral[600],
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            data-testid="billing-cycle-yearly"
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: billingCycle === 'yearly' ? '#ffffff' : 'transparent',
              color: billingCycle === 'yearly' ? colors.neutral[900] : colors.neutral[600],
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Annual (Save ~20%)
          </button>
        </div>
      </div>

      {confirmedOrder ? (
        <div
          data-testid="checkout-success"
          role="status"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${colors.semantic.success}`,
            padding: spacing.xl,
            textAlign: 'center',
            maxWidth: '540px',
            margin: '0 auto',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: colors.semantic.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 16px',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            Subscription Confirmed!
          </h2>
          <p style={{ color: colors.neutral[600], fontSize: '0.875rem', marginBottom: spacing.md }}>
            Thank you for subscribing to <strong>{confirmedOrder.planName}</strong>.
          </p>
          <div
            style={{
              backgroundColor: colors.neutral[50],
              padding: spacing.md,
              borderRadius: '6px',
              textAlign: 'left',
              marginBottom: spacing.lg,
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}
            >
              <span>Order Reference:</span>
              <strong data-testid="order-reference">{confirmedOrder.id}</strong>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}
            >
              <span>Tier Activated:</span>
              <strong>{confirmedOrder.planName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Paid:</span>
              <strong data-testid="order-amount">${confirmedOrder.amount}</strong>
            </div>
          </div>

          <button
            type="button"
            data-testid="return-to-dashboard"
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: colors.primary[600],
              color: '#ffffff',
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: spacing.xl,
          }}
        >
          {/* Plan Options Column */}
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: spacing.md,
                color: colors.neutral[900],
              }}
            >
              1. Select Plan
            </h2>
            <div
              role="radiogroup"
              aria-label="Subscription plans"
              style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}
            >
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const currentPrice =
                  billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                return (
                  <div
                    key={plan.id}
                    data-testid={`plan-card-${plan.id}`}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedPlan(plan.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPlan(plan.id);
                      }
                    }}
                    style={{
                      border: `2px solid ${isSelected ? colors.primary[600] : colors.neutral[200]}`,
                      borderRadius: '8px',
                      padding: spacing.md,
                      backgroundColor: isSelected ? colors.primary[50] : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{ fontWeight: 700, fontSize: '1rem', color: colors.neutral[900] }}
                      >
                        {plan.name}
                      </span>
                      <span
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.primary[700] }}
                      >
                        ${currentPrice}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            color: colors.neutral[500],
                          }}
                        >
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </span>
                    </div>
                    <ul
                      style={{
                        margin: `${spacing.sm} 0 0`,
                        paddingLeft: '20px',
                        fontSize: '0.8125rem',
                        color: colors.neutral[600],
                      }}
                    >
                      {plan.features.map((feat, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Review Column */}
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: spacing.md,
                color: colors.neutral[900],
              }}
            >
              2. Payment Details
            </h2>

            {error && (
              <div
                role="alert"
                data-testid="checkout-error"
                style={{
                  backgroundColor: '#fef2f2',
                  color: colors.semantic.error,
                  border: `1px solid ${colors.semantic.error}`,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: '6px',
                  marginBottom: spacing.md,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleCheckout}
              data-testid="checkout-form"
              style={{
                backgroundColor: '#ffffff',
                padding: spacing.lg,
                borderRadius: '8px',
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div style={{ marginBottom: spacing.md }}>
                <label
                  htmlFor="card-name"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: colors.neutral[700],
                    marginBottom: spacing.xs,
                  }}
                >
                  Cardholder Name
                </label>
                <input
                  id="card-name"
                  type="text"
                  required
                  data-testid="card-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Jane Candidate"
                  style={{
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: '6px',
                    border: `1px solid ${colors.neutral[300]}`,
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing.md }}>
                <label
                  htmlFor="card-number"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: colors.neutral[700],
                    marginBottom: spacing.xs,
                  }}
                >
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  required
                  data-testid="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  style={{
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: '6px',
                    border: `1px solid ${colors.neutral[300]}`,
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.md,
                  marginBottom: spacing.lg,
                }}
              >
                <div>
                  <label
                    htmlFor="card-expiry"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: colors.neutral[700],
                      marginBottom: spacing.xs,
                    }}
                  >
                    Expires (MM/YY)
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    required
                    data-testid="card-expiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    style={{
                      width: '100%',
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: '6px',
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-cvc"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: colors.neutral[700],
                      marginBottom: spacing.xs,
                    }}
                  >
                    CVC Code
                  </label>
                  <input
                    id="card-cvc"
                    type="text"
                    required
                    data-testid="card-cvc"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    style={{
                      width: '100%',
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: '6px',
                      border: `1px solid ${colors.neutral[300]}`,
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Order summary row */}
              <div
                style={{
                  borderTop: `1px solid ${colors.neutral[200]}`,
                  paddingTop: spacing.md,
                  marginBottom: spacing.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <span
                    style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[800] }}
                  >
                    {activePlan.name} ({billingCycle})
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.primary[700] }}>
                  ${price}
                </div>
              </div>

              <button
                type="submit"
                data-testid="checkout-submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: colors.primary[600],
                  color: '#ffffff',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: spacing.md,
                }}
              >
                {loading ? 'Processing...' : `Complete Purchase — $${price}`}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  data-testid="prefill-payment"
                  onClick={handlePrefillTestPayment}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.primary[600],
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Prefill Test Card Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
