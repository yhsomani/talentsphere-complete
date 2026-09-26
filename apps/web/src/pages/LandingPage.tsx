import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import {
  Button,
  Badge,
  Card,
  CardContent,
  ShieldCheckIcon,
  GitBranchIcon,
  LockIcon,
  ArrowRightIcon,
  CheckIcon,
} from '../components/ui/index.js';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: spacing['3xl'] }}>
      {/* Hero Section */}
      <section
        style={{
          paddingTop: spacing.xl,
          paddingBottom: spacing['2xl'],
          borderBottom: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <div style={{ maxWidth: '840px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: spacing.md,
            }}
          >
            <Badge variant="info">TalentSphere OS v0.4.0</Badge>
            <span style={{ fontSize: '0.8125rem', color: colors.neutral[500] }}>
              Deterministic Verification &amp; Evidence Network
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: colors.neutral[900],
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: spacing.md,
            }}
          >
            The Career Operating System Built on{' '}
            <span style={{ color: colors.primary[700] }}>Verified Evidence</span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: colors.neutral[600],
              lineHeight: 1.6,
              marginBottom: spacing.xl,
            }}
          >
            Move beyond unverified resumes and keyword games. Prove your capabilities through
            verifiable projects, proctored code assessments, and an immutable evidence graph
            employers trust.
          </p>

          <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button size="lg" data-testid="cta-dashboard">
                Launch Career Cockpit <ArrowRightIcon size={18} />
              </Button>
            </Link>
            <Link to="/evidence" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg" data-testid="cta-evidence">
                Explore Evidence Hub
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Verifiable Evidence Card Preview */}
        <div style={{ marginTop: spacing.xl }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: '8px',
              padding: spacing.lg,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${colors.neutral[100]}`,
                paddingBottom: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <ShieldCheckIcon size={20} style={{ color: colors.semantic.success }} />
                <span
                  style={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.neutral[900] }}
                >
                  Verifiable Employment Credential &bull; Acme Infrastructure Corp
                </span>
              </div>
              <Badge variant="gold" mono>
                GOLD TIER &bull; 96/100
              </Badge>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                gap: spacing.md,
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: colors.neutral[500], display: 'block', marginBottom: '2px' }}>
                  Role &amp; Tenure
                </span>
                <strong style={{ color: colors.neutral[800] }}>
                  Staff Systems Architect (2.8 yrs)
                </strong>
              </div>
              <div>
                <span style={{ color: colors.neutral[500], display: 'block', marginBottom: '2px' }}>
                  Corporate Attestation
                </span>
                <span style={{ color: colors.semantic.success, fontWeight: 600 }}>
                  <CheckIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                  jordan@acme.corp (DKIM Verified)
                </span>
              </div>
              <div>
                <span style={{ color: colors.neutral[500], display: 'block', marginBottom: '2px' }}>
                  Structured Referee
                </span>
                <strong style={{ color: colors.neutral[800] }}>
                  VP of Engineering &bull; 5/5 Scorecard
                </strong>
              </div>
              <div>
                <span style={{ color: colors.neutral[500], display: 'block', marginBottom: '2px' }}>
                  Provenance Hash
                </span>
                <code
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    color: colors.neutral[600],
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
      <section style={{ paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'] }}>
        <div style={{ marginBottom: spacing.xl }}>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: colors.neutral[900],
              letterSpacing: '-0.02em',
              marginBottom: spacing.xs,
            }}
          >
            Engineering-Grade Verification Pillars
          </h2>
          <p style={{ color: colors.neutral[600], fontSize: '1rem' }}>
            Built around strict cryptographic provenance, anti-fraud employment validation, and
            deterministic skills.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: spacing.lg,
          }}
        >
          <Card>
            <CardContent>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <GitBranchIcon size={20} />
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                1. Talent Graph
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                  marginBottom: spacing.md,
                }}
              >
                Maps verified competencies, prerequisite graphs, and transferability without
                reliance on keyword gaming, endorsement inflation, or self-reported LinkedIn claims.
              </p>
              <ul
                style={{
                  paddingLeft: '18px',
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[700],
                }}
              >
                <li style={{ marginBottom: '4px' }}>Hierarchical capability prerequisites</li>
                <li style={{ marginBottom: '4px' }}>Skill decay and recency measurement</li>
                <li>Cross-domain transferability vectors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#ecfdf5',
                  color: colors.semantic.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <ShieldCheckIcon size={20} />
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                2. Evidence Graph
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                  marginBottom: spacing.md,
                }}
              >
                Immutable provenance backed by corporate email attestation, structured manager
                references, and reproducible code execution artifacts rather than static resume
                PDFs.
              </p>
              <ul
                style={{
                  paddingLeft: '18px',
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[700],
                }}
              >
                <li style={{ marginBottom: '4px' }}>Anti-fraud date validation (BR-084)</li>
                <li style={{ marginBottom: '4px' }}>Disposable email blocking on references</li>
                <li>Cryptographic JSON-LD verification export</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: colors.neutral[100],
                  color: colors.neutral[800],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <LockIcon size={20} />
              </div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: colors.neutral[900],
                  marginBottom: spacing.xs,
                }}
              >
                3. Governed Intelligence
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: colors.neutral[600],
                  lineHeight: 1.5,
                  marginBottom: spacing.md,
                }}
              >
                Explainable opportunity matching with differential privacy small-cell suppression
                ($k \ge 10$) and zero AI compute costs billed silently to free candidates.
              </p>
              <ul
                style={{
                  paddingLeft: '18px',
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.neutral[700],
                }}
              >
                <li style={{ marginBottom: '4px' }}>Deterministic matching algorithms</li>
                <li style={{ marginBottom: '4px' }}>
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
          paddingTop: spacing.xl,
          paddingBottom: spacing['2xl'],
          borderTop: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <div style={{ marginBottom: spacing.xl }}>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: colors.neutral[900],
              letterSpacing: '-0.02em',
              marginBottom: spacing.xs,
            }}
          >
            How Capability Verification Works
          </h2>
          <p style={{ color: colors.neutral[600], fontSize: '1rem' }}>
            A rigorous 3-stage validation process that creates trustworthy credentials without
            invasive surveillance.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: spacing.lg,
          }}
        >
          <div style={{ borderLeft: `3px solid ${colors.primary[600]}`, paddingLeft: spacing.md }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.primary[700] }}>
              STEP 01
            </span>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: colors.neutral[900],
                margin: `${spacing.xs} 0`,
              }}
            >
              Attest Work History
            </h3>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[600], lineHeight: 1.5 }}>
              Record employment entries with strict start/end date validation. Attest corporate
              email domain ownership via token verification.
            </p>
          </div>

          <div style={{ borderLeft: `3px solid ${colors.primary[600]}`, paddingLeft: spacing.md }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.primary[700] }}>
              STEP 02
            </span>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: colors.neutral[900],
                margin: `${spacing.xs} 0`,
              }}
            >
              Structured Peer Endorsement
            </h3>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[600], lineHeight: 1.5 }}>
              Request verified references from managers or senior peers. System verifies referee
              corporate email domain and enforces anti-collusion boundaries.
            </p>
          </div>

          <div
            style={{ borderLeft: `3px solid ${colors.semantic.success}`, paddingLeft: spacing.md }}
          >
            <span
              style={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.semantic.success }}
            >
              STEP 03
            </span>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: colors.neutral[900],
                margin: `${spacing.xs} 0`,
              }}
            >
              Score &amp; Mint Badge
            </h3>
            <p style={{ fontSize: '0.875rem', color: colors.neutral[600], lineHeight: 1.5 }}>
              Deterministic scoring engine assigns a 0-100 confidence score and awards Bronze,
              Silver, or Gold verification tiers backed by cryptographic hash.
            </p>
          </div>
        </div>

        <div style={{ marginTop: spacing.xl, textAlign: 'center' }}>
          <Link to="/evidence" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              View Evidence Graph Demo &rarr;
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
