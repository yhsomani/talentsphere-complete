import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSession } from '../lib/SessionContext.js';
import { ButtonLink, VerificationSeal, type VerificationState } from '../components/ui/index.js';

/**
 * The example shows the product's one idea: a role gains weight as it is
 * proven. Scores follow the real rules (packages/domain work-history-graph:
 * work email +40, manager reference +30, strong ratings +10). Labelled as an
 * example, not a customer.
 */
const EXAMPLE_ROLES: ReadonlyArray<{
  event: string;
  detail: string;
  state: VerificationState;
  score: number;
}> = [
  {
    event: 'Role added',
    detail: 'Platform Engineer at Northwind, 2021 – 2024',
    state: 'unverified',
    score: 0,
  },
  {
    event: 'Work email confirmed',
    detail: 'A one-time code sent to an @northwind address was entered',
    state: 'work-email',
    score: 40,
  },
  {
    event: 'Manager vouched',
    detail: 'Confirmed title and dates, rated the work 4–5 out of 5',
    state: 'reference',
    score: 80,
  },
];

// Ruled rows, not bullets: the list is a record of what happens, one line each.
const ROW_LIST: React.CSSProperties = {
  listStyle: 'none',
  margin: `${spacing.md} 0 0`,
  padding: 0,
  color: colors.neutral[800],
  lineHeight: 1.6,
};

const ROW: React.CSSProperties = {
  padding: `${spacing.md} 0`,
  borderTop: `1px solid ${colors.neutral[300]}`,
};

export const LandingPage: React.FC = () => {
  usePageMeta(
    'Verified work history and jobs',
    'Add your work history, prove it with your work email and references from people you worked with, and apply to jobs with it.'
  );
  const session = useSession();
  const signedIn = session.status !== 'anonymous';

  return (
    <div style={{ paddingBottom: spacing['3xl'] }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))',
          gap: spacing['2xl'],
          alignItems: 'start',
          padding: `${spacing['3xl']} 0 ${spacing['2xl']}`,
        }}
      >
        <div style={{ minWidth: 0, paddingTop: spacing.md }}>
          <h1
            className="serif-display"
            style={{
              fontSize: 'clamp(2.75rem, 1.4rem + 4vw, 4.25rem)',
              lineHeight: 1.02,
              color: colors.neutral[900],
            }}
          >
            Work history that’s checked, not just claimed.
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: colors.neutral[700],
              margin: `${spacing.lg} 0 ${spacing.xl}`,
              maxWidth: '32em',
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

        <figure style={{ minWidth: 0, margin: 0 }}>
          <ol
            aria-label="Example: how one role gains weight"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: `${spacing.xs} ${spacing.lg}`,
              backgroundColor: colors.surface.card,
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: '4px',
            }}
          >
            {EXAMPLE_ROLES.map((role, i) => (
              <li
                key={role.event}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px minmax(0, 1fr) auto',
                  gap: spacing.md,
                  alignItems: 'center',
                  padding: `${spacing.lg} 0`,
                  borderTop: i === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                }}
              >
                <VerificationSeal state={role.state} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: colors.neutral[900] }}>{role.event}</div>
                  <div style={{ color: colors.neutral[600], fontSize: '0.875rem', marginTop: 2 }}>
                    {role.detail}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{ textAlign: 'right', fontSize: '0.875rem', color: colors.neutral[700] }}
                >
                  {role.score} / 100
                </div>
              </li>
            ))}
          </ol>
          <figcaption
            style={{ fontSize: '0.875rem', color: colors.neutral[600], marginTop: spacing.sm }}
          >
            An example of one role gaining weight. The scores follow the rules the product uses.
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
          borderTop: `1px solid ${colors.neutral[300]}`,
        }}
      >
        <div>
          <h2 className="serif-display" style={{ fontSize: '1.75rem', color: colors.neutral[900] }}>
            Looking for work
          </h2>
          <ul style={ROW_LIST}>
            <li style={ROW}>Keep one record of where you’ve worked, proven step by step.</li>
            <li style={ROW}>Apply to jobs with a short note and the evidence that fits.</li>
            <li style={ROW}>See where each application stands, and withdraw any time.</li>
          </ul>
        </div>
        <div>
          <h2 className="serif-display" style={{ fontSize: '1.75rem', color: colors.neutral[900] }}>
            Hiring
          </h2>
          <ul style={ROW_LIST}>
            <li style={ROW}>Post a job for your company in a few minutes.</li>
            <li style={ROW}>See which of an applicant’s roles are confirmed, and by what.</li>
            <li style={ROW}>Move people from review to offer in one place.</li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="what-we-check"
        style={{ padding: `${spacing['2xl']} 0`, borderTop: `1px solid ${colors.neutral[300]}` }}
      >
        <h2
          id="what-we-check"
          className="serif-display"
          style={{ fontSize: '1.75rem', color: colors.neutral[900] }}
        >
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
