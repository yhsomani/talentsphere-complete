import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

export interface PageHeaderProps {
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Primary action(s), right-aligned on wide screens, below the title on narrow ones. */
  actions?: React.ReactNode;
}

/**
 * Page title block shared by the signed-in workspaces. The serif title is the
 * product's typographic signature (it matches the wordmark); everything
 * around it stays quiet.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, intro, actions }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: spacing.md,
      paddingBottom: spacing.lg,
      marginBottom: spacing.xl,
      borderBottom: `1px solid ${colors.neutral[200]}`,
    }}
  >
    <div style={{ maxWidth: '680px', minWidth: 0 }}>
      <h1
        className="serif-display"
        style={{
          fontSize: 'clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem)',
          fontWeight: 500,
          color: colors.neutral[900],
        }}
      >
        {title}
      </h1>
      {intro && (
        <p style={{ color: colors.neutral[600], marginTop: spacing.sm, lineHeight: 1.6 }}>
          {intro}
        </p>
      )}
    </div>
    {actions && <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>{actions}</div>}
  </div>
);
