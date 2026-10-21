import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { createStableKeyer } from '../lib/idempotency.js';
import { formatDate } from '../lib/format.js';
import { useSession } from '../lib/SessionContext.js';
import { SessionErrorNotice } from '../components/SessionErrorNotice.js';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Modal,
  Notice,
  PageHeader,
  Select,
  CheckIcon,
  AlertCircleIcon,
  TIER_LABEL,
  VerificationSeal,
  sealStateFor,
  LoadError,
} from '../components/ui/index.js';

// Mirrors the owner view of VerifiedWorkHistory (GET /candidates/:id/work-history):
// every value on this page comes from the API, never from client state.
interface ReferenceSummary {
  id: string;
  refereeName: string;
  relationship: string;
  status: 'requested' | 'submitted' | 'declined' | 'flagged';
  requestedAt: string;
  submittedAt?: string;
}

interface WorkHistoryEntry {
  id: string;
  companyName: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  corporateEmail?: string;
  emailVerifiedAt?: string;
  emailVerificationPending?: { email: string; expiresAt: string };
  verificationStatus: string;
  verificationScore: number;
  badgeTier: 'none' | 'bronze' | 'silver' | 'gold';
  references?: ReferenceSummary[];
}

// Instant feedback only — the server enforces the real policy.
const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.com',
];

const RELATIONSHIP_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'peer', label: 'Peer / colleague' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'direct_report', label: 'Someone who reported to me' },
  { value: 'client', label: 'Client' },
];

const microLabel: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.neutral[700],
  display: 'block',
  marginBottom: spacing.xs,
};

/** Per-record email verification: start a challenge, then confirm the code. */
const EmailVerification: React.FC<{ item: WorkHistoryEntry; onChanged: () => Promise<void> }> = ({
  item,
  onChanged,
}) => {
  const [email, setEmail] = useState(
    item.emailVerificationPending?.email ?? item.corporateEmail ?? ''
  );
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = item.emailVerificationPending;

  if (item.emailVerifiedAt) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          color: colors.semantic.successText,
        }}
      >
        <CheckIcon size={16} />
        <strong style={{ overflowWrap: 'anywhere' }}>{item.corporateEmail}</strong>
        <Badge variant="verified">Email Verified</Badge>
      </div>
    );
  }

  const send = async (address: string) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await apiJson(`/api/v1/candidates/work-history/${item.id}/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ corporateEmail: address }),
      });
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !pending) return;
    setError(null);
    setBusy(true);
    try {
      await apiJson(`/api/v1/candidates/work-history/${item.id}/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ corporateEmail: pending.email, verificationCode: code.trim() }),
      });
      setCode('');
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {error && <LoadError message={error} style={{ marginBottom: spacing.sm }} />}
      {pending ? (
        <form onSubmit={confirm} data-testid={`verify-code-form-${item.id}`}>
          <p
            style={{ fontSize: '0.8125rem', color: colors.neutral[700], marginBottom: spacing.sm }}
          >
            We sent a 6-digit code to <strong>{pending.email}</strong>. It expires{' '}
            {new Date(pending.expiresAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
            .
          </p>
          <Input
            id={`verify-code-${item.id}`}
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            data-testid={`verify-code-input-${item.id}`}
          />
          <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Button
              type="submit"
              size="sm"
              loading={busy}
              data-testid={`verify-code-submit-${item.id}`}
            >
              Confirm email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => void send(pending.email)}
            >
              Send a new code
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(email.trim());
          }}
        >
          <p
            style={{ fontSize: '0.8125rem', color: colors.neutral[600], marginBottom: spacing.sm }}
          >
            <AlertCircleIcon size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Not verified yet. Confirm an email address at this employer.
          </p>
          <Input
            id={`verify-email-${item.id}`}
            label="Work email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            data-testid={`verify-email-input-${item.id}`}
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            loading={busy}
            data-testid={`verify-email-send-${item.id}`}
          >
            Send code
          </Button>
        </form>
      )}
    </div>
  );
};

