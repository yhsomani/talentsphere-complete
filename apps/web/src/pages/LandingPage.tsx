import React from 'react';
import { colors, spacing, typography } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import {
  ButtonLink,
  Badge,
  Card,
  CardContent,
  ShieldCheckIcon,
  GitBranchIcon,
  LockIcon,
  ArrowRightIcon,
  CheckIcon,
  HeroTitle,
  SectionTitle,
  SectionIntro,
  MicroLabel,
} from '../components/ui/index.js';

export const LandingPage: React.FC = () => {
  usePageMeta(
    'Career Operating System \u2014 Verified Talent & Evidence Graph',
    'Prove your capabilities with verifiable projects, proctored code assessments, and an immutable evidence graph that employers trust. Explore TalentSphere.'
  );

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      {/* Hero Section */}
      <section
        style={{
          paddingTop: spacing['3xl'],
          paddingBottom: spacing['3xl'],
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <div style={{ maxWidth: '840px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: spacing.lg,
            }}
          >
            <Badge variant="info">TalentSphere OS v0.4.0</Badge>
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.neutral[600],
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Deterministic Verification &amp; Evidence Network
            </span>
          </div>

          <HeroTitle>
            The Career Operating System Built on{' '}
            <span style={{ color: colors.primary[700] }}>Verified Evidence</span>
          </HeroTitle>

          <p
            style={{
              fontSize: typography.fontSize.xl,
              color: colors.neutral[700],
              lineHeight: typography.lineHeight.relaxed,
              marginBottom: spacing['2xl'],
              maxWidth: '65ch',
            }}
          >
            Move beyond unverified resumes and keyword games. Prove your capabilities through
            verifiable projects, proctored code assessments, and an immutable evidence graph
            employers trust.
          </p>

          <div
            style={{
              display: 'flex',
              gap: spacing.md,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <ButtonLink to="/dashboard" size="lg" data-testid="cta-dashboard">
              Launch Career Cockpit <ArrowRightIcon size={18} />
            </ButtonLink>
            <ButtonLink to="/evidence" variant="outline" size="lg" data-testid="cta-evidence">
              Explore Evidence Hub
            </ButtonLink>
          </div>
        </div>

        {/* Live Verifiable Evidence Card Preview */}
        <div style={{ marginTop: spacing['2xl'] }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: '12px',
              padding: spacing.xl,
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${colors.neutral[100]}`,
                paddingBottom: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <ShieldCheckIcon size={24} style={{ color: colors.semantic.successText }} />
                <span
                  style={{
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.base,
                    color: colors.neutral[900],
                  }}
                >
                  Verifiable Employment Credential • Acme Infrastructure Corp
                </span>
              </div>
              <Badge variant="gold" mono>
                GOLD TIER • 96/100
              </Badge>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                gap: spacing.lg,
              }}
            >
              <div>
                <MicroLabel>Role &amp; Tenure</MicroLabel>
                <strong
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.neutral[800],
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Staff Systems Architect (2.8 yrs)
                </strong>
              </div>
              <div>
                <MicroLabel>Corporate Attestation</MicroLabel>
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.semantic.successText,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  <CheckIcon size={16} style={{ display: 'inline', verticalAlign: '-3px' }} />{' '}
                  jordan@acme.corp (DKIM Verified)
                </span>
              </div>
              <div>
                <MicroLabel>Structured Referee</MicroLabel>
                <strong
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.neutral[800],
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  VP of Engineering • 5/5 Scorecard
                </strong>
              </div>
              <div>
                <MicroLabel>Provenance Hash</MicroLabel>
                <code
                  style={{
                    fontFamily: typography.fontFamily.mono,
                    fontSize: typography.fontSize.sm,
                    color: colors.neutral[700],
                  }}
                >
                  sha256:e3b0c44298fc...
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section style={{ paddingTop: spacing['3xl'], paddingBottom: spacing['3xl'] }}>
        <div style={{ marginBottom: spacing['2xl'] }}>
          <SectionTitle>Engineering-Grade Verification Pillars</SectionTitle>
          <SectionIntro>
            Built around strict cryptographic provenance, anti-fraud employment validation, and
            deterministic skills.
          </SectionIntro>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: spacing.xl,
          }}
        >
          <Card>
            <CardContent>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <GitBranchIcon size={24} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  marginBottom: spacing.sm,
                  letterSpacing: typography.letterSpacing.tight,
                }}
              >
                1. Talent Graph
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.neutral[600],
                  lineHeight: typography.lineHeight.relaxed,
                  marginBottom: spacing.md,
                }}
              >
                Maps verified competencies, prerequisite graphs, and transferability without
                reliance on keyword gaming, endorsement inflation, or self-reported LinkedIn claims.
              </p>
              <ul
                style={{
                  paddingLeft: '20px',
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[700],
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                <li style={{ marginBottom: spacing.xs }}>Hierarchical capability prerequisites</li>
                <li style={{ marginBottom: spacing.xs }}>Skill decay and recency measurement</li>
                <li>Cross-domain transferability vectors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#ecfdf5',
                  color: colors.semantic.successText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <ShieldCheckIcon size={24} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  marginBottom: spacing.sm,
                  letterSpacing: typography.letterSpacing.tight,
                }}
              >
                2. Evidence Graph
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.neutral[600],
                  lineHeight: typography.lineHeight.relaxed,
                  marginBottom: spacing.md,
                }}
              >
                Immutable provenance backed by corporate email attestation, structured manager
                references, and reproducible code execution artifacts rather than static resume
                PDFs.
              </p>
              <ul
                style={{
                  paddingLeft: '20px',
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[700],
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                <li style={{ marginBottom: spacing.xs }}>Anti-fraud date validation (BR-084)</li>
                <li style={{ marginBottom: spacing.xs }}>
                  Disposable email blocking on references
                </li>
                <li>Cryptographic JSON-LD verification export</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: colors.neutral[100],
                  color: colors.neutral[800],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <LockIcon size={24} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  marginBottom: spacing.sm,
                  letterSpacing: typography.letterSpacing.tight,
                }}
              >
                3. Governed Intelligence
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.neutral[600],
                  lineHeight: typography.lineHeight.relaxed,
                  marginBottom: spacing.md,
                }}
              >
                Explainable opportunity matching with differential privacy small-cell suppression (k
                &ge; 10) and zero AI compute costs billed silently to free candidates.
              </p>
              <ul
                style={{
                  paddingLeft: '20px',
                  margin: 0,
                  fontSize: typography.fontSize.sm,
                  color: colors.neutral[700],
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                <li style={{ marginBottom: spacing.xs }}>Deterministic matching algorithms</li>
                <li style={{ marginBottom: spacing.xs }}>
                  Small-cell suppression against re-identification
                </li>
                <li>Zero LLM training on candidate code</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works: The 3-Step Verification Pipeline */}
      <section
        style={{
          paddingTop: spacing['3xl'],
          paddingBottom: spacing['3xl'],
          borderTop: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <div style={{ marginBottom: spacing['2xl'] }}>
          <SectionTitle>How Capability Verification Works</SectionTitle>
          <SectionIntro>
            A rigorous 3-stage validation process that creates trustworthy credentials without
            invasive surveillance.
          </SectionIntro>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: spacing.xl,
          }}
        >
          <div style={{ borderLeft: `4px solid ${colors.primary[600]}`, paddingLeft: spacing.lg }}>
            <MicroLabel tone="primary">STEP 01</MicroLabel>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                margin: `${spacing.sm} 0`,
                letterSpacing: typography.letterSpacing.tight,
              }}
            >
              Attest Work History
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.neutral[600],
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              Record employment entries with strict start/end date validation. Attest corporate
              email domain ownership via token verification.
            </p>
          </div>

          <div style={{ borderLeft: `4px solid ${colors.primary[600]}`, paddingLeft: spacing.lg }}>
            <MicroLabel tone="primary">STEP 02</MicroLabel>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                margin: `${spacing.sm} 0`,
                letterSpacing: typography.letterSpacing.tight,
              }}
            >
              Structured Peer Endorsement
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.neutral[600],
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              Request verified references from managers or senior peers. System verifies referee
              corporate email domain and enforces anti-collusion boundaries.
            </p>
          </div>

          <div
            style={{ borderLeft: `4px solid ${colors.semantic.success}`, paddingLeft: spacing.lg }}
          >
            <MicroLabel tone="success">STEP 03</MicroLabel>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.neutral[900],
                margin: `${spacing.sm} 0`,
                letterSpacing: typography.letterSpacing.tight,
              }}
            >
              Score &amp; Mint Badge
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.neutral[600],
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              Deterministic scoring engine assigns a 0-100 confidence score and awards Bronze,
              Silver, or Gold verification tiers backed by cryptographic hash.
            </p>
          </div>
        </div>

        <div style={{ marginTop: spacing['2xl'], textAlign: 'center' }}>
          <ButtonLink to="/evidence" variant="secondary" size="md">
            View Evidence Graph Demo &rarr;
          </ButtonLink>
        </div>
      </section>
    </div>
  );
};
