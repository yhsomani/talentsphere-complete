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
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: `${spacing.xl} 0`,
      borderTop: `1px solid ${colors.neutral[300]}`,
      ...style,
    }}
  >
    {icon && (
      <div aria-hidden="true" style={{ color: colors.neutral[600] }}>
        {icon}
      </div>
    )}
    <h2
      className="serif-display"
      style={{
        fontSize: '1.5rem',
        color: colors.neutral[900],
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
