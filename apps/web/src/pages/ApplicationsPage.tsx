import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { ACTIVE_APPLICATION_STATUSES, type Application } from '../lib/types.js';
import {
  Button,
  ButtonLink,
  EmptyState,
  Modal,
  Notice,
  PageHeader,
  StatusPill,
} from '../components/ui/index.js';

/** What the status means for the candidate, in plain words. */
const STATUS_EXPLANATION: Record<string, string> = {
  submitted: 'The hiring team has your application but has not opened it yet.',
  in_review: 'The hiring team is reviewing your application.',
  shortlisted: 'You are on the shortlist.',
  interviewing: 'You are in the interview stage.',
  offered: 'You have an offer. The company will contact you with details.',
  hired: 'You were hired for this role.',
  rejected: 'The company decided not to move forward.',
  withdrawn: 'You withdrew this application.',
  expired: 'This application expired.',
};

export const ApplicationsPage: React.FC = () => {
  usePageMeta('Your applications', 'Track every job you applied to and where each one stands.');
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiJson<{ applications: Application[] }>('/api/v1/applications/my');
      setApplications(res.applications);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmWithdraw = async () => {
    if (!withdrawing || busy) return;
    setBusy(true);
    setWithdrawError(null);
    try {
      await apiJson(`/api/v1/applications/${withdrawing.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ applicationId: withdrawing.id, targetState: 'withdrawn' }),
      });
      setWithdrawing(null);
      await load();
    } catch (err) {
      setWithdrawError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const active = (applications ?? []).filter((a) => ACTIVE_APPLICATION_STATUSES.includes(a.status));
  const closed = (applications ?? []).filter(
    (a) => !ACTIVE_APPLICATION_STATUSES.includes(a.status)
  );

  const renderList = (list: Application[], testId: string) => (
    <ul
      data-testid={testId}
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        backgroundColor: '#ffffff',
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: '10px',
      }}
    >
      {list.map((application, index) => (
        <li
          key={application.id}
          data-testid={`application-${application.id}`}
          style={{
            padding: `${spacing.md} ${spacing.lg}`,
            borderTop: index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            {application.job ? (
              <Link
                to={`/jobs/${application.jobId}`}
                style={{ fontWeight: 700, color: colors.neutral[900], textDecoration: 'none' }}
              >
                {application.job.title}
              </Link>
            ) : (
              <strong>Job no longer available</strong>
            )}
            <div style={{ color: colors.neutral[700] }}>
              {application.job?.organization?.name ?? ''}
            </div>
            <div style={{ color: colors.neutral[600], fontSize: '0.8125rem', marginTop: '4px' }}>
              Applied {formatDate(application.submittedAt ?? application.createdAt)}. Last update{' '}
              {formatDate(application.updatedAt)}. {STATUS_EXPLANATION[application.status]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <StatusPill
              kind="application"
              status={application.status}
              data-testid={`application-status-${application.id}`}
            />
            {ACTIVE_APPLICATION_STATUSES.includes(application.status) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setWithdrawError(null);
                  setWithdrawing(application);
                }}
                data-testid={`withdraw-${application.id}`}
              >
                Withdraw
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="Your applications"
        intro="Every job you applied to and where it stands. Statuses change when the hiring team moves your application."
        actions={
          <ButtonLink to="/jobs" variant="outline">
            Browse jobs
          </ButtonLink>
        }
      />

      {error && <Notice tone="error">Could not load your applications: {error}</Notice>}
      {!error && applications === null && <p style={{ color: colors.neutral[600] }}>Loading…</p>}

      {applications !== null && applications.length === 0 && (
        <EmptyState
          title="You haven’t applied to anything yet"
          description="Find a role that fits and apply — you can attach evidence and a short note."
          action={<ButtonLink to="/jobs">Browse jobs</ButtonLink>}
        />
      )}

      {active.length > 0 && (
        <section aria-labelledby="active-heading" style={{ marginBottom: spacing.xl }}>
          <h2 id="active-heading" style={{ fontSize: '1.125rem', marginBottom: spacing.sm }}>
            In progress ({active.length})
          </h2>
          {renderList(active, 'applications-active')}
        </section>
      )}
      {closed.length > 0 && (
        <section aria-labelledby="closed-heading">
          <h2 id="closed-heading" style={{ fontSize: '1.125rem', marginBottom: spacing.sm }}>
            Closed ({closed.length})
          </h2>
          {renderList(closed, 'applications-closed')}
        </section>
      )}

      <Modal
        isOpen={withdrawing !== null}
        onClose={() => setWithdrawing(null)}
        busy={busy}
        title="Withdraw this application?"
        description={
          withdrawing?.job
            ? `${withdrawing.job.title}${withdrawing.job.organization ? ` at ${withdrawing.job.organization.name}` : ''}. The hiring team will see that you withdrew. You can apply again later.`
            : 'The hiring team will see that you withdrew.'
        }
      >
        {withdrawError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }}>
            {withdrawError}
          </Notice>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button variant="secondary" disabled={busy} onClick={() => setWithdrawing(null)}>
            Keep application
          </Button>
          <Button
            loading={busy}
            onClick={() => void confirmWithdraw()}
            data-testid="confirm-withdraw"
          >
            Withdraw application
          </Button>
        </div>
      </Modal>
    </div>
  );
};
