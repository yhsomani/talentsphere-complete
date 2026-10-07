import React from 'react';
import { colors, spacing, typography } from '@talentsphere/ui';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Shared empty-state panel.
 *
 * Every list/collection surface should render this when there is nothing to
 * show, instead of an awkward blank area — it tells the user what is missing
 * and what to do next.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  style,
}) => (
  <div
    data-testid="empty-state"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: spacing.sm,
      padding: `${spacing['3xl']} ${spacing.lg}`,
      border: `1px dashed ${colors.neutral[300]}`,
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      maxWidth: '560px',
      margin: '0 auto',
      ...style,
    }}
  >
    {icon && (
      <div
        aria-hidden="true"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: colors.neutral[100],
          color: colors.neutral[500],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        {icon}
      </div>
    )}
    <h2
      style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        letterSpacing: typography.letterSpacing.tight,
      }}
    >
      {title}
    </h2>
    {description && (
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.neutral[600],
          lineHeight: typography.lineHeight.relaxed,
          maxWidth: '46ch',
          margin: 0,
        }}
      >
        {description}
      </p>
    )}
    {action && <div style={{ marginTop: spacing.md }}>{action}</div>}
  </div>
);
