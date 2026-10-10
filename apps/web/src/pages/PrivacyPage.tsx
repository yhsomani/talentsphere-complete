import React from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Card, CardHeader, CardTitle, CardContent, LockIcon } from '../components/ui/index.js';

export const PrivacyPage: React.FC = () => {
  usePageMeta(
    'Privacy Policy',
    'What TalentSphere collects, why, who can see it, and how to remove it.'
  );

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: spacing['2xl'] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[600] }}>
            Draft dated September 25, 2026
          </span>
        </div>
        <div
          role="note"
          data-testid="legal-draft-notice"
          style={{
            backgroundColor: '#fffbeb',
            color: colors.semantic.warningText,
            border: `1px solid ${colors.semantic.warning}`,
            borderRadius: '6px',
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: '0.875rem',
            marginBottom: spacing.md,
          }}
        >
          This policy is a draft that has not been reviewed by a lawyer. Where it describes a
          capability the product does not have yet, the “Today” note in the summary below says so.
        </div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: colors.neutral[900],
            lineHeight: 1.2,
            marginBottom: spacing.sm,
          }}
        >
          TalentSphere Privacy Policy
        </h1>
        <p style={{ fontSize: '1.0625rem', color: colors.neutral[600], lineHeight: 1.6 }}>
          What we collect, why, who can see it, and how to remove it.
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card style={{ marginBottom: spacing.xl, borderLeft: `4px solid ${colors.primary[600]}` }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <LockIcon size={16} />
            <CardTitle style={{ fontSize: '1rem', fontWeight: 700 }}>
              Our Privacy Guarantees at a Glance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul
            style={{
              margin: 0,
              paddingLeft: spacing.lg,
              fontSize: '0.875rem',
              color: colors.neutral[700],
              lineHeight: 1.7,
            }}
          >
            <li>
              <strong>You own your evidence:</strong> Your work history and code artifacts belong
              exclusively to you. We never sell candidate data to third-party data brokers.
            </li>
            <li>
              <strong>Strict Differential Privacy:</strong> Analytics and aggregate market
              benchmarks require an anonymization threshold of <code>k &ge; 10</code>. No individual
              score is discernible in benchmark reports.
            </li>
            <li>
              <strong>Anti-LLM Scraping Clause:</strong> Your proprietary source code and sandbox
              submissions are never used to train public or foundational third-party LLMs without
              explicit cryptographic consent.
            </li>
            <li>
              <strong>Your work email stays private:</strong> recruiters see that a role was
              confirmed by email, never the address itself. Verification codes and referee links are
              stored only as one-way hashes.
            </li>
            <li>
              <strong>Deleting your account:</strong> you can delete your account from your Profile
              at any time. Your name, work history, references and evidence are removed immediately
              and open applications are withdrawn. <em>Today:</em> self-service data export and a
              grace period before deletion are not available yet.
            </li>
            <li>
              <em>Today:</em> a per-view audit trail of who looked at your profile is not available
              yet.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Policy Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
        <section>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            1. Information We Collect and Verify
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: colors.neutral[700],
              lineHeight: 1.6,
              marginBottom: spacing.sm,
            }}
          >
            TalentSphere is an evidence-first talent network. To establish cryptographic credibility
            between talent and employers, we process:
          </p>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: colors.neutral[50],
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                  }}
                >
                  <th
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontWeight: 600,
                      color: colors.neutral[800],
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontWeight: 600,
                      color: colors.neutral[800],
                    }}
                  >
                    Data Elements
                  </th>
                  <th
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontWeight: 600,
                      color: colors.neutral[800],
                    }}
                  >
                    Legal Basis (GDPR Art. 6)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>
                    Identity & Account
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Full name, verified corporate/institutional email address, session tokens.
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Contractual necessity
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>
                    Work History Evidence
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Company, title, dates, manager reference verification signatures, repository PR
                    metadata.
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Explicit consent & Contract
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>
                    Proctored Assessments
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Code submissions, automated test execution outputs, execution metrics, rubric
                    evaluations.
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Consent
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>
                    Security & Telemetry
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    IP hash, browser user-agent hash, session audit trail (strictly anonymized).
                  </td>
                  <td
                    style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}
                  >
                    Legitimate interest (Fraud prevention)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            2. Evidence Verification & Reference Confirmation
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            When you submit a work history record or request manager verification, TalentSphere
            transmits a secure, single-use verification token to the verified corporate email
            address of your designated reference. We do not accept personal or disposable webmail
            domains (e.g., mailinator, tempmail) to prevent reference fabrication. References attest
            solely to factual tenure and technical scope.
          </p>
        </section>

        <section>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            3. Differential Privacy and Employer Access Controls
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: colors.neutral[700],
              lineHeight: 1.6,
              marginBottom: spacing.sm,
            }}
          >
            TalentSphere implements strict Role-Based Access Control (RBAC) and Row-Level Security
            (RLS):
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: spacing.lg,
              fontSize: '0.875rem',
              color: colors.neutral[700],
              lineHeight: 1.7,
            }}
          >
            <li>
              <strong>Public View:</strong> Only claims and badges you explicitly set to
              &ldquo;Public Credential&rdquo; are visible without authentication.
            </li>
            <li>
              <strong>Verified Employers:</strong> Employers with an active, vetted Enterprise or
              Starter subscription can view your verified dossier only when you apply or grant
              access via your Career Cockpit.
            </li>
            <li>
              <strong>Aggregate Talent Analytics:</strong> Aggregated talent benchmarks require
              minimum cluster size <code>k &ge; 10</code> with Laplace noise injection, guaranteeing
              zero individual re-identification.
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            4. Your Rights Under GDPR & CCPA
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: colors.neutral[700],
              lineHeight: 1.6,
              marginBottom: spacing.sm,
            }}
          >
            Depending on your jurisdiction, you have the following rights:
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
              gap: spacing.md,
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: spacing.md,
                borderRadius: '6px',
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                Right of Access & Portability
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                }}
              >
                Export your full evidence graph, test transcripts, and verification signatures in
                standard JSON-LD format at any time.
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: spacing.md,
                borderRadius: '6px',
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                Right to Erasure (Article 17)
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                }}
              >
                Permanently purge your account, dossiers, and assessment submissions within 30 days
                of submission.
              </p>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: spacing.md,
                borderRadius: '6px',
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                Right to Rectification
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                }}
              >
                Update or dispute work history evidence records and re-request employer signature
                confirmation.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.neutral[900],
              marginBottom: spacing.xs,
            }}
          >
            5. Data Protection Officer (DPO) & Contact
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            For privacy inquiries, cryptographic key rotations, or formal GDPR/CCPA requests,
            contact our Data Protection Officer at:
          </p>
          <div
            style={{
              backgroundColor: colors.neutral[100],
              padding: spacing.md,
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: colors.neutral[800],
            }}
          >
            <strong>TalentSphere Privacy Operations</strong>
            <br />
            Email:{' '}
            <a
              href="mailto:privacy@talentsphere.dev"
              style={{ color: colors.primary[700], fontWeight: 600 }}
            >
              <code>privacy@talentsphere.dev</code>
            </a>
            <br />
            Security Incident Response:{' '}
            <a
              href="mailto:security@talentsphere.dev"
              style={{ color: colors.primary[700], fontWeight: 600 }}
            >
              <code>security@talentsphere.dev</code>
            </a>
            <br />
            Response SLA: Within 48 business hours.
          </div>
        </section>
      </div>
    </div>
  );
};
