import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { formatDate, formatSalaryRange, jobTypeLabel, workModeLabel } from '../lib/format.js';
import type { Application, EvidenceItem, Job, OrganizationRef, Skill } from '../lib/types.js';
import {
  Button,
  ButtonLink,
  Card,
  CardContent,
  Notice,
  StatusPill,
  TextArea,
} from '../components/ui/index.js';

interface JobResponse {
  job: Job;
  organization?: OrganizationRef & { website?: string; description?: string };
  requiredSkills: Skill[];
}

const COVER_LETTER_MAX = 3000;

export const JobDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const session = useSession();
  const [data, setData] = useState<JobResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [attached, setAttached] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const inFlight = useRef(false);
  // The job this page is showing right now. A submission started on one job
  // must never land on another if the user navigates while it is in flight.
  const currentJobId = useRef(id);
  currentJobId.current = id;

  usePageMeta(
    data ? `${data.job.title} at ${data.organization?.name ?? 'a company'}` : 'Job',
    data ? data.job.description.slice(0, 150) : 'Job details on TalentSphere.'
  );

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setLoadError(null);
    setMyApplication(null);
    setApplyError(null);
    setCoverLetter('');
    setAttached([]);
    apiJson<JobResponse>(`/api/v1/jobs/${encodeURIComponent(id)}`)
      .then((res) => !cancelled && setData(res))
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? 'This job does not exist or is no longer open.'
            : errorMessage(err)
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canApply = session.status === 'ready' && !session.isRecruiter && !session.isRestricted;

  useEffect(() => {
    if (!canApply) return;
    let cancelled = false;
    apiJson<{ applications: Application[] }>('/api/v1/applications/my')
      .then((res) => {
        if (cancelled) return;
        setMyApplication(res.applications.find((a) => a.jobId === id) ?? null);
      })
      .catch(() => undefined);
    apiJson<{ evidence: EvidenceItem[] }>('/api/v1/evidence/mine')
      .then((res) => !cancelled && setEvidence(res.evidence))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [canApply, id]);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    // Re-entry guard: a double click must not send two submissions.
    if (inFlight.current) return;
    inFlight.current = true;
    const forJob = id;
    const stillHere = () => currentJobId.current === forJob;
    setSubmitting(true);
    setApplyError(null);
    try {
      const res = await apiJson<{ application: Application }>(
        `/api/v1/jobs/${encodeURIComponent(forJob)}/apply`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...(coverLetter.trim() ? { coverLetter: coverLetter.trim() } : {}),
            ...(attached.length > 0 ? { attachedEvidenceIds: attached } : {}),
          }),
        }
      );
      if (stillHere()) setMyApplication(res.application);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already applied (another tab, a lost response): show server truth.
        const mine = await apiJson<{ applications: Application[] }>('/api/v1/applications/my')
          .then((r) => r.applications.find((a) => a.jobId === forJob) ?? null)
          .catch(() => null);
        if (mine) {
          if (stillHere()) setMyApplication(mine);
          return;
        }
      }
      if (stillHere()) setApplyError(errorMessage(err));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h1 className="serif-display" style={{ fontSize: '2rem', fontWeight: 500 }}>
          Job not available
        </h1>
        <Notice tone="error" style={{ margin: `${spacing.md} 0` }} data-testid="job-error">
          {loadError}
        </Notice>
        <ButtonLink to="/jobs" variant="outline">
          Back to jobs
        </ButtonLink>
      </div>
    );
  }

  if (!data) {
    return (
      <p style={{ color: colors.neutral[600] }} data-testid="job-loading">
        Loading job…
      </p>
    );
  }

  const { job, organization, requiredSkills } = data;
  const facts = [
    job.location,
    job.location.toLowerCase().includes((workModeLabel(job.workMode) ?? '~').toLowerCase())
      ? null
      : workModeLabel(job.workMode),
    jobTypeLabel(job.jobType),
    formatSalaryRange(job.salaryRange),
  ].filter(Boolean);
  const isOpen = job.status === 'published';

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing.xl,
        alignItems: 'flex-start',
      }}
    >
      <article style={{ flex: '2 1 460px', minWidth: 0 }}>
        <Link to="/jobs" style={{ color: colors.primary[700], fontSize: '0.875rem' }}>
          ← All jobs
        </Link>
        <h1
          className="serif-display"
          style={{
            fontSize: 'clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem)',
            fontWeight: 500,
            marginTop: spacing.sm,
          }}
        >
          {job.title}
        </h1>
        <p style={{ fontSize: '1.0625rem', color: colors.neutral[800], marginTop: spacing.xs }}>
          {organization?.name ?? 'Company'}
        </p>
        <p style={{ color: colors.neutral[600], marginTop: '4px' }}>{facts.join(', ')}</p>
        {!isOpen && (
          <Notice tone="warning" style={{ marginTop: spacing.md }}>
            This posting is {job.status} and is not accepting applications.
          </Notice>
        )}

        <h2 style={{ fontSize: '1.125rem', marginTop: spacing.xl }}>About the role</h2>
        <p
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7,
            color: colors.neutral[800],
            marginTop: spacing.sm,
          }}
        >
          {job.description}
        </p>

        {requiredSkills.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.125rem', marginTop: spacing.xl }}>
              Skills they’re looking for
            </h2>
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing.sm,
                padding: 0,
                listStyle: 'none',
                marginTop: spacing.sm,
              }}
            >
              {requiredSkills.map((skill) => (
                <li
                  key={skill.id}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    border: `1px solid ${colors.neutral[300]}`,
                    fontSize: '0.875rem',
                  }}
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </>
        )}

        {organization?.description && (
          <>
            <h2 style={{ fontSize: '1.125rem', marginTop: spacing.xl }}>
              About {organization.name}
            </h2>
            <p style={{ lineHeight: 1.7, color: colors.neutral[800], marginTop: spacing.sm }}>
              {organization.description}
            </p>
          </>
        )}
      </article>

      <aside
        aria-label="Apply"
        style={{ flex: '1 1 280px', minWidth: 0, position: 'sticky', top: '88px' }}
      >
        <Card>
          <CardContent style={{ padding: spacing.lg }}>
            {myApplication ? (
              <div data-testid="apply-done">
                <h2 style={{ fontSize: '1.125rem' }}>You applied</h2>
                <p style={{ color: colors.neutral[700], margin: `${spacing.sm} 0` }}>
                  Sent {formatDate(myApplication.submittedAt ?? myApplication.createdAt)}. Current
                  status:
                </p>
                <StatusPill
                  kind="application"
                  status={myApplication.status}
                  data-testid={`apply-status-${job.id}`}
                />
                <p style={{ marginTop: spacing.md }}>
                  <Link to="/applications" style={{ color: colors.primary[700], fontWeight: 600 }}>
                    Track all your applications
                  </Link>
                </p>
              </div>
            ) : session.status === 'anonymous' ? (
              <div>
                <h2 style={{ fontSize: '1.125rem' }}>Interested?</h2>
                <p style={{ color: colors.neutral[700], margin: `${spacing.sm} 0 ${spacing.md}` }}>
                  Sign in or create a free account to apply.
                </p>
                <ButtonLink
                  to={`/login?return=${encodeURIComponent(`/jobs/${job.id}`)}`}
                  data-testid="apply-signin"
                  style={{ width: '100%' }}
                >
                  Sign in to apply
                </ButtonLink>
              </div>
            ) : session.isRecruiter ? (
              <p style={{ color: colors.neutral[700] }}>
                You’re signed in with a hiring account. Applications come from candidate accounts.
              </p>
            ) : session.isRestricted ? (
              <Notice tone="warning">
                Your account is restricted, so you can’t apply right now.
              </Notice>
            ) : !isOpen ? (
              <p style={{ color: colors.neutral[700] }}>This role is not accepting applications.</p>
            ) : (
              <form onSubmit={apply} data-testid="apply-form">
                <h2 style={{ fontSize: '1.125rem', marginBottom: spacing.md }}>
                  Apply for this role
                </h2>
                {applyError && (
                  <Notice
                    tone="error"
                    data-testid="apply-error"
                    style={{ marginBottom: spacing.md }}
                  >
                    {applyError}
                  </Notice>
                )}
                <TextArea
                  id="cover-letter"
                  label="Note to the hiring team (optional)"
                  maxLength={COVER_LETTER_MAX}
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  helperText={`${coverLetter.length}/${COVER_LETTER_MAX} characters`}
                  data-testid="apply-cover-letter"
                />
                {evidence.length > 0 && (
                  <fieldset style={{ border: 'none', padding: 0, margin: `0 0 ${spacing.md}` }}>
                    <legend
                      style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: spacing.xs }}
                    >
                      Attach evidence (optional)
                    </legend>
                    {evidence.map((item) => (
                      <label
                        key={item.id}
                        style={{
                          display: 'flex',
                          gap: spacing.sm,
                          fontSize: '0.875rem',
                          padding: '4px 0',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={attached.includes(item.id)}
                          onChange={(e) =>
                            setAttached((current) =>
                              e.target.checked
                                ? [...current, item.id]
                                : current.filter((x) => x !== item.id)
                            )
                          }
                        />
                        {item.title}
                      </label>
                    ))}
                  </fieldset>
                )}
                <p role="status" data-testid="apply-progress" className="sr-only">
                  {submitting ? 'Sending your application…' : ''}
                </p>
                <Button
                  type="submit"
                  loading={submitting}
                  style={{ width: '100%' }}
                  data-testid={`apply-btn-${job.id}`}
                >
                  {submitting ? 'Sending application…' : 'Send application'}
                </Button>
                <p
                  style={{ fontSize: '0.75rem', color: colors.neutral[600], marginTop: spacing.sm }}
                >
                  The hiring team sees your profile, your note, the evidence you attach and how your
                  work history is verified.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};
