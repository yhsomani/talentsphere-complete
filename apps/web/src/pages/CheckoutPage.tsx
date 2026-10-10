import React from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSession } from '../lib/SessionContext.js';
import { ButtonLink, CheckIcon, PageHeader } from '../components/ui/index.js';

/**
 * Pricing, stated truthfully.
 *
 * No payment processor is integrated (docs/quality/SECURITY.md §9), so there
 * is nothing to buy: the previous checkout collected card numbers it never
 * sent anywhere and "activated" paid plans without payment. Until payments
 * exist, this page says what is free — which is everything that works today.
 */
const PLANS: ReadonlyArray<{
  id: string;
  audience: string;
  price: string;
  features: string[];
  cta: { to: string; label: string };
}> = [
  {
    id: 'candidates',
    audience: 'For people looking for work',
    price: 'Free',
    features: [
      'Add your work history and keep it current',
      'Verify a role by confirming a work email at that employer',
      'Ask managers and colleagues for structured references',
      'Apply to jobs with a note and your evidence attached',
      'Track every application and withdraw at any time',
    ],
    cta: { to: '/signup', label: 'Create a free account' },
  },
  {
    id: 'employers',
    audience: 'For companies hiring',
    price: 'Free during early access',
    features: [
      'Set up your company and post jobs',
      'See how each applicant’s work history was verified',
      'Move applicants through review, shortlist, interviews and offer',
      'Draft, publish, pause and close postings',
    ],
    cta: { to: '/signup?role=recruiter', label: 'Start hiring' },
  },
];

export const CheckoutPage: React.FC = () => {
  usePageMeta('Pricing', 'What TalentSphere costs: it is free while payments are being set up.');
  const session = useSession();
  const signedIn = session.status !== 'anonymous';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="Pricing"
        intro="TalentSphere is free while we finish setting up payments. Everything in the product today is included, and nothing here asks for a card."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
          gap: spacing.lg,
        }}
      >
        {PLANS.map((plan) => (
          <section
            key={plan.id}
            data-testid={`plan-${plan.id}`}
            aria-labelledby={`plan-${plan.id}-title`}
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: '12px',
              padding: spacing.xl,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            <h2
              id={`plan-${plan.id}-title`}
              style={{ fontSize: '1.125rem', color: colors.neutral[700], fontWeight: 600 }}
            >
              {plan.audience}
            </h2>
            <p
              className="serif-display"
              style={{ fontSize: '2.25rem', color: colors.neutral[900] }}
              data-testid={`plan-${plan.id}-price`}
            >
              {plan.price}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: spacing.sm,
                flex: 1,
              }}
            >
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  style={{
                    display: 'flex',
                    gap: spacing.sm,
                    alignItems: 'flex-start',
                    color: colors.neutral[800],
                  }}
                >
                  <CheckIcon
                    size={16}
                    style={{ color: colors.semantic.successText, flex: '0 0 16px', marginTop: 4 }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            {!signedIn && (
              <ButtonLink to={plan.cta.to} data-testid={`plan-${plan.id}-cta`}>
                {plan.cta.label}
              </ButtonLink>
            )}
          </section>
        ))}
      </div>
      <p
        style={{
          color: colors.neutral[600],
          marginTop: spacing.xl,
          maxWidth: '680px',
          lineHeight: 1.6,
        }}
      >
        When paid plans arrive they will add capacity, not credibility: verification will never be
        for sale. A role is verified by the mailbox and the people who can vouch for it.
      </p>
    </div>
  );
};
