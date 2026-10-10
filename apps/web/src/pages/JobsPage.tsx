import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { formatDate, formatSalaryRange, jobTypeLabel, workModeLabel } from '../lib/format.js';
import type { Application, Job } from '../lib/types.js';
import {
  ButtonLink,
  EmptyState,
  Input,
  Notice,
  PageHeader,
  Select,
  StatusPill,
} from '../components/ui/index.js';

const WORK_MODE_FILTERS = [
  { value: '', label: 'Any work mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

/** Every posting shown here is a published job from the API — nothing is invented. */
export const JobsPage: React.FC = () => {
  usePageMeta('Jobs', 'Open roles posted by companies hiring on TalentSphere.');
  const session = useSession();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [workMode, setWorkMode] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiJson<{ jobs: Job[] }>('/api/v1/jobs')
      .then((data) => !cancelled && setJobs(data.jobs))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  // Applied state comes from the server so a refresh never re-offers Apply.
  useEffect(() => {
    if (session.status !== 'ready' || session.isRecruiter) return;
    let cancelled = false;
    apiJson<{ applications: Application[] }>('/api/v1/applications/my')
      .then((data) => {
        if (cancelled) return;
        const byJob: Record<string, string> = {};
        for (const a of data.applications) {
          // The most recent application per job wins (re-applying is allowed).
          if (!byJob[a.jobId]) byJob[a.jobId] = a.status;
        }
        setApplied(byJob);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session.status, session.isRecruiter]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (jobs ?? []).filter(
      (job) =>
        (!workMode || job.workMode === workMode) &&
        (!q ||
          [job.title, job.location, job.organization?.name ?? '', job.description]
            .join(' ')
            .toLowerCase()
            .includes(q))
    );
  }, [jobs, query, workMode]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="Jobs"
        intro="Open roles from companies hiring on TalentSphere. Open a role to read the full description and apply."
        actions={
          session.isRecruiter ? (
            <ButtonLink to="/hiring" variant="outline" data-testid="jobs-post-link">
              Post a job
            </ButtonLink>
          ) : undefined
        }
      />

      <div
        role="search"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <Input
          id="jobs-search"
          label="Search"
          type="search"
          placeholder="Title, company or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="jobs-search"
        />
        <Select
          id="jobs-work-mode"
          label="Work mode"
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          options={WORK_MODE_FILTERS}
        />
      </div>

      {error && (
        <Notice tone="error" data-testid="jobs-error">
          Could not load jobs: {error}
        </Notice>
      )}

      {!error && jobs === null && (
        <p data-testid="jobs-loading" style={{ color: colors.neutral[600] }}>
          Loading jobs…
        </p>
      )}

      {jobs !== null && jobs.length === 0 && (
        <EmptyState
          title="No open roles yet"
          description={
            session.isRecruiter
              ? 'Post the first job for your company — it appears here once you publish it.'
              : 'Companies publish roles here as they start hiring. Meanwhile, strengthen your work history so you are ready to apply.'
          }
          action={
            session.isRecruiter ? (
              <ButtonLink to="/hiring">Post a job</ButtonLink>
            ) : (
              <ButtonLink to="/evidence" variant="outline">
                Add work history
              </ButtonLink>
            )
          }
        />
      )}

      {jobs !== null && jobs.length > 0 && (
        <>
          <p aria-live="polite" style={{ color: colors.neutral[600], fontSize: '0.875rem' }}>
            {visible.length === jobs.length
              ? `${jobs.length} open ${jobs.length === 1 ? 'role' : 'roles'}`
              : `${visible.length} of ${jobs.length} roles match`}
          </p>
          <ul
            data-testid="jobs-list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: `${spacing.sm} 0 0`,
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: '10px',
            }}
          >
            {visible.map((job, index) => {
              const facts = [
                job.location,
                job.location
                  .toLowerCase()
                  .includes((workModeLabel(job.workMode) ?? '~').toLowerCase())
                  ? null
                  : workModeLabel(job.workMode),
                jobTypeLabel(job.jobType),
                formatSalaryRange(job.salaryRange),
              ].filter(Boolean);
              const myStatus = applied[job.id];
              return (
                <li
                  key={job.id}
                  data-testid={`job-card-${job.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: spacing.md,
                    padding: `${spacing.md} ${spacing.lg}`,
                    borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 320px' }}>
                    <h2 style={{ fontSize: '1.0625rem', margin: 0 }}>
                      <Link
                        to={`/jobs/${job.id}`}
                        data-testid={`job-link-${job.id}`}
                        style={{
                          color: colors.neutral[900],
                          fontWeight: 700,
                          fontSize: '1.0625rem',
                          textDecoration: 'none',
                        }}
                      >
                        {job.title}
                      </Link>
                    </h2>
                    <div style={{ color: colors.neutral[700], marginTop: '2px' }}>
                      {job.organization?.name ?? 'Company'}
                    </div>
                    <div
                      style={{
                        color: colors.neutral[600],
                        fontSize: '0.8125rem',
                        marginTop: '4px',
                      }}
                    >
                      {facts.join(', ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    {myStatus ? (
                      <StatusPill
                        kind="application"
                        status={myStatus}
                        data-testid={`apply-status-${job.id}`}
                      />
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
                        Posted {formatDate(job.updatedAt)}
                      </span>
                    )}
                    <ButtonLink
                      to={`/jobs/${job.id}`}
                      size="sm"
                      variant="outline"
                      aria-label={`View ${job.title}`}
                    >
                      View
                    </ButtonLink>
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li style={{ padding: spacing.lg, color: colors.neutral[600] }}>
                No roles match these filters.
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};
