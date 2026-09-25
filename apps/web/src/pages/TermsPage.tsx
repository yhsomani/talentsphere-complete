import React from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { Card, CardHeader, CardTitle, CardContent, Badge, ShieldCheckIcon, AlertCircleIcon } from '../components/ui/index.js';

export const TermsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: spacing['2xl'] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Badge variant="neutral">Legal Agreement</Badge>
          <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
            Effective Date: September 25, 2026 &bull; Version 3.1
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
          Terms of Service & Verification Standards
        </h1>
        <p style={{ fontSize: '1.0625rem', color: colors.neutral[600], lineHeight: 1.6 }}>
          These terms govern your access to TalentSphere, candidate credential verification, proctored
          skill assessments, and employer interactions.
        </p>
      </div>

      {/* Critical Integrity Notice */}
      <Card style={{ marginBottom: spacing.xl, borderLeft: `4px solid ${colors.semantic.warning}` }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <AlertCircleIcon size={16} />
            <CardTitle style={{ fontSize: '1rem', fontWeight: 700 }}>Credential Integrity Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            TalentSphere is built on cryptographic proof and factual verification. Submitting fraudulent work history,
            fabricating manager references via disposable emails, or utilizing unauthorized proxy solvers during proctored
            assessments constitutes a material breach resulting in immediate and permanent revocation of all verified badges
            and account termination.
          </p>
        </CardContent>
      </Card>

      {/* Terms Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            By registering for an account, submitting work history evidence, participating in proctored assessments, or
            subscribing to employer hiring tools on TalentSphere (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, you must not access or use the Platform.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            2. Candidate Attestations & Verification Standards
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            As a candidate submitting evidence to the Talent Graph:
          </p>
          <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.7 }}>
            <li><strong>Factual Accuracy:</strong> You warrant that all employment dates, titles, and project contributions are accurate and complete to the best of your knowledge.</li>
            <li><strong>Manager Reference Integrity:</strong> You must supply authentic corporate or institutional email addresses for designated references. Supplying self-controlled aliases or disposable addresses is strictly prohibited.</li>
            <li><strong>Intellectual Property & Confidentiality:</strong> When linking code repositories or pull requests, you warrant that you are legally authorized to share such artifacts and that doing so does not violate prior confidentiality agreements or third-party trade secrets.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            3. Proctored Assessment Conduct & Academic Honesty
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            TalentSphere assessments evaluate real-world engineering competence under controlled sandbox environments:
          </p>
          <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.7 }}>
            <li><strong>Sole Authorship:</strong> All code submitted during an assessment session must be authored solely by you during the allocated timeframe.</li>
            <li><strong>Anti-Cheating Mechanisms:</strong> The platform logs keystroke frequency, browser tab focus transitions, and sandbox execution logs to ensure session validity.</li>
            <li><strong>Prohibition of AI Proxy Agents:</strong> Use of automated agents or external humans answering questions on your behalf during proctored challenges is strictly forbidden.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            4. Employer Commitments & Honest Hiring Policy
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6, marginBottom: spacing.sm }}>
            Employers and recruiters using TalentSphere to source and evaluate verified talent must adhere to:
          </p>
          <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '0.875rem', color: colors.neutral[700], lineHeight: 1.7 }}>
            <li><strong>No Phantom or Ghost Postings:</strong> Every job opportunity posted on TalentSphere must correspond to an active, funded requisition with authentic intent to hire.</li>
            <li><strong>Accurate Compensation Ranges:</strong> All listed roles must state bona fide compensation bands in compliance with pay transparency regulations.</li>
            <li><strong>Non-Discriminatory Evaluation:</strong> Employers may not use verified score distributions for discriminatory purposes unlawful under applicable jurisdiction.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            5. Subscriptions, Invoicing, and Refund Policy
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            Subscription fees for Candidate Pro and Recruiter tiers are billed in advance on a monthly or annual basis as
            selected at checkout. Paid fees are non-refundable except where required by law. Cancellations take effect at the
            conclusion of the then-current billing period, with access maintained through the end of that period.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            6. Limitation of Liability & Warranties
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            TalentSphere provides the platform and evidence verification &ldquo;as is&rdquo;. While we employ rigorous cryptographic
            and human-in-the-loop verification methodologies, TalentSphere does not guarantee specific employment outcomes,
            hiring offers, or candidate job performance. To the maximum extent permitted by applicable law, TalentSphere shall
            not be liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            7. Governing Law and Dispute Resolution
          </h2>
          <p style={{ fontSize: '0.9375rem', color: colors.neutral[700], lineHeight: 1.6 }}>
            These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law
            principles. Any dispute arising out of or relating to these Terms shall be resolved via binding individual arbitration
            conducted under the commercial arbitration rules of the American Arbitration Association (AAA).
          </p>
        </section>
      </div>
    </div>
  );
};
