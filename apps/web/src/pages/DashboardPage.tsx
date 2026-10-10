import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { formatDate } from '../lib/format.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  type Application,
  type EvidenceItem,
  type Job,
} from '../lib/types.js';
import { ButtonLink, CheckIcon, Notice, PageHeader, StatusPill } from '../components/ui/index.js';

interface WorkHistorySummary {
  id: string;
  emailVerifiedAt?: string;
  badgeTier: string;
  references?: Array<{ status: string }>;
}

interface Step {
  done: boolean;
  title: string;
  detail: string;
  to: string;
  action: string;
}

/**
 * An ordered list of what to do next, derived from the account's real data.
 * It is numbered because it IS a sequence: each step builds on the last.
 */
const NextSteps: React.FC<{ steps: Step[] }> = ({ steps }) => {
  const remaining = steps.filter((s) => !s.done).length;
  return (
    <section aria-labelledby="next-steps" style={{ marginBottom: spacing['2xl'] }}>
      <h2 id="next-steps" style={{ fontSize: '1.25rem', marginBottom: spacing.xs }}>
        {remaining === 0 ? 'You’re all set' : 'Next steps'}
      </h2>
      <p style={{ color: colors.neutral[600], marginBottom: spacing.md }}>
        {remaining === 0
          ? 'Everything here is done. Keep your work history current as you change roles.'
          : `${steps.length - remaining} of ${steps.length} done.`}
      </p>
      <ol
        style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}
        data-testid="next-steps"
      >
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-testid={`step-${i + 1}`}
            data-done={step.done}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: '#ffffff',
              border: `1px solid ${step.done ? colors.neutral[200] : colors.primary[200]}`,
              borderRadius: '10px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flex: '0 0 32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                backgroundColor: step.done ? '#ecfdf5' : colors.primary[50],
                color: step.done ? colors.semantic.successText : colors.primary[800],
              }}
            >
              {step.done ? <CheckIcon size={16} /> : i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ color: step.done ? colors.neutral[600] : colors.neutral[900] }}>
                {step.title}
                <span className="sr-only">{step.done ? ' (done)' : ''}</span>
              </strong>
              <div style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>{step.detail}</div>
            </div>
            {!step.done && (
              <ButtonLink to={step.to} size="sm" variant="outline">
                {step.action}
              </ButtonLink>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
};

const Figure: React.FC<{ value: React.ReactNode; label: string; testId: string }> = ({
  value,
  label,
  testId,
}) => (
  <div
    style={{
      padding: `${spacing.md} ${spacing.lg}`,
      backgroundColor: '#ffffff',
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: '10px',
    }}
  >
    <div
      data-testid={testId}
      style={{ fontSize: '2rem', fontWeight: 700, color: colors.neutral[900], lineHeight: 1.1 }}
    >
      {value}
    </div>
    <div style={{ color: colors.neutral[600], fontSize: '0.875rem', marginTop: 4 }}>{label}</div>
  </div>
);

const CandidateDashboard: React.FC = () => {
  const session = useSession();
  const profile = session.profile;
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [history, setHistory] = useState<WorkHistorySummary[] | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!session.user) return;
    let cancelled = false;
    Promise.all([
      apiJson<{ applications: Application[] }>('/api/v1/applications/my'),
      apiJson<{ workHistories: WorkHistorySummary[] }>(
        `/api/v1/candidates/${session.user.id}/work-history`
      ),
      apiJson<{ evidence: EvidenceItem[] }>('/api/v1/evidence/mine'),
      apiJson<{ jobs: Job[] }>('/api/v1/jobs'),
    ])
      .then(([a, h, e, j]) => {
        if (cancelled) return;
        setApplications(a.applications);
        setHistory(h.workHistories);
        setEvidence(e.evidence);
        setJobs(j.jobs);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [session.user]);

  if (failed)
    return <Notice tone="error">Could not load your dashboard. Refresh to try again.</Notice>;
  if (!applications || !history || !evidence || !jobs) {
    return (
      <p style={{ color: colors.neutral[600] }} data-testid="dashboard-loading">
        Loading your dashboard…
      </p>
    );
  }

  const active = applications.filter((a) => ACTIVE_APPLICATION_STATUSES.includes(a.status));
  const verifiedRoles = history.filter((h) => h.emailVerifiedAt).length;
  const referencesIn = history.reduce(
    (n, h) => n + (h.references ?? []).filter((r) => r.status === 'submitted').length,
    0
  );
  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const freshJobs = jobs.filter((j) => !appliedJobIds.has(j.id)).slice(0, 3);

  const steps: Step[] = [
    {
      done: Boolean(profile?.headline && profile?.location),
      title: 'Complete your profile',
      detail: 'Add a headline and location so recruiters know what you do and where.',
      to: '/profile',
      action: 'Edit profile',
    },
    {
      done: history.length > 0,
      title: 'Add your work history',
      detail: 'List your current or most recent role.',
      to: '/evidence',
      action: 'Add a role',
    },
    {
      done: verifiedRoles > 0,
      title: 'Verify a role',
      detail: 'Confirm a work email at that employer — it raises the role to bronze.',
      to: '/evidence',
      action: 'Verify',
    },
    {
      done: applications.length > 0,
      title: 'Apply to a job',
      detail: 'Companies see your profile and how your history is verified.',
      to: '/jobs',
      action: 'Browse jobs',
    },
  ];

  return (
    <>
      <NextSteps steps={steps} />

      <section
        aria-label="Summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: spacing.md,
          marginBottom: spacing['2xl'],
        }}
      >
        <Figure
          value={active.length}
          label="Applications in progress"
          testId="figure-active-applications"
        />
        <Figure
          value={`${verifiedRoles} of ${history.length}`}
          label="Roles with a confirmed work email"
          testId="figure-verified-roles"
        />
        <Figure value={referencesIn} label="References received" testId="figure-references" />
        <Figure value={evidence.length} label="Evidence items" testId="figure-evidence" />
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
          gap: spacing.xl,
        }}
      >
        <section aria-labelledby="recent-applications">
          <h2 id="recent-applications" style={{ fontSize: '1.125rem', marginBottom: spacing.sm }}>
            Recent applications
          </h2>
          {applications.length === 0 ? (
            <p style={{ color: colors.neutral[600] }}>
              None yet. <Link to="/jobs">Find a job to apply to.</Link>
            </p>
          ) : (
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}
            >
              {applications.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: spacing.sm,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <Link to={`/jobs/${a.jobId}`}>{a.job?.title ?? 'Job'}</Link>
                    <span style={{ color: colors.neutral[600] }}>
                      {' '}
                      {a.job?.organization?.name ? `at ${a.job.organization.name}` : ''}
                    </span>
                  </span>
                  <StatusPill kind="application" status={a.status} />
                </li>
              ))}
            </ul>
          )}
          {applications.length > 0 && (
            <p style={{ marginTop: spacing.md }}>
              <Link to="/applications">All applications</Link>
            </p>
          )}
        </section>

        <section aria-labelledby="new-jobs">
          <h2 id="new-jobs" style={{ fontSize: '1.125rem', marginBottom: spacing.sm }}>
            New jobs
          </h2>
          {freshJobs.length === 0 ? (
            <p style={{ color: colors.neutral[600] }}>No new roles since you last applied.</p>
          ) : (
            <ul
              style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}
            >
              {freshJobs.map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`} style={{ fontWeight: 600 }}>
                    {j.title}
                  </Link>
                  <div style={{ color: colors.neutral[600], fontSize: '0.875rem' }}>
                    {j.organization?.name}, {j.location}. Posted {formatDate(j.updatedAt)}.
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p style={{ marginTop: spacing.md }}>
            <Link to="/jobs">All jobs</Link>
          </p>
        </section>
      </div>
    </>
  );
};

const RecruiterDashboard: React.FC = () => {
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }> | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiJson<{ organizations: Array<{ id: string; name: string }> }>('/api/v1/organizations/mine')
      .then(async (res) => {
        if (cancelled) return;
        setOrgs(res.organizations);
        if (res.organizations[0]) {
          const j = await apiJson<{ jobs: Job[] }>(
            `/api/v1/organizations/${res.organizations[0].id}/jobs`
          );
          if (!cancelled) setJobs(j.jobs);
        } else {
          setJobs([]);
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed)
    return <Notice tone="error">Could not load your dashboard. Refresh to try again.</Notice>;
  if (!orgs || !jobs)
    return (
      <p style={{ color: colors.neutral[600] }} data-testid="dashboard-loading">
        Loading your dashboard…
      </p>
    );

  const count = (status: string) =>
    jobs.reduce((n, j) => n + (j.applicationCounts?.[status] ?? 0), 0);
  const published = jobs.filter((j) => j.status === 'published').length;
  const activeApplicants = ACTIVE_APPLICATION_STATUSES.reduce((n, s) => n + count(s), 0);
  const anyApplicantMoved = jobs.some((j) =>
    Object.entries(j.applicationCounts ?? {}).some(([s, n]) => s !== 'submitted' && n > 0)
  );

  const steps: Step[] = [
    {
      done: orgs.length > 0,
      title: 'Set up your company',
      detail: 'Jobs are posted on behalf of a company.',
      to: '/hiring',
      action: 'Set up',
    },
    {
      done: jobs.length > 0,
      title: 'Post a job',
      detail: 'Describe the role, location and pay range.',
      to: '/hiring',
      action: 'Post a job',
    },
    {
      done: published > 0,
      title: 'Publish it',
      detail: 'Published jobs appear on the Jobs page.',
      to: '/hiring',
      action: 'Go to jobs',
    },
    {
      done: anyApplicantMoved,
      title: 'Review applicants',
      detail: 'Move people through review, shortlist, interviews and offer.',
      to: '/hiring',
      action: 'Review',
    },
  ];

  return (
    <>
      <NextSteps steps={steps} />
      <section
        aria-label="Summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
          gap: spacing.md,
        }}
      >
        <Figure value={published} label="Published jobs" testId="figure-published-jobs" />
        <Figure
          value={activeApplicants}
          label="Active applicants"
          testId="figure-active-applicants"
        />
        <Figure
          value={count('submitted')}
          label="Waiting for first review"
          testId="figure-unreviewed"
        />
        <Figure value={count('hired')} label="Hired" testId="figure-hired" />
      </section>
    </>
  );
};

export const DashboardPage: React.FC = () => {
  usePageMeta('Dashboard', 'Your applications, work history and what to do next on TalentSphere.');
  const session = useSession();

  const name = session.profile?.fullName;
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <PageHeader
        title={name ?? 'Dashboard'}
        intro={
          session.isRecruiter
            ? session.memberships[0]?.organizationName
              ? `Hiring at ${session.memberships[0].organizationName}.`
              : 'Set up your company to start hiring.'
            : session.profile?.headline || 'Your applications, work history and what to do next.'
        }
        actions={
          session.isRecruiter && !session.isRestricted ? (
            <ButtonLink to="/hiring" data-testid="dashboard-hiring-link">
              Open hiring
            </ButtonLink>
          ) : undefined
        }
      />
      {session.status === 'error' ? (
        <Notice tone="error">We could not confirm your session. Refresh to try again.</Notice>
      ) : session.status !== 'ready' ? (
        <p style={{ color: colors.neutral[600] }} data-testid="dashboard-loading">
          Loading your dashboard…
        </p>
      ) : session.isRestricted ? (
        <Notice tone="warning" data-testid="restricted-notice">
          Your account is restricted after a moderation decision. You can still view your reports,
          appeal, and export or delete your data.
        </Notice>
      ) : session.isRecruiter ? (
        <RecruiterDashboard />
      ) : (
        <CandidateDashboard />
      )}
    </div>
  );
};
