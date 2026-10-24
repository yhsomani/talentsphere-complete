import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useSession } from '../lib/SessionContext.js';
import { ButtonLink } from '../components/ui/index.js';
import {
  CandidateArt,
  HeroRecordArt,
  RecruiterArt,
  StepEmailArt,
  StepReferenceArt,
  StepRoleArt,
} from '../components/LandingArt.js';
import '../styles/landing.css';

/**
 * The page shows the product's one idea: a role gains weight as it is proven.
 * Points follow the real rules (packages/domain work-history-graph: work email
 * +40, manager reference +30, strong ratings +10). The pictures are drawn
 * examples, not customers, and the page makes no claim it cannot back.
 */
const STEPS: ReadonlyArray<{
  title: string;
  body: string;
  points: string;
  art: React.ReactNode;
}> = [
  {
    title: 'Add a role',
    body: 'Enter the company, your title and your dates. It starts as a claim, and it is shown that way.',
    points: '0 / 100',
    art: <StepRoleArt />,
  },
  {
    title: 'Confirm with your work email',
    body: 'We send a one-time code to an address at the employer’s domain. Enter it and the role is confirmed.',
    points: '+40',
    art: <StepEmailArt />,
  },
  {
    title: 'Ask a manager to vouch',
    body: 'The person you name gets a private link, confirms your title and dates, and rates the work. Strong ratings add more.',
    points: '+30, up to +10 more',
    art: <StepReferenceArt />,
  },
];

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

const SECTION: React.CSSProperties = {
  padding: `${spacing['3xl']} 0`,
  borderTop: `1px solid ${colors.neutral[300]}`,
};

const H2: React.CSSProperties = {
  fontSize: 'clamp(1.75rem, 1.3rem + 1.4vw, 2.25rem)',
  lineHeight: 1.15,
  color: colors.neutral[900],
};

const PICTURE: React.CSSProperties = {
  margin: 0,
  minWidth: 0,
  border: `1px solid ${colors.neutral[300]}`,
  borderRadius: '6px',
  overflow: 'hidden',
};

export const LandingPage: React.FC = () => {
  usePageMeta(
    'Verified work history and jobs',
    'Add your work history, prove it with your work email and references from people you worked with, and apply to jobs with it.'
  );
  const session = useSession();
  const signedIn = session.status !== 'anonymous';

  return (
    <div style={{ paddingBottom: spacing['2xl'] }}>
      <section
        className="landing-hero"
        style={{ gap: spacing['2xl'], padding: `${spacing['3xl']} 0` }}
      >
        <div style={{ minWidth: 0 }}>
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
        <figure style={{ margin: 0, minWidth: 0 }}>
          <HeroRecordArt />
          <figcaption
            style={{ fontSize: '0.875rem', color: colors.neutral[600], marginTop: spacing.sm }}
          >
            An example record. The work email is confirmed; the manager has not replied yet.
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="how-proven" style={SECTION}>
        <h2 id="how-proven" className="serif-display" style={H2}>
          How a role gets proven
        </h2>
        <p
          style={{
            color: colors.neutral[700],
            lineHeight: 1.6,
            maxWidth: '40em',
            marginTop: spacing.sm,
          }}
        >
          Each step adds points to that one role. Recruiters see which steps were done, not just a
          total.
        </p>
        <ol
          style={{
            listStyle: 'none',
            margin: `${spacing.xl} 0 0`,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: spacing.xl,
          }}
        >
          {STEPS.map((step, i) => (
            <li key={step.title} style={{ minWidth: 0 }}>
              <div style={PICTURE}>{step.art}</div>
              <div
                style={{
                  display: 'flex',
                  gap: spacing.md,
                  alignItems: 'baseline',
                  marginTop: spacing.md,
                }}
              >
                <span
                  className="mono"
                  aria-hidden="true"
                  style={{ color: colors.primary[700], fontWeight: 600 }}
                >
                  {i + 1}
                </span>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    margin: 0,
                    color: colors.neutral[900],
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </h3>
              </div>
              <p
                style={{
                  margin: `${spacing.sm} 0 0`,
                  color: colors.neutral[700],
                  lineHeight: 1.6,
                }}
              >
                {step.body}
              </p>
              <p
                className="mono"
                style={{
                  margin: `${spacing.sm} 0 0`,
                  color: colors.neutral[700],
                  fontSize: '0.875rem',
                }}
              >
                {step.points}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="for-candidates"
        className="landing-split"
        style={{ ...SECTION, gap: spacing['2xl'] }}
      >
        <figure style={PICTURE}>
          <CandidateArt />
        </figure>
        <div style={{ minWidth: 0 }}>
          <h2 id="for-candidates" className="serif-display" style={H2}>
            Looking for work
          </h2>
          <ul style={ROW_LIST}>
            <li style={ROW}>Keep one record of where you’ve worked, proven step by step.</li>
            <li style={ROW}>Apply to jobs with a short note and the evidence that fits.</li>
            <li style={ROW}>See where each application stands, and withdraw any time.</li>
          </ul>
          <div style={{ marginTop: spacing.lg }}>
            <ButtonLink to="/jobs" variant="outline">
              See open jobs
            </ButtonLink>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="for-recruiters"
        className="landing-split landing-split--flip"
        style={{ ...SECTION, gap: spacing['2xl'] }}
      >
        <figure style={PICTURE}>
          <RecruiterArt />
        </figure>
        <div style={{ minWidth: 0 }}>
          <h2 id="for-recruiters" className="serif-display" style={H2}>
            Hiring
          </h2>
          <ul style={ROW_LIST}>
            <li style={ROW}>Post a job for your company in a few minutes.</li>
            <li style={ROW}>See which of an applicant’s roles are confirmed, and by what.</li>
            <li style={ROW}>Move people from review to offer in one place.</li>
          </ul>
          <div style={{ marginTop: spacing.lg }}>
            <ButtonLink to="/signup?role=recruiter" variant="outline">
              Post a job
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="what-we-check" style={SECTION}>
        <h2 id="what-we-check" className="serif-display" style={H2}>
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

      <section
        aria-labelledby="start-now"
        style={{
          padding: `${spacing['2xl']} ${spacing.xl}`,
          backgroundColor: colors.primary[50],
          border: `1px solid ${colors.primary[200]}`,
          borderRadius: '6px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing.lg,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ minWidth: 0, maxWidth: '36em' }}>
          <h2 id="start-now" className="serif-display" style={H2}>
            Start with one role
          </h2>
          <p style={{ margin: `${spacing.sm} 0 0`, color: colors.neutral[800], lineHeight: 1.6 }}>
            Add your current job and confirm it with your work email. It takes a few minutes.
          </p>
        </div>
        <ButtonLink to={signedIn ? '/dashboard' : '/signup'} size="lg">
          {signedIn ? 'Go to your dashboard' : 'Create a free account'}
        </ButtonLink>
      </section>
    </div>
  );
};
