import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiFetch } from '../lib/api.js';
import { getToken } from '../lib/session.js';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ShieldCheckIcon,
  CheckIcon,
} from '../components/ui/index.js';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  matchScore: number;
  requiredEvidence: string[];
}

const JOBS: JobOpportunity[] = [
  {
    id: 'job-001',
    title: 'Staff Distributed Systems Engineer',
    company: 'CoreDB Infrastructure',
    location: 'Remote (US/Canada)',
    type: 'Full-time',
    salaryMin: 220000,
    salaryMax: 275000,
    currency: 'USD',
    matchScore: 94,
    requiredEvidence: [
      'Gold Tier: Distributed Systems Work History',
      'DKIM Corporate Domain Attestation',
      'Passing score on Transactional Queue Sandbox',
    ],
  },
  {
    id: 'job-002',
    title: 'Lead Platform Reliability Architect',
    company: 'FinTech Ledger Systems',
    location: 'San Francisco, CA / Hybrid',
    type: 'Full-time',
    salaryMin: 240000,
    salaryMax: 290000,
    currency: 'USD',
    matchScore: 88,
    requiredEvidence: [
      'Silver+ Tier: 3+ years Backend Systems',
      'Verified Supervisor Reference',
      'Concurrency & Partition Tolerance Assessment',
    ],
  },
  {
    id: 'job-003',
    title: 'Principal TypeScript / Web Runtime Engineer',
    company: 'NextGen Cloud Edge',
    location: 'Remote (Global)',
    type: 'Full-time',
    salaryMin: 210000,
    salaryMax: 260000,
    currency: 'USD',
    matchScore: 82,
    requiredEvidence: [
      'Cryptographic Evidence of Browser Sandbox Architecture',
      'Verified Open Source / Enterprise Contributions',
    ],
  },
];

