import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSession } from '../lib/SessionContext.js';
import { ButtonLink } from '../components/ui/index.js';

/**
 * The example shows the product's one idea — a role gaining weight as it is
 * proven — using the real scoring rules (packages/domain work-history-graph:
 * work email +40, manager reference +30, strong ratings +10; bronze ≥25,
 * silver ≥50, gold ≥80). It is labelled as an example, not a customer.
 */
const EXAMPLE_STEPS: ReadonlyArray<{ event: string; detail: string; tier: string; score: number }> =
  [
    {
      event: 'Role added',
      detail: 'Platform Engineer at Northwind, 2021 – 2024',
      tier: 'Unverified',
      score: 0,
    },
    {
      event: 'Work email confirmed',
      detail: 'A one-time code sent to an @northwind address was entered',
      tier: 'Bronze',
      score: 40,
    },
    {
      event: 'Manager vouched',
      detail: 'Confirmed title and dates, rated the work 4–5 out of 5',
      tier: 'Gold',
      score: 80,
    },
  ];

const TIER_COLOR: Record<string, string> = {
  Unverified: colors.neutral[600],
  Bronze: '#9a5a1f',
  Gold: '#8a6100',
};

export const LandingPage: React.FC = () => {
  usePageMeta(
    'Verified work history and jobs',
    'Add your work history, prove it with your work email and references from people you worked with, and apply to jobs with it.'
  );
  const session = useSession();
  const signedIn = session.status !== 'anonymous';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing['2xl'],
          alignItems: 'center',
          padding: `${spacing['2xl']} 0 ${spacing['3xl']}`,
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 0 }}>
          <h1
            className="serif-display"
            style={{
              fontSize: 'clamp(2.5rem, 1.6rem + 3.2vw, 4rem)',
              lineHeight: 1.05,
              color: colors.neutral[900],
              letterSpacing: '-0.02em',
            }}
          >
            Work history that’s checked, not just claimed.
          </h1>
          <p
            style={{
              fontSize: '1.1875rem',
              lineHeight: 1.6,
              color: colors.neutral[700],
              margin: `${spacing.lg} 0 ${spacing.xl}`,
              maxWidth: '34em',
            }}
          >
            Add the roles you’ve held. Confirm each one with a code sent to your work email, and ask
            the people you worked with to vouch for you. Companies hiring here see exactly how every
            role was verified.
          </p>
          <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
            {signedIn ? (
              <ButtonLink to="/dashboard" size="lg" data-testid="cta-dashboard">
                Go to your dashboard
              </ButtonLink>
            ) : (
              <ButtonLink to="/signup" size="lg" data-testid="cta-signup">
                Create a free account
              </ButtonLink>
            )}
            <ButtonLink to="/jobs" size="lg" variant="outline" data-testid="cta-jobs">
              Browse jobs
            </ButtonLink>
          </div>
          <p style={{ marginTop: spacing.lg, color: colors.neutral[600] }}>
            Hiring?{' '}
            <Link
              to="/signup?role=recruiter"
              style={{ color: colors.primary[700], fontWeight: 600 }}
            >
              Post jobs for free during early access
            </Link>
            .
          </p>
        </div>

        <figure style={{ flex: '1 1 380px', minWidth: 0, margin: 0 }}>
          <ol
            aria-label="Example: how one role gains weight"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: spacing.lg,
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: '14px',
            }}
          >
            {EXAMPLE_STEPS.map((step, i) => (
              <li
                key={step.event}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: spacing.md,
                  alignItems: 'start',
                  padding: `${spacing.md} 0`,
                  borderTop: i === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: i === 0 ? colors.neutral[100] : '#ecfdf5',
                    color: i === 0 ? colors.neutral[600] : colors.semantic.successText,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ color: colors.neutral[900] }}>{step.event}</strong>
                  <div style={{ color: colors.neutral[600], fontSize: '0.875rem', marginTop: 2 }}>
                    {step.detail}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: TIER_COLOR[step.tier] }}>{step.tier}</div>
                  <div style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
                    {step.score} / 100
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <figcaption
            style={{ fontSize: '0.8125rem', color: colors.neutral[600], marginTop: spacing.sm }}
          >
            An example of one role gaining weight. Scores follow the same rules the product uses.
          </figcaption>
        </figure>
      </section>

      <section
        aria-label="Who it is for"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: spacing['2xl'],
          padding: `${spacing['2xl']} 0`,
          borderTop: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Looking for work</h2>
          <ul
            style={{
              margin: `${spacing.md} 0 0`,
              paddingLeft: spacing.lg,
              lineHeight: 1.8,
              color: colors.neutral[800],
            }}
          >
            <li>Keep one record of where you’ve worked, proven step by step.</li>
            <li>Apply to jobs with a short note and the evidence that fits.</li>
            <li>See where each application stands, and withdraw any time.</li>
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Hiring</h2>
          <ul
            style={{
              margin: `${spacing.md} 0 0`,
              paddingLeft: spacing.lg,
              lineHeight: 1.8,
              color: colors.neutral[800],
            }}
          >
            <li>Post a job for your company in a few minutes.</li>
            <li>See which of an applicant’s roles are confirmed, and by what.</li>
            <li>Move people from review to offer in one place.</li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="what-we-check"
        style={{ padding: `${spacing['2xl']} 0`, borderTop: `1px solid ${colors.neutral[200]}` }}
      >
        <h2 id="what-we-check" style={{ fontSize: '1.5rem' }}>
          What “verified” means here
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: spacing['2xl'],
            marginTop: spacing.lg,
            color: colors.neutral[800],
            lineHeight: 1.7,
          }}
        >
          <p>
            <strong>We check</strong> that you can receive mail at the employer’s domain — by
            sending a code you have to enter — and that a person you name confirms your title and
            dates from a private link only they receive. Personal webmail and disposable addresses
            don’t count.
          </p>
          <p>
            <strong>We don’t</strong> show your work email to recruiters, let you see or edit a
            reference before it is submitted, or sell verification. A paid plan will never make a
            role look more verified than it is.
          </p>
        </div>
      </section>
    </div>
  );
};
