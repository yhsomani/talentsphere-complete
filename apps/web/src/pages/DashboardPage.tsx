import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

export const DashboardPage: React.FC = () => {
  return (
    <section>
      <div style={{ marginBottom: spacing.xl }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: colors.neutral[900],
            marginBottom: spacing.xs,
          }}
        >
          Candidate Career Cockpit
        </h1>
        <p style={{ color: colors.neutral[600], fontSize: '0.875rem' }}>
          Real-time capability readiness, evidence portfolio, and explainable opportunities.
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: spacing.md,
            borderRadius: '8px',
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: colors.neutral[500],
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Verified Evidence
          </span>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: colors.primary[600],
              margin: `${spacing.xs} 0 0`,
            }}
          >
            12
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: spacing.md,
            borderRadius: '8px',
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: colors.neutral[500],
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Skill Readiness
          </span>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: colors.semantic.success,
              margin: `${spacing.xs} 0 0`,
            }}
          >
            88%
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: spacing.md,
            borderRadius: '8px',
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: colors.neutral[500],
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Active Applications
          </span>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: colors.neutral[800],
              margin: `${spacing.xs} 0 0`,
            }}
          >
            3
          </p>
        </div>
      </div>

      {/* Actionable Next Step */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: `1px solid ${colors.neutral[200]}`,
          padding: spacing.lg,
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: colors.neutral[900],
            marginBottom: spacing.xs,
          }}
        >
          Next Career Action: Prove Distributed Systems Capability
        </h2>
        <p style={{ fontSize: '0.875rem', color: colors.neutral[600], marginBottom: spacing.md }}>
          Target opportunity requires verified evidence for transactional queues. Complete the Code
          Assessment to update your Evidence Graph.
        </p>
        <button
          type="button"
          style={{
            backgroundColor: colors.primary[600],
            color: '#ffffff',
            padding: `${spacing.xs} ${spacing.md}`,
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Begin Verification Challenge
        </button>
      </div>
    </section>
  );
};
