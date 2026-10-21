import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { applicationStatusLabel, formatDate } from '../lib/format.js';
import { createStableKeyer } from '../lib/idempotency.js';
import {
  APPLICATION_TRANSITIONS,
  JOB_TRANSITIONS,
  type Applicant,
  type Job,
} from '../lib/types.js';
import {
  Badge,
  Button,
  Modal,
  Notice,
  PageHeader,
  StatusPill,
  TextArea,
  LoadError,
} from '../components/ui/index.js';

/** Pipeline moves offered to the hiring team, in the order they happen. */
const STAGE_ACTIONS: ReadonlyArray<{ to: string; label: string }> = [
  { to: 'in_review', label: 'Start review' },
  { to: 'shortlisted', label: 'Shortlist' },
  { to: 'interviewing', label: 'Move to interviews' },
  { to: 'offered', label: 'Make offer' },
  { to: 'hired', label: 'Mark hired' },
];

const FILTERS: ReadonlyArray<{ key: string; label: string; statuses: string[] }> = [
  {
    key: 'active',
    label: 'Active',
    statuses: ['submitted', 'in_review', 'shortlisted', 'interviewing', 'offered'],
  },
  { key: 'hired', label: 'Hired', statuses: ['hired'] },
  { key: 'closed', label: 'Not moving forward', statuses: ['rejected', 'withdrawn', 'expired'] },
];

const JOB_ACTIONS: ReadonlyArray<{ to: string; label: string }> = [
  { to: 'published', label: 'Publish' },
  { to: 'paused', label: 'Pause' },
  { to: 'closed', label: 'Close' },
];

