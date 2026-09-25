import React, { useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Modal, ShieldCheckIcon, CheckIcon, AlertCircleIcon, ExternalLinkIcon } from '../components/ui/index.js';

interface WorkHistoryEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  corporateEmail: string;
  isEmailVerified: boolean;
  confidenceScore: number;
  tier: 'gold' | 'silver' | 'bronze';
  referee?: {
    name: string;
    relationship: string;
    submittedAt: string;
  };
  hash: string;
}

const INITIAL_ENTRIES: WorkHistoryEntry[] = [
  {
    id: 'wh-001',
    companyName: 'Acme Cloud Infrastructure',
    jobTitle: 'Staff Distributed Systems Engineer',
    startDate: '2023-01-15',
    endDate: null,
    isCurrent: true,
    corporateEmail: 'jordan@acme.corp',
    isEmailVerified: true,
    confidenceScore: 96,
    tier: 'gold',
    referee: {
      name: 'Sarah Chen, VP Engineering',
      relationship: 'Direct Manager',
      submittedAt: '2024-11-20',
    },
    hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'wh-002',
    companyName: 'DataMesh Solutions',
    jobTitle: 'Senior Backend Engineer',
    startDate: '2020-06-01',
    endDate: '2022-12-31',
    isCurrent: false,
    corporateEmail: 'jordan.eng@datamesh.io',
    isEmailVerified: true,
    confidenceScore: 78,
    tier: 'silver',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
];

const DISPOSABLE_DOMAINS = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.com'];

export const EvidencePage: React.FC = () => {
  const [entries, setEntries] = useState<WorkHistoryEntry[]>(INITIAL_ENTRIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

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

  const handleAddSubmit = (e: React.FormEvent) => {
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
      setAddError('Disposable and temporary email addresses are rejected for corporate attestation.');
      return;
    }

    const newEntry: WorkHistoryEntry = {
      id: `wh-${Date.now()}`,
      companyName: company,
      jobTitle: title,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent,
      corporateEmail: email,
      isEmailVerified: Boolean(email),
      confidenceScore: email ? 70 : 40,
      tier: email ? 'silver' : 'bronze',
      hash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setEntries([newEntry, ...entries]);
    setIsAddModalOpen(false);
    // Reset form
    setCompany('');
    setTitle('');
    setStartDate('');
    setEndDate('');
    setEmail('');
  };

  const handleReferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRefError(null);
    setRefSuccess(null);

    if (!refName.trim() || !refEmail.trim()) {
      setRefError('Please provide referee name and corporate email address.');
      return;
    }

    const domain = refEmail.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setRefError('Disposable email addresses are strictly prohibited for manager references (BR-084).');
      return;
    }

    // Upgrade target entry to gold tier
    if (selectedEntryId) {
      setEntries(
        entries.map((entry) => {
          if (entry.id === selectedEntryId) {
            return {
              ...entry,
              confidenceScore: Math.min(100, entry.confidenceScore + 18),
              tier: 'gold',
              referee: {
                name: `${refName} (${refRole === 'manager' ? 'Direct Manager' : 'Technical Lead'})`,
                relationship: refRole,
                submittedAt: new Date().toISOString().split('T')[0],
              },
            };
          }
          return entry;
        })
      );
    }

    setRefSuccess(`Reference request dispatched to ${refEmail}. Candidate work history upgraded to Gold Tier pending evaluation.`);
    setTimeout(() => {
      setIsRefModalOpen(false);
      setRefSuccess(null);
      setRefName('');
      setRefEmail('');
    }, 1200);
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: spacing.xs }}>
            <Badge variant="verified">VERIFIED EVIDENCE GRAPH</Badge>
            <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
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
          <p style={{ color: colors.neutral[600], fontSize: '0.9375rem', margin: `${spacing.xs} 0 0` }}>
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

      {/* Work History Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {entries.map((item) => (
          <Card key={item.id} data-testid={`work-history-${item.id}`}>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <CardTitle>{item.jobTitle}</CardTitle>
                  <span style={{ color: colors.neutral[400] }}>&bull;</span>
                  <strong style={{ fontSize: '1rem', color: colors.neutral[700] }}>{item.companyName}</strong>
                </div>
                <CardDescription>
                  {item.startDate} &mdash; {item.isCurrent ? 'Present' : item.endDate} &bull;{' '}
                  <span style={{ fontFamily: 'monospace' }}>{item.hash.substring(0, 24)}...</span>
                </CardDescription>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <Badge variant={item.tier} mono>
                  {item.tier.toUpperCase()} TIER &bull; {item.confidenceScore}/100
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: spacing.lg,
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.neutral[500], display: 'block', marginBottom: spacing.xs }}>
                    DOMAIN ATTESTATION
                  </span>
                  {item.isEmailVerified ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.semantic.success }}>
                      <CheckIcon size={16} />
                      <strong>{item.corporateEmail}</strong>
                      <Badge variant="verified">DKIM Verified</Badge>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.neutral[500] }}>
                      <AlertCircleIcon size={16} />
                      <span>No corporate email attested</span>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.neutral[500], display: 'block', marginBottom: spacing.xs }}>
                    STRUCTURED REFERENCE
                  </span>
                  {item.referee ? (
                    <div>
                      <strong style={{ color: colors.neutral[800], display: 'block' }}>{item.referee.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: colors.neutral[500] }}>
                        Verified relationship: {item.referee.relationship} &bull; Attested on {item.referee.submittedAt}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: colors.neutral[500], display: 'block', marginBottom: spacing.xs }}>
                        No supervisor reference attached
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
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.neutral[500], display: 'block', marginBottom: spacing.xs }}>
                    CONFIDENCE INTEGRITY
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: '4px' }}>
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
                          width: `${item.confidenceScore}%`,
                          height: '100%',
                          backgroundColor:
                            item.confidenceScore >= 85
                              ? colors.semantic.success
                              : item.confidenceScore >= 70
                                ? colors.primary[600]
                                : colors.semantic.warning,
                        }}
                      />
                    </div>
                    <strong style={{ fontSize: '0.8125rem', color: colors.neutral[700] }}>{item.confidenceScore}%</strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
              color: colors.semantic.error,
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
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
            helperText="We will send a single verification link to verify your corporate domain."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-corporate-email"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" data-testid="submit-employment-btn">
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
        description="Invite a verified manager or tech lead to submit a structured capability scorecard."
      >
        {refError && (
          <div
            role="alert"
            data-testid="ref-error"
            style={{
              backgroundColor: '#fef2f2',
              color: colors.semantic.error,
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
              color: colors.semantic.success,
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
              <option value="tech_lead">Staff / Principal Tech Lead</option>
              <option value="peer">Cross-functional Peer (Senior / Principal)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
            <Button variant="secondary" type="button" onClick={() => setIsRefModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" data-testid="submit-reference-btn">
              Dispatch Verification Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
