import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
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
  CheckIcon,
  AlertCircleIcon,
} from '../components/ui/index.js';

// Mirrors VerifiedWorkHistory in packages/domain/src/work-history-graph.ts —
// every field shown on this page comes from the API, never from client state.
interface WorkHistoryEntry {
  id: string;
  companyName: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  corporateEmail?: string;
  emailVerifiedAt?: string;
  verificationStatus: string;
  verificationScore: number;
  badgeTier: 'none' | 'bronze' | 'silver' | 'gold';
}

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.com',
];

export const EvidencePage: React.FC = () => {
  usePageMeta(
    'Evidence Graph',
    'Attest work history, request verified supervisor references, and manage your immutable cryptographic evidence graph.'
  );

  const [entries, setEntries] = useState<WorkHistoryEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [signedIn] = useState(() =>
    Boolean(localStorage.getItem('talentsphere_token') && localStorage.getItem('talentsphere_user'))
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Add Work History
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [email, setEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Form states for Request Reference
  const [refName, setRefName] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refRole, setRefRole] = useState('manager');
  const [refError, setRefError] = useState<string | null>(null);
  const [refSuccess, setRefSuccess] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    const token = localStorage.getItem('talentsphere_token');
    const rawUser = localStorage.getItem('talentsphere_user');
    let userId: string | undefined;
    try {
      userId = rawUser ? (JSON.parse(rawUser) as { id?: string }).id : undefined;
    } catch {
      userId = undefined;
    }
    if (!token || !userId) {
      setEntries([]);
      setLoadingList(false);
      return;
    }
    try {
      const res = await fetch(`/api/v1/candidates/${userId}/work-history`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('load failed');
      }
      const data = await res.json();
      setEntries(data.workHistories ?? []);
      setNotice(null);
    } catch {
      // Never render an empty state for data we failed to fetch — say so.
      setNotice('Could not load your attestations. Please try again.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!company.trim() || !title.trim() || !startDate) {
      setAddError('Please fill in all required employment fields.');
      return;
    }

    if (!isCurrent && endDate && new Date(endDate) < new Date(startDate)) {
      setAddError('End date cannot precede employment start date (Anti-fraud BR-084).');
      return;
    }

    const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setAddError(
        'Disposable and temporary email addresses are rejected for corporate attestation.'
      );
      return;
    }

    const token = localStorage.getItem('talentsphere_token');
    if (!token) {
      setAddError('Please sign in before attesting work history.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/candidates/work-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: company,
          title,
          startDate,
          isCurrent,
          ...(isCurrent || !endDate ? {} : { endDate }),
          ...(email ? { corporateEmail: email } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setAddError(body?.error?.message ?? 'Attestation could not be saved. Please try again.');
        return;
      }

      const created = await res.json();
      const createdId = created?.workHistory?.id as string | undefined;

      // Email attestation runs server-side (disposable/webmail checks, scoring, tier).
      if (createdId && email) {
        const verifyRes = await fetch(`/api/v1/candidates/work-history/${createdId}/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ corporateEmail: email }),
        });
        if (!verifyRes.ok) {
          const body = await verifyRes.json().catch(() => null);
          setNotice(
            `Record saved, but the email attestation was rejected: ${
              body?.error?.message ?? 'verification failed.'
            }`
          );
        }
      }

      setIsAddModalOpen(false);
      setCompany('');
      setTitle('');
      setStartDate('');
      setEndDate('');
      setEmail('');
      await loadEntries();
    } catch {
      setAddError('Attestation could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefError(null);
    setRefSuccess(null);

    if (!refName.trim() || !refEmail.trim()) {
      setRefError('Please provide referee name and corporate email address.');
      return;
    }

    const domain = refEmail.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setRefError(
        'Disposable email addresses are strictly prohibited for manager references (BR-084).'
      );
      return;
    }

    const token = localStorage.getItem('talentsphere_token');
    if (!token) {
      setRefError('Please sign in before requesting references.');
      return;
    }
    if (!selectedEntryId) {
      setRefError('No employment record selected.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/candidates/work-history/${selectedEntryId}/references/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refereeName: refName,
            refereeEmail: refEmail,
            relationship: refRole,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setRefError(body?.error?.message ?? 'Reference request could not be created.');
        return;
      }

      const data = await res.json();
      // Server-confirmed state only — the tier and score update when the
      // referee actually submits, not when we ask.
      setRefSuccess(
        `Reference request created for ${refEmail} (status: ${data?.reference?.status ?? 'requested'}).`
      );
      setTimeout(() => {
        setIsRefModalOpen(false);
        setRefSuccess(null);
        setRefName('');
        setRefEmail('');
      }, 1200);
    } catch {
      setRefError('Reference request could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      {/* Header with Title and Add Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: `1px solid ${colors.neutral[200]}`,
          paddingBottom: spacing.lg,
          marginBottom: spacing.xl,
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: spacing.xs,
            }}
          >
            <Badge variant="verified">VERIFIED EVIDENCE GRAPH</Badge>
            <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
              RFC-0041 Cryptographic Credentials
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
            Verified Work History &amp; References
          </h1>
          <p
            style={{
              color: colors.neutral[600],
              fontSize: '0.9375rem',
              margin: `${spacing.xs} 0 0`,
            }}
          >
            Immutable employment attestations with domain checks and structured supervisor ratings.
          </p>
        </div>

        <Button
          data-testid="add-work-history-btn"
          onClick={() => setIsAddModalOpen(true)}
          size="md"
        >
          + Attest Employment Record
        </Button>
      </div>

      {/* Page-level notice: never claim emptiness when the fetch itself failed */}
      {notice && (
        <div
          role="alert"
          data-testid="evidence-notice"
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
          {notice}
        </div>
      )}

      {/* Work History Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {!signedIn ? (
          <div
            data-testid="evidence-signin-required"
            style={{
              border: `1px dashed ${colors.neutral[300]}`,
              borderRadius: '8px',
              padding: `${spacing.xl} ${spacing.lg}`,
              textAlign: 'center',
              color: colors.neutral[600],
              fontSize: '0.9375rem',
            }}
          >
            Sign in to attest and verify your employment records.
          </div>
        ) : loadingList ? (
          <div
            data-testid="evidence-loading"
            style={{ color: colors.neutral[600], fontSize: '0.9375rem' }}
          >
            Loading attestations…
          </div>
        ) : entries.length === 0 && !notice ? (
          <div
            data-testid="evidence-empty"
            style={{
              border: `1px dashed ${colors.neutral[300]}`,
              borderRadius: '8px',
              padding: `${spacing.xl} ${spacing.lg}`,
              textAlign: 'center',
              color: colors.neutral[600],
              fontSize: '0.9375rem',
            }}
          >
            No employment attestations yet. Add your first record above.
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <CardTitle>{item.title}</CardTitle>
                    <span style={{ color: colors.neutral[400] }}>&bull;</span>
                    <strong style={{ fontSize: '1rem', color: colors.neutral[700] }}>
                      {item.companyName}
                    </strong>
                  </div>
                  <CardDescription>
                    {item.startDate} &mdash; {item.isCurrent ? 'Present' : (item.endDate ?? '—')}{' '}
                    &bull; {item.verificationStatus}
                  </CardDescription>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <Badge variant={item.badgeTier === 'none' ? 'neutral' : item.badgeTier} mono>
                    {item.badgeTier === 'none'
                      ? 'UNVERIFIED'
                      : `${item.badgeTier.toUpperCase()} TIER`}
                    &bull; {item.verificationScore}/100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                    gap: spacing.lg,
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.neutral[600],
                        display: 'block',
                        marginBottom: spacing.xs,
                      }}
                    >
                      DOMAIN ATTESTATION
                    </span>
                    {item.emailVerifiedAt ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: colors.semantic.successText,
                        }}
                      >
                        <CheckIcon size={16} />
                        <strong>{item.corporateEmail}</strong>
                        <Badge variant="verified">Email Verified</Badge>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: colors.neutral[600],
                        }}
                      >
                        <AlertCircleIcon size={16} />
                        <span>No corporate email attested</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.neutral[600],
                        display: 'block',
                        marginBottom: spacing.xs,
                      }}
                    >
                      STRUCTURED REFERENCE
                    </span>
                    {/* Reference state is not readable back from the API yet, so
                      this column offers the action instead of asserting state. */}
                    <div>
                      <span
                        style={{
                          color: colors.neutral[600],
                          display: 'block',
                          marginBottom: spacing.xs,
                        }}
                      >
                        Request a structured reference from a supervisor.
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`request-ref-${item.id}`}
                        onClick={() => {
                          setSelectedEntryId(item.id);
                          setIsRefModalOpen(true);
                        }}
                      >
                        Request Reference
                      </Button>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.neutral[600],
                        display: 'block',
                        marginBottom: spacing.xs,
                      }}
                    >
                      CONFIDENCE INTEGRITY
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        marginTop: '4px',
                      }}
                    >
                      <div
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
                                : item.verificationScore >= 70
                                  ? colors.primary[600]
                                  : colors.semantic.warning,
                          }}
                        />
                      </div>
                      <strong style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>
                        {item.verificationScore}%
                      </strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Employment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Attest Employment Record"
        description="Submit employment history with start/end date invariants and corporate email verification."
      >
        {addError && (
          <div
            role="alert"
            data-testid="add-error"
            style={{
              backgroundColor: '#fef2f2',
              color: colors.semantic.errorText,
              border: `1px solid ${colors.semantic.error}`,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              marginBottom: spacing.md,
              fontSize: '0.875rem',
            }}
          >
            {addError}
          </div>
        )}

        <form onSubmit={handleAddSubmit} data-testid="add-employment-form">
          <Input
            id="company-name"
            label="Company Name"
            placeholder="e.g. Stripe, Acme Corp"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            data-testid="input-company"
          />

          <Input
            id="job-title"
            label="Job Title"
            placeholder="e.g. Senior Backend Engineer"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-title"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <Input
              id="start-date"
              type="date"
              label="Start Date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-start-date"
            />
            <Input
              id="end-date"
              type="date"
              label="End Date"
              disabled={isCurrent}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end-date"
            />
          </div>

          <div style={{ marginBottom: spacing.md }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                data-testid="input-is-current"
              />
              <span>I currently work in this role</span>
            </label>
          </div>

          <Input
            id="corporate-email"
            type="email"
            label="Corporate Email (for domain attestation)"
            placeholder="you@company.com"
            helperText="Checked server-side against disposable and generic webmail domains."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-corporate-email"
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing.sm,
              marginTop: spacing.lg,
            }}
          >
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              data-testid="submit-employment-btn"
              disabled={submitting}
            >
              Attest Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Reference Modal */}
      <Modal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        title="Request Structured Reference"
        description="Create a structured reference request for a supervisor on this record."
      >
        {refError && (
          <div
            role="alert"
            data-testid="ref-error"
            style={{
              backgroundColor: '#fef2f2',
              color: colors.semantic.errorText,
              border: `1px solid ${colors.semantic.error}`,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              marginBottom: spacing.md,
              fontSize: '0.875rem',
            }}
          >
            {refError}
          </div>
        )}

        {refSuccess && (
          <div
            role="status"
            data-testid="ref-success"
            style={{
              backgroundColor: '#ecfdf5',
              color: colors.semantic.successText,
              border: `1px solid ${colors.semantic.success}`,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '6px',
              marginBottom: spacing.md,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {refSuccess}
          </div>
        )}

        <form onSubmit={handleReferenceSubmit} data-testid="request-reference-form">
          <Input
            id="ref-name"
            label="Referee Full Name"
            placeholder="e.g. Alex Morgan"
            required
            value={refName}
            onChange={(e) => setRefName(e.target.value)}
            data-testid="input-ref-name"
          />

          <Input
            id="ref-email"
            type="email"
            label="Referee Corporate Email"
            placeholder="alex.morgan@company.com"
            helperText="Must match the employer domain. Disposable emails are blocked."
            required
            value={refEmail}
            onChange={(e) => setRefEmail(e.target.value)}
            data-testid="input-ref-email"
          />

          <div style={{ marginBottom: spacing.lg }}>
            <label
              htmlFor="ref-role"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: colors.neutral[800],
                marginBottom: spacing.xs,
              }}
            >
              Working Relationship
            </label>
            <select
              id="ref-role"
              value={refRole}
              onChange={(e) => setRefRole(e.target.value)}
              data-testid="select-ref-role"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.neutral[300]}`,
                fontSize: '0.875rem',
                color: colors.neutral[900],
                backgroundColor: '#ffffff',
              }}
            >
              <option value="manager">Direct Manager / Engineering Director</option>
              <option value="mentor">Mentor / Staff Tech Lead</option>
              <option value="peer">Cross-functional Peer (Senior / Principal)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button variant="secondary" type="button" onClick={() => setIsRefModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              data-testid="submit-reference-btn"
              disabled={submitting}
            >
              Create Reference Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