export const HiringJobPage: React.FC = () => {
  const { id = '' } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('active');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Applicant | null>(null);
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();
  const [messaging, setMessaging] = useState<Applicant | null>(null);
  const [firstMessage, setFirstMessage] = useState('');
  const [messageBusy, setMessageBusy] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const messageKeyer = React.useRef(createStableKeyer());

  usePageMeta(
    job ? `Applicants — ${job.title}` : 'Applicants',
    'Review and move applicants through your hiring pipeline.'
  );

  const load = useCallback(async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        apiJson<{ job: Job }>(`/api/v1/jobs/${encodeURIComponent(id)}`),
        apiJson<{ applications: Applicant[] }>(
          `/api/v1/jobs/${encodeURIComponent(id)}/applications`
        ),
      ]);
      setJob(jobRes.job);
      setApplicants(appsRes.applications);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError && (err.status === 403 || err.status === 404)
          ? 'This job does not exist or belongs to another company.'
          : errorMessage(err)
      );
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const move = async (applicant: Applicant, targetState: string, why?: string) => {
    if (busyId) return;
    setBusyId(applicant.id);
    setActionError(null);
    try {
      await apiJson(`/api/v1/applications/${applicant.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          applicationId: applicant.id,
          targetState,
          ...(why ? { reason: why } : {}),
        }),
      });
      await load();
      return true;
    } catch (err) {
      setActionError(`${applicant.candidate?.fullName ?? 'Applicant'}: ${errorMessage(err)}`);
      // Another teammate may have moved them already: show server truth.
      await load();
      return false;
    } finally {
      setBusyId(null);
    }
  };

  // Starts the conversation with this applicant (or adds to the one that
  // exists — two people share one) and opens it.
  const sendFirstMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = firstMessage.trim();
    if (!messaging || !content || messageBusy) return;
    setMessageBusy(true);
    setMessageError(null);
    try {
      const res = await apiJson<{ thread: { id: string } }>('/api/v1/threads', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: messaging.candidateId,
          subject: job?.title,
          initialMessage: content,
          clientMessageId: messageKeyer.current({ to: messaging.candidateId, content }),
        }),
      });
      navigate(`/messages/${res.thread.id}`);
    } catch (err) {
      setMessageError(errorMessage(err));
      setMessageBusy(false);
    }
  };

  const changeJobStatus = async (to: string): Promise<boolean> => {
    if (!job || busyId) return false;
    setBusyId(job.id);
    setActionError(null);
    try {
      await apiJson(`/api/v1/jobs/${job.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: to }),
      });
      await load();
      return true;
    } catch (err) {
      setActionError(errorMessage(err));
      return false;
    } finally {
      setBusyId(null);
    }
  };
  // Closing is permanent (a closed job can only be archived), so it is
  // confirmed first, like rejecting an applicant (audit FE-06).
  const [confirmingClose, setConfirmingClose] = useState(false);

  if (error) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <PageHeader title="Applicants" />
        <LoadError message={error} data-testid="hiring-job-error" onRetry={() => void load()} />
        <p style={{ marginTop: spacing.md }}>
          <Link to="/hiring">Back to hiring</Link>
        </p>
      </div>
    );
  }
  if (!job || !applicants) return <p style={{ color: colors.neutral[600] }}>Loading…</p>;

  const current = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const shown = applicants.filter((a) => current.statuses.includes(a.status));
  const jobActions = JOB_ACTIONS.filter((a) => JOB_TRANSITIONS[job.status]?.includes(a.to));

  return (
    <div>
      <Link
        className="back-link"
        to="/hiring"
        style={{ color: colors.primary[700], fontSize: '0.875rem' }}
      >
        All jobs
      </Link>
      <PageHeader
        title={job.title}
        intro={
          <>
            <StatusPill kind="job" status={job.status} data-testid="hiring-job-status" />{' '}
            {job.status === 'published'
              ? 'Visible on the Jobs page and accepting applications.'
              : 'Not visible to candidates.'}{' '}
            <Link to={`/jobs/${job.id}`}>See it as candidates do</Link>
          </>
        }
        actions={jobActions.map((a) => (
          <Button
            key={a.to}
            size="sm"
            variant={a.to === 'published' ? 'primary' : 'outline'}
            loading={busyId === job.id}
            onClick={() =>
              a.to === 'closed' ? setConfirmingClose(true) : void changeJobStatus(a.to)
            }
            data-testid={`job-action-${a.to}`}
          >
            {a.label}
          </Button>
        ))}
      />

      {actionError && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="pipeline-error">
          {actionError}
        </Notice>
      )}

      <div
        // A filter, not tabs: there is no tab panel and no arrow-key model, so
        // toggle buttons in a labelled group describe it truthfully (FE-11).
        role="group"
        aria-label="Filter applicants"
        style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.md, flexWrap: 'wrap' }}
      >
        {FILTERS.map((f) => {
          const count = applicants.filter((a) => f.statuses.includes(a.status)).length;
          const selected = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(f.key)}
              data-testid={`pipeline-filter-${f.key}`}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: `1px solid ${selected ? colors.primary[600] : colors.neutral[300]}`,
                backgroundColor: selected ? colors.primary[50] : '#ffffff',
                color: selected ? colors.primary[800] : colors.neutral[700],
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p
          style={{ color: colors.neutral[600], padding: `${spacing.lg} 0` }}
          data-testid="pipeline-empty"
        >
          {applicants.length === 0
            ? job.status === 'published'
              ? 'No applications yet. They appear here as soon as someone applies.'
              : 'No applications yet. Publish the job so candidates can find it.'
            : 'Nobody in this group.'}
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: '4px',
          }}
        >
          {shown.map((applicant, index) => {
            const next = APPLICATION_TRANSITIONS[applicant.status] ?? [];
            const forward = STAGE_ACTIONS.filter((s) => next.includes(s.to));
            const canReject = next.includes('rejected');
            const summary = applicant.workHistorySummary;
            const isOpen = expanded === applicant.id;
            return (
              <li
                key={applicant.id}
                data-testid={`applicant-${applicant.id}`}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: spacing.md,
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                    <strong style={{ fontSize: '1.0625rem' }}>
                      {applicant.candidate?.fullName ?? 'Candidate'}
                    </strong>{' '}
                    <StatusPill
                      kind="application"
                      status={applicant.status}
                      data-testid={`applicant-status-${applicant.id}`}
                    />
                    {applicant.candidate?.headline && (
                      <div style={{ color: colors.neutral[700] }}>
                        {applicant.candidate.headline}
                      </div>
                    )}
                    <div
                      style={{ color: colors.neutral[600], fontSize: '0.8125rem', marginTop: 4 }}
                    >
                      Applied {formatDate(applicant.submittedAt ?? applicant.createdAt)}
                      {applicant.candidate?.location
                        ? `, ${applicant.candidate.location}`
                        : ''}.{' '}
                      {summary.roles === 0
                        ? 'No work history added.'
                        : `${summary.roles} role${summary.roles === 1 ? '' : 's'} in work history, ${summary.emailVerifiedRoles} with a confirmed work email.`}
                    </div>
                    {summary.bestTier !== 'none' && (
                      <div style={{ marginTop: 6 }}>
                        <Badge variant={summary.bestTier}>
                          Best verified role:{' '}
                          {summary.bestTier[0].toUpperCase() + summary.bestTier.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: spacing.sm,
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                    }}
                  >
                    {forward.map((stage) => (
                      <Button
                        key={stage.to}
                        size="sm"
                        loading={busyId === applicant.id}
                        onClick={() => void move(applicant, stage.to)}
                        data-testid={`move-${stage.to}-${applicant.id}`}
                      >
                        {stage.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFirstMessage('');
                        setMessageError(null);
                        setMessaging(applicant);
                      }}
                      aria-label={`Message ${applicant.candidate?.fullName ?? 'this applicant'}`}
                      data-testid={`message-${applicant.id}`}
                    >
                      Message
                    </Button>
                    {canReject && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === applicant.id}
                        onClick={() => {
                          setReason('');
                          setRejecting(applicant);
                        }}
                        data-testid={`reject-${applicant.id}`}
                      >
                        Don’t move forward
                      </Button>
                    )}
                  </div>
                </div>
                {(applicant.coverLetter || applicant.evidence.length > 0) && (
                  <div style={{ marginTop: spacing.sm }}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : applicant.id)}
                      className="action-link"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: colors.primary[700],
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      {isOpen ? 'Hide application' : 'Read application'}
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          marginTop: spacing.sm,
                          padding: spacing.md,
                          backgroundColor: colors.neutral[50],
                          borderRadius: '4px',
                        }}
                      >
                        {applicant.coverLetter && (
                          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {applicant.coverLetter}
                          </p>
                        )}
                        {applicant.evidence.length > 0 && (
                          <>
                            <p style={{ fontWeight: 600, marginTop: spacing.sm }}>
                              Attached evidence
                            </p>
                            <ul style={{ margin: `${spacing.xs} 0 0`, paddingLeft: spacing.lg }}>
                              {applicant.evidence.map((ev) => (
                                <li key={ev.id}>
                                  {ev.title}{' '}
                                  <span style={{ color: colors.neutral[600] }}>
                                    (
                                    {ev.verificationLevel === 'unverified'
                                      ? 'self-reported'
                                      : ev.verificationLevel.replace('_', ' ')}
                                    )
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {applicant.status === 'rejected' && applicant.rejectionReason && (
                  <p style={{ color: colors.neutral[600], fontSize: '0.8125rem', marginTop: 6 }}>
                    Reason recorded: {applicant.rejectionReason}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        isOpen={rejecting !== null}
        onClose={() => setRejecting(null)}
        busy={busyId !== null}
        title={`Don’t move forward with ${rejecting?.candidate?.fullName ?? 'this applicant'}?`}
        description={`Their status becomes “${applicationStatusLabel('rejected')}”. This cannot be undone.`}
      >
        {/* A failure is shown here, not behind the dialog (audit FE-08). */}
        {actionError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="reject-error">
            {actionError}
          </Notice>
        )}
        <TextArea
          id="reject-reason"
          label="Reason (optional, kept with the application)"
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button variant="secondary" disabled={busyId !== null} onClick={() => setRejecting(null)}>
            Cancel
          </Button>
          <Button
            loading={busyId !== null}
            data-testid="confirm-reject"
            onClick={async () => {
              if (!rejecting) return;
              const ok = await move(rejecting, 'rejected', reason.trim() || undefined);
              if (ok) setRejecting(null);
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={confirmingClose}
        onClose={() => setConfirmingClose(false)}
        busy={busyId !== null}
        title={`Close ${job?.title ?? 'this job'}?`}
        description="A closed job stops taking applications and cannot be reopened. To stop applications for a while, pause it instead."
      >
        {actionError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="close-job-error">
            {actionError}
          </Notice>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button
            variant="secondary"
            disabled={busyId !== null}
            onClick={() => setConfirmingClose(false)}
          >
            Cancel
          </Button>
          <Button
            loading={busyId !== null}
            data-testid="confirm-close-job"
            onClick={async () => {
              if (await changeJobStatus('closed')) setConfirmingClose(false);
            }}
          >
            Close job
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={messaging !== null}
        onClose={() => setMessaging(null)}
        busy={messageBusy}
        title={`Message ${messaging?.candidate?.fullName ?? 'this applicant'}`}
        description={`About ${job?.title ?? 'this job'}. They are notified and can reply from Messages.`}
      >
        <form onSubmit={sendFirstMessage} data-testid="first-message-form" noValidate>
          {messageError && (
            <Notice
              tone="error"
              style={{ marginBottom: spacing.md }}
              data-testid="first-message-error"
            >
              {messageError}
            </Notice>
          )}
          <TextArea
            id="first-message"
            label="Message"
            rows={4}
            maxLength={5000}
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            data-testid="first-message-input"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button
              type="button"
              variant="secondary"
              disabled={messageBusy}
              onClick={() => setMessaging(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={messageBusy}
              disabled={firstMessage.trim().length === 0}
              data-testid="first-message-send"
            >
              {messageBusy ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