const REFERENCE_STATUS: Record<ReferenceSummary['status'], string> = {
  requested: 'Waiting for response',
  submitted: 'Received',
  declined: 'Declined',
  flagged: 'Under review',
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Everything that goes with a role when it is removed, in plain words. */
function removalConsequences(item: WorkHistoryEntry): string[] {
  const refs = item.references ?? [];
  const received = refs.filter((r) => r.status === 'submitted');
  const waiting = refs.filter((r) => r.status === 'requested');
  const lines: string[] = [];
  if (received.length > 0) {
    lines.push(
      `${plural(received.length, 'reference', 'references')} you received (${received
        .map((r) => r.refereeName)
        .join(', ')}). They cannot be restored; the referee would have to respond again.`
    );
  }
  if (waiting.length > 0) {
    lines.push(
      `${plural(waiting.length, 'reference request', 'reference requests')} still waiting. The ${
        waiting.length === 1 ? 'link' : 'links'
      } we sent will stop working.`
    );
  }
  if (item.emailVerifiedAt) lines.push('Your confirmed work email for this role.');
  else if (item.emailVerificationPending) {
    lines.push('The verification code we sent to your work email will stop working.');
  }
  return lines;
}

export const EvidencePage: React.FC = () => {
  usePageMeta(
    'Work History',
    'Add your work history, confirm your work email, and ask managers or colleagues to vouch for you.'
  );
  const session = useSession();
  const userId = session.user?.id;

  const [entries, setEntries] = useState<WorkHistoryEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  // One pending flag per form: a shared flag let one form's submission hide
  // (or wipe) the other form's state.
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [refSubmitting, setRefSubmitting] = useState(false);
  // Stable clientRequestId per form — unchanged across retries of an
  // unedited payload so the server can deduplicate replays.
  const addKeyer = useRef(createStableKeyer());
  const refKeyer = useRef(createStableKeyer());

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [email, setEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const [refName, setRefName] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refRole, setRefRole] = useState('manager');
  const [refError, setRefError] = useState<string | null>(null);
  const [refSuccess, setRefSuccess] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<WorkHistoryEntry | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  // The removed role's card (and the button that opened the dialog) is gone,
  // so focus goes to the confirmation instead of falling to the page body.
  const removedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (removed) removedRef.current?.focus();
  }, [removed]);

  const loadEntries = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await apiJson<{ workHistories: WorkHistoryEntry[] }>(
        `/api/v1/candidates/${userId}/work-history`
      );
      setEntries(data.workHistories ?? []);
      setNotice(null);
    } catch {
      // Never render an empty state for data we failed to fetch — say so.
      setNotice('Could not load your work history. Please try again.');
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const resetAddForm = () => {
    setCompany('');
    setTitle('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setEmail('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!company.trim() || !title.trim() || !startDate) {
      setAddError('Please fill in the company, job title and start date.');
      return;
    }
    if (!isCurrent && endDate && new Date(endDate) < new Date(startDate)) {
      setAddError('End date cannot precede employment start date (Anti-fraud BR-084).');
      return;
    }
    const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setAddError('Disposable and temporary email addresses cannot verify employment.');
      return;
    }
    // Re-entry guard in the handler itself — don't rely solely on the
    // disabled attribute for duplicate-request protection.
    if (addSubmitting) return;

    const payload = {
      companyName: company.trim(),
      title: title.trim(),
      startDate,
      isCurrent,
      ...(isCurrent || !endDate ? {} : { endDate }),
    };

    setAddSubmitting(true);
    try {
      const created = await apiJson<{ workHistory: WorkHistoryEntry }>(
        '/api/v1/candidates/work-history',
        {
          method: 'POST',
          body: JSON.stringify({ ...payload, clientRequestId: addKeyer.current(payload) }),
        }
      );

      // A work email starts a verification: a code goes to that mailbox and
      // the record shows "verify" until the code is entered.
      let verifyNotice: string | null = null;
      if (email.trim()) {
        try {
          await apiJson(`/api/v1/candidates/work-history/${created.workHistory.id}/verify-email`, {
            method: 'POST',
            body: JSON.stringify({ corporateEmail: email.trim() }),
          });
        } catch (err) {
          verifyNotice = `Saved, but we could not start email verification: ${errorMessage(err)}`;
        }
      }

      setIsAddModalOpen(false);
      resetAddForm();
      await loadEntries();
      // Set after the refetch, never before: loadEntries clears stale notices
      // on success and would otherwise wipe this message unseen.
      if (verifyNotice) setNotice(verifyNotice);
    } catch (err) {
      setAddError(errorMessage(err));
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefError(null);
    setRefSuccess(null);

    if (!refName.trim() || !refEmail.trim()) {
      setRefError("Please provide the person's name and email address.");
      return;
    }
    const domain = refEmail.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setRefError('Disposable email addresses are not accepted for references (BR-084).');
      return;
    }
    if (!selectedEntryId) {
      setRefError('No employment record selected.');
      return;
    }
    if (refSubmitting) return;

    const payload = {
      workHistoryId: selectedEntryId,
      refereeName: refName.trim(),
      refereeEmail: refEmail.trim(),
      relationship: refRole,
    };

    setRefSubmitting(true);
    try {
      const created = await apiJson<{ reference: { status: ReferenceSummary['status'] } }>(
        `/api/v1/candidates/work-history/${selectedEntryId}/references/request`,
        {
          method: 'POST',
          body: JSON.stringify({
            refereeName: payload.refereeName,
            refereeEmail: payload.refereeEmail,
            relationship: payload.relationship,
            clientRequestId: refKeyer.current(payload),
          }),
        }
      );
      // Server-confirmed state only — the score changes when the referee
      // actually responds, not when we ask.
      const status = REFERENCE_STATUS[created.reference?.status] ?? created.reference?.status;
      setRefSuccess(
        `Request sent to ${payload.refereeEmail} (status: ${status}). They will get a private link to respond.`
      );
      await loadEntries();
      setTimeout(() => {
        setIsRefModalOpen(false);
        setRefSuccess(null);
        setRefName('');
        setRefEmail('');
      }, 1500);
    } catch (err) {
      setRefError(errorMessage(err));
    } finally {
      setRefSubmitting(false);
    }
  };

  const openRemove = (item: WorkHistoryEntry) => {
    setRemoveError(null);
    setRemoved(null);
    setRemoveTarget(item);
  };

  const handleRemove = async () => {
    if (!removeTarget || removeBusy) return;
    const target = removeTarget;
    setRemoveBusy(true);
    setRemoveError(null);
    try {
      await apiJson(`/api/v1/candidates/work-history/${target.id}`, { method: 'DELETE' });
      setRemoveTarget(null);
      await loadEntries();
      setRemoved(`Removed ${target.title} at ${target.companyName} from your work history.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Removed already (another tab, a retry): the outcome the person wanted.
        setRemoveTarget(null);
        await loadEntries();
        setRemoved(`${target.title} at ${target.companyName} was already removed.`);
      } else {
        setRemoveError(errorMessage(err));
      }
    } finally {
      setRemoveBusy(false);
    }
  };

  return (
    <div style={{ paddingBottom: spacing['3xl'] }}>
      <PageHeader
        title="Work history"
        intro="Each role you add gets stronger as you prove it: confirm a work email at that employer, then ask a manager or colleague to vouch for you. Recruiters see how a role was verified — never your private email address."
        actions={
          <Button
            data-testid="add-work-history-btn"
            onClick={() => {
              setRemoved(null);
              setIsAddModalOpen(true);
            }}
          >
            + Add a role
          </Button>
        }
      />

      {notice && (
        <Notice tone="error" data-testid="evidence-notice" style={{ marginBottom: spacing.lg }}>
          {notice}
        </Notice>
      )}
      {removed && (
        <div ref={removedRef} tabIndex={-1} style={{ outline: 'none', marginBottom: spacing.lg }}>
          <Notice tone="success" data-testid="work-history-removed">
            {removed}
          </Notice>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {session.status === 'error' ? (
          // The list waits for the signed-in user; when the session cannot be
          // confirmed (throttled, server fault) it would wait forever, so say
          // so and offer a retry, as Dashboard and Profile do (audit FE-03).
          <SessionErrorNotice />
        ) : loadingList ? (
          <div data-testid="evidence-loading" style={{ color: colors.neutral[600] }}>
            Loading your work history…
          </div>
        ) : entries.length === 0 && !notice ? (
          <div
            data-testid="evidence-empty"
            style={{
              border: `1px dashed ${colors.neutral[300]}`,
              borderRadius: '4px',
              padding: `${spacing.xl} ${spacing.lg}`,
              textAlign: 'center',
              color: colors.neutral[600],
            }}
          >
            No roles yet. Add your current or most recent job to start building verified history.
          </div>
        ) : (
          entries.map((item) => (
            <Card key={item.id} data-testid={`work-history-${item.id}`}>
              <CardHeader
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: spacing.sm,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <CardTitle>
                    {item.title}{' '}
                    <span style={{ color: colors.neutral[600], fontWeight: 400 }}>
                      at {item.companyName}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {formatDate(item.startDate)} —{' '}
                    {item.isCurrent ? 'Present' : formatDate(item.endDate)}
                  </CardDescription>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flex: 'none' }}
                >
                  <VerificationSeal state={sealStateFor(item.badgeTier)} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: colors.neutral[900] }}>
                      {TIER_LABEL[item.badgeTier]}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}
                    >
                      {item.verificationScore} / 100
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                    gap: spacing.lg,
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <span style={microLabel}>Work email</span>
                    <EmailVerification item={item} onChanged={loadEntries} />
                  </div>

                  <div>
                    <span style={microLabel}>References</span>
                    {(item.references ?? []).length > 0 && (
                      <ul
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: `0 0 ${spacing.sm}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        {(item.references ?? []).map((ref) => (
                          <li
                            key={ref.id}
                            data-testid={`reference-${ref.id}`}
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
                          >
                            <span>
                              {ref.refereeName}{' '}
                              <span style={{ color: colors.neutral[600] }}>
                                ({ref.relationship.replace('_', ' ')})
                              </span>
                            </span>
                            <span
                              style={{
                                color:
                                  ref.status === 'submitted'
                                    ? colors.semantic.successText
                                    : colors.neutral[600],
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {REFERENCE_STATUS[ref.status]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`request-ref-${item.id}`}
                      aria-label={`Request a reference — ${item.companyName}`}
                      onClick={() => {
                        setRemoved(null);
                        setSelectedEntryId(item.id);
                        setIsRefModalOpen(true);
                      }}
                    >
                      Request a reference
                    </Button>
                  </div>

                  <div>
                    <span style={microLabel}>Verification score</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                      <div
                        role="progressbar"
                        aria-valuenow={item.verificationScore}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Verification score for ${item.companyName}`}
                        style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: colors.neutral[200],
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${item.verificationScore}%`,
                            height: '100%',
                            backgroundColor:
                              item.verificationScore >= 85
                                ? colors.semantic.success
                                : item.verificationScore >= 40
                                  ? colors.primary[600]
                                  : colors.semantic.warning,
                          }}
                        />
                      </div>
                      <strong style={{ fontSize: '0.8125rem' }}>{item.verificationScore}%</strong>
                    </div>
                    <p
                      style={{ fontSize: '0.75rem', color: colors.neutral[600], marginTop: '6px' }}
                    >
                      Work email +40; manager reference +30 (peer +20); second reference +15; strong
                      ratings +10.
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: spacing.md,
                    paddingTop: spacing.sm,
                    borderTop: `1px solid ${colors.neutral[200]}`,
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`remove-role-${item.id}`}
                    aria-label={`Remove role — ${item.title} at ${item.companyName}`}
                    onClick={() => openRemove(item)}
                  >
                    Remove role
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        busy={addSubmitting}
        title="Add a role"
        description="Dates are checked for consistency. A work email is optional — we will send it a code."
      >
        {addError && (
          <Notice tone="error" data-testid="add-error" style={{ marginBottom: spacing.md }}>
            {addError}
          </Notice>
        )}
        <form onSubmit={handleAddSubmit} data-testid="add-employment-form" noValidate>
          <Input
            id="company-name"
            label="Company"
            placeholder="e.g. Acme Corp"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            data-testid="input-company"
          />
          <Input
            id="job-title"
            label="Job title"
            placeholder="e.g. Backend Engineer"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-title"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
              gap: spacing.md,
            }}
          >
            <Input
              id="start-date"
              type="date"
              label="Start date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-start-date"
            />
            <Input
              id="end-date"
              type="date"
              label="End date"
              disabled={isCurrent}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end-date"
            />
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              marginBottom: spacing.md,
            }}
          >
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              data-testid="input-is-current"
            />
            I currently work here
          </label>
          <Input
            id="corporate-email"
            type="email"
            label="Work email (optional)"
            placeholder="you@company.com"
            helperText="We send a one-time code to confirm you can receive mail there. Personal webmail is not accepted."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-corporate-email"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button
              variant="secondary"
              type="button"
              disabled={addSubmitting}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-employment-btn" loading={addSubmitting}>
              {addSubmitting ? 'Saving…' : 'Save role'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        busy={refSubmitting}
        title="Request a reference"
        description="They receive a private link to confirm your role and dates and rate your work. You never see their answers before they are submitted."
      >
        {refError && (
          <Notice tone="error" data-testid="ref-error" style={{ marginBottom: spacing.md }}>
            {refError}
          </Notice>
        )}
        {refSuccess && (
          <Notice tone="success" data-testid="ref-success" style={{ marginBottom: spacing.md }}>
            {refSuccess}
          </Notice>
        )}
        <form onSubmit={handleReferenceSubmit} data-testid="request-reference-form" noValidate>
          <Input
            id="ref-name"
            label="Their full name"
            required
            value={refName}
            onChange={(e) => setRefName(e.target.value)}
            data-testid="input-ref-name"
          />
          <Input
            id="ref-email"
            type="email"
            label="Their email"
            placeholder="name@company.com"
            required
            value={refEmail}
            onChange={(e) => setRefEmail(e.target.value)}
            data-testid="input-ref-email"
          />
          <Select
            id="ref-role"
            label="How do you know them?"
            value={refRole}
            onChange={(e) => setRefRole(e.target.value)}
            data-testid="select-ref-role"
            options={RELATIONSHIP_OPTIONS}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button
              variant="secondary"
              type="button"
              disabled={refSubmitting}
              onClick={() => setIsRefModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-reference-btn" loading={refSubmitting}>
              {refSubmitting ? 'Sending…' : 'Send request'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        busy={removeBusy}
        title="Remove this role?"
        description={
          removeTarget
            ? `${removeTarget.title} at ${removeTarget.companyName} will be removed from your work history. This cannot be undone.`
            : undefined
        }
      >
        {removeError && (
          <Notice tone="error" data-testid="remove-role-error" style={{ marginBottom: spacing.md }}>
            {removeError}
          </Notice>
        )}
        {removeTarget && (
          <div data-testid="remove-role-consequences" style={{ marginBottom: spacing.lg }}>
            {removalConsequences(removeTarget).length > 0 && (
              <>
                <p style={{ margin: `0 0 ${spacing.xs}`, fontWeight: 600 }}>This also removes:</p>
                <ul
                  style={{
                    margin: `0 0 ${spacing.sm}`,
                    paddingLeft: spacing.lg,
                    color: colors.neutral[700],
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {removalConsequences(removeTarget).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            )}
            <p style={{ margin: 0, color: colors.neutral[700], fontSize: '0.875rem' }}>
              Recruiters will no longer see this role.
            </p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button
            variant="secondary"
            type="button"
            disabled={removeBusy}
            onClick={() => setRemoveTarget(null)}
          >
            Keep it
          </Button>
          <Button
            type="button"
            data-testid="remove-role-confirm"
            loading={removeBusy}
            onClick={() => void handleRemove()}
          >
            {removeBusy ? 'Removing…' : 'Remove role'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
