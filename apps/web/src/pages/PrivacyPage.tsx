import React from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { Card, CardHeader, CardTitle, CardContent, Badge, ShieldCheckIcon, LockIcon } from '../components/ui/index.js';

export const PrivacyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: spacing['2xl'] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Badge variant="verified">
            <ShieldCheckIcon size={12} />
            <span>GDPR & CCPA Compliant</span>
          </Badge>
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
            Effective Date: September 25, 2026 &bull; Version 2.4
          </span>
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
          How we collect, verify, protect, and cryptographically govern candidate evidence, career
          records, and employer interactions under strict zero-trust standards.
        </p>
      </div>

      {/* Quick Summary Card */}
      <Card style={{ marginBottom: spacing.xl, borderLeft: `4px solid ${colors.primary[600]}` }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <LockIcon size={16} />
            <CardTitle style={{ fontSize: '1rem', fontWeight: 700 }}>Our Privacy Guarantees at a Glance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.7 }}>
            <li><strong>You own your evidence:</strong> Your work history and code artifacts belong exclusively to you. We never sell candidate data to third-party data brokers.</li>
            <li><strong>Strict Differential Privacy:</strong> Analytics and aggregate market benchmarks require an anonymization threshold of <code>k &ge; 10</code>. No individual score is discernible in benchmark reports.</li>
            <li><strong>Anti-LLM Scraping Clause:</strong> Your proprietary source code and sandbox submissions are never used to train public or foundational third-party LLMs without explicit cryptographic consent.</li>
            <li><strong>Cryptographic Audit Trail:</strong> Every employer profile view and evidence verification generates an immutable audit record visible in your Career Cockpit.</li>
            <li><strong>30-Day Erasure Grace Period:</strong> You can export your data (JSON / Verifiable Credential format) or request complete erasure under GDPR Article 17 at any time.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Policy Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            1. Information We Collect and Verify
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            TalentSphere is an evidence-first talent network. To establish cryptographic credibility between talent and employers, we process:
          </p>
          <div style={{ backgroundColor: '#ffffff', border: `1px solid ${colors.neutral[200]}`, borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.neutral[800] }}>Category</th>
                  <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.neutral[800] }}>Data Elements</th>
                  <th style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600, color: colors.neutral[800] }}>Legal Basis (GDPR Art. 6)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>Identity & Account</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Full name, verified corporate/institutional email address, session tokens.</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Contractual necessity</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>Work History Evidence</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Company, title, dates, manager reference verification signatures, repository PR metadata.</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Explicit consent & Contract</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>Proctored Assessments</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Code submissions, automated test execution outputs, execution metrics, rubric evaluations.</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Consent</td>
                </tr>
                <tr>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, fontWeight: 600 }}>Security & Telemetry</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>IP hash, browser user-agent hash, session audit trail (strictly anonymized).</td>
                  <td style={{ padding: `${spacing.sm} ${spacing.md}`, color: colors.neutral[600] }}>Legitimate interest (Fraud prevention)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            2. Evidence Verification & Reference Confirmation
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            When you submit a work history record or request manager verification, TalentSphere transmits a secure, single-use verification token to the verified corporate email address of your designated reference. We do not accept personal or disposable webmail domains (e.g., mailinator, tempmail) to prevent reference fabrication. References attest solely to factual tenure and technical scope.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            3. Differential Privacy and Employer Access Controls
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            TalentSphere implements strict Role-Based Access Control (RBAC) and Row-Level Security (RLS):
          </p>
          <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.7 }}>
            <li><strong>Public View:</strong> Only claims and badges you explicitly set to &ldquo;Public Credential&rdquo; are visible without authentication.</li>
            <li><strong>Verified Employers:</strong> Employers with an active, vetted Enterprise or Starter subscription can view your verified dossier only when you apply or grant access via your Career Cockpit.</li>
            <li><strong>Aggregate Talent Analytics:</strong> Aggregated talent benchmarks require minimum cluster size <code>k &ge; 10</code> with Laplace noise injection, guaranteeing zero individual re-identification.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            4. Your Rights Under GDPR & CCPA
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            Depending on your jurisdiction, you have the following rights:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.md }}>
            <div style={{ backgroundColor: '#ffffff', padding: spacing.md, borderRadius: '6px', border: `1px solid ${colors.neutral[200]}` }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[900], marginBottom: spacing.xs }}>Right of Access & Portability</div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: colors.neutral[600], lineHeight: 1.5 }}>
                Export your full evidence graph, test transcripts, and verification signatures in standard JSON-LD format at any time.
              </p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: spacing.md, borderRadius: '6px', border: `1px solid ${colors.neutral[200]}` }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[900], marginBottom: spacing.xs }}>Right to Erasure (Article 17)</div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: colors.neutral[600], lineHeight: 1.5 }}>
                Permanently purge your account, dossiers, and assessment submissions within 30 days of submission.
              </p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: spacing.md, borderRadius: '6px', border: `1px solid ${colors.neutral[200]}` }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[900], marginBottom: spacing.xs }}>Right to Rectification</div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: colors.neutral[600], lineHeight: 1.5 }}>
                Update or dispute work history evidence records and re-request employer signature confirmation.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            5. Data Protection Officer (DPO) & Contact
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            For privacy inquiries, cryptographic key rotations, or formal GDPR/CCPA requests, contact our Data Protection Officer at:
          </p>
          <div style={{ backgroundColor: colors.neutral[100], padding: spacing.md, borderRadius: '6px', fontSize: '0.875rem', color: colors.neutral[800] }}>
            <strong>TalentSphere Privacy Operations</strong><br />
            Email: <code style={{ color: colors.primary[700] }}>privacy@talentsphere.dev</code><br />
            Security Incident Response: <code style={{ color: colors.primary[700] }}>security@talentsphere.dev</code><br />
            Response SLA: Within 48 business hours.
          </div>
        </section>
      </div>
    </div>
  );
};
