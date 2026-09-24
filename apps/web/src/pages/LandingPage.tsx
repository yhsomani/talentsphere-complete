import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';

export const LandingPage: React.FC = () => {
  return (
    <section style={{ padding: `${spacing['2xl']} 0`, textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: colors.neutral[900], marginBottom: spacing.md, lineHeight: 1.2 }}>
        The Career Operating System Built on <span style={{ color: colors.primary[600] }}>Verified Evidence</span>
      </h1>
      <p style={{ fontSize: '1.125rem', color: colors.neutral[600], maxWidth: '700px', margin: '0 auto', marginBottom: spacing.xl }}>
        Move beyond unverified resumes and keyword games. Prove your capabilities through verifiable projects, proctored assessments, and an evidence graph employers trust.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.md, marginBottom: spacing['3xl'] }}>
        <Link
          to="/dashboard"
          style={{
            backgroundColor: colors.primary[600],
            color: '#ffffff',
            padding: `${spacing.sm} ${spacing.lg}`,
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Launch Dashboard
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.lg,
          textAlign: 'left',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: spacing.lg, borderRadius: '8px', border: `1px solid ${colors.neutral[200]}` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            1. Talent Graph
          </h2>
          <p style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>
            Maps skills, prerequisites, and transferability without superficial popularity metrics.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: spacing.lg, borderRadius: '8px', border: `1px solid ${colors.neutral[200]}` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            2. Evidence Graph
          </h2>
          <p style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>
            Immutable provenance, employer verification, project artifacts, and recency tracking.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: spacing.lg, borderRadius: '8px', border: `1px solid ${colors.neutral[200]}` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.neutral[900], marginBottom: spacing.xs }}>
            3. Governed Intelligence
          </h2>
          <p style={{ fontSize: '0.875rem', color: colors.neutral[600] }}>
            Explainable matching with assessment integrity and zero paid AI costs for free users.
          </p>
        </div>
      </div>
    </section>
  );
};