export const JobsPage: React.FC = () => {
  usePageMeta(
    'Verifiable Career Opportunities',
    'Browse pre-screened roles matched by verified evidence, supervisor references, and code artifacts — not keywords.'
  );

  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [applyError, setApplyError] = useState<string | null>(null);
  // Per-job pending set (not a single id): parallel applies keep their own
  // visible pending state, and keyed applied flags mean an out-of-order
  // response can never overwrite another job's result.
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  // Hydrate applied state from server truth on mount: a refresh must not
  // re-enable Apply for a job this candidate already applied to. Best-effort —
  // on failure the server's BR-039 409 still protects the real submission.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch('/api/v1/applications/my');
        if (!res.ok) return;
        const data = await res.json();
        const applied: Record<string, boolean> = {};
        for (const application of data.applications ?? []) {
          if (application?.jobId) applied[application.jobId] = true;
        }
        if (!cancelled && Object.keys(applied).length > 0) {
          setAppliedJobs((prev) => ({ ...prev, ...applied }));
        }
      } catch {
        // Hydration is best-effort; BR-039 on the server remains the backstop.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApply = async (jobId: string) => {
    // Re-entry guard in the handler itself — don't rely solely on the
    // disabled attribute for duplicate-request protection.
    if (pendingIds.has(jobId) || appliedJobs[jobId]) return;
    setApplyError(null);
    const token = getToken();
    if (!token) {
      setApplyError('Sign in to apply for this role.');
      return;
    }
    setPendingIds((prev) => new Set(prev).add(jobId));
    try {
      // apiFetch attaches the session token and turns a dead session (401)
      // into a return to sign-in with ?return= — see lib/api.ts.
      const res = await apiFetch(`/api/v1/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 409) {
          // Conflict means the server already holds an active application
          // (BR-039) — reconcile to server truth instead of leaving a dead
          // "Apply" button that would only ever 409 again.
          setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
        }
        setApplyError(
          body?.error?.message ?? 'Application could not be submitted. Please try again.'
        );
        return;
      }
      // Only a 201 from the API may mark this job as applied.
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    } catch {
      setApplyError('Application could not be submitted. Please try again.');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      <div
        style={{
          borderBottom: `1px solid ${colors.neutral[200]}`,
          paddingBottom: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: spacing.xs,
          }}
        >
          <Badge variant="verified">GOVERNED MATCHMAKING</Badge>
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
            Zero Keyword Filters &bull; Evidence-Based Match Scoring
          </span>
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: colors.neutral[900],
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Verifiable Career Opportunities
        </h1>
        <p
          style={{ color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }}
        >
          Pre-screened roles that prioritize immutable evidence, supervisor references, and code
          artifacts.
        </p>
      </div>

      {applyError && (
        <div
          role="alert"
          data-testid="apply-error"
          style={{
            backgroundColor: '#fef2f2',
            color: colors.semantic.errorText,
            border: `1px solid ${colors.semantic.error}`,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: '6px',
            marginBottom: spacing.lg,
            fontSize: '0.875rem',
          }}
        >
          {/* The auth prompt is actionable: the message itself links to
              sign-in with the intended destination preserved. */}
          {applyError === 'Sign in to apply for this role.' ? (
            <Link
              to="/login?return=%2Fjobs"
              style={{ color: colors.primary[700], fontWeight: 600 }}
            >
              Sign in to apply for this role.
            </Link>
          ) : (
            applyError
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {JOBS.map((job) => {
          const isApplied = Boolean(appliedJobs[job.id]);
          const isPending = pendingIds.has(job.id);
          return (
            <Card key={job.id} data-testid={`job-card-${job.id}`}>
              <CardHeader
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: spacing.sm,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <CardTitle>{job.title}</CardTitle>
                    <Badge variant={job.matchScore >= 90 ? 'gold' : 'info'} mono>
                      {job.matchScore}% MATCH
                    </Badge>
                  </div>
                  <CardDescription>
                    {job.company} &bull; {job.location} &bull; {job.type}
                  </CardDescription>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.neutral[900] }}>
                    ${(job.salaryMin / 1000).toFixed(0)}k &ndash; $
                    {(job.salaryMax / 1000).toFixed(0)}k
                  </div>
                  <span style={{ fontSize: '0.75rem', color: colors.neutral[600] }}>
                    Base Compensation (USD)
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div style={{ marginBottom: spacing.md }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: colors.neutral[700],
                      display: 'block',
                      marginBottom: spacing.xs,
                    }}
                  >
                    REQUIRED VERIFIED EVIDENCE:
                  </span>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {job.requiredEvidence.map((ev, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.8125rem',
                          backgroundColor: colors.neutral[100],
                          color: colors.neutral[800],
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShieldCheckIcon size={14} style={{ color: colors.primary[700] }} />
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: spacing.md,
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
                    Deterministic matching powered by RFC-0041 Evidence Graphs.
                  </span>
                  {/* Screen-reader channel: the button's own label change is
                      not announced, so pending and success both get a status. */}
                  <span
                    role="status"
                    data-testid={`apply-status-${job.id}`}
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 0,
                    }}
                  >
                    {isApplied
                      ? `Application submitted for ${job.title}`
                      : isPending
                        ? `Submitting application for ${job.title}`
                        : ''}
                  </span>
                  <Button
                    variant={isApplied ? 'secondary' : 'primary'}
                    size="md"
                    data-testid={`apply-btn-${job.id}`}
                    loading={isPending}
                    disabled={isApplied}
                    onClick={() => void handleApply(job.id)}
                    aria-label={`${
                      isApplied
                        ? 'Application Transmitted'
                        : isPending
                          ? 'Applying'
                          : 'Apply with Evidence Graph'
                    } — ${job.title}`}
                  >
                    {isApplied ? (
                      <>
                        <CheckIcon size={16} /> Application Transmitted
                      </>
                    ) : isPending ? (
                      'Applying…'
                    ) : (
                      'Apply with Evidence Graph'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
