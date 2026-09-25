import React from 'react';
import { colors } from '@talentsphere/ui';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'gold' | 'silver' | 'bronze' | 'pending' | 'danger' | 'neutral' | 'info';
  mono?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  mono = false,
  style,
  ...props
}) => {
  const styles: Record<string, React.CSSProperties> = {
    verified: {
      backgroundColor: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
    },
    gold: {
      backgroundColor: '#fefce8',
      color: '#854d0e',
      border: '1px solid #fde047',
    },
    silver: {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      border: '1px solid #cbd5e1',
    },
    bronze: {
      backgroundColor: '#fff7ed',
      color: '#9a3412',
      border: '1px solid #fed7aa',
    },
    pending: {
      backgroundColor: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    },
    danger: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    neutral: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[200]}`,
    },
    info: {
      backgroundColor: colors.primary[50],
      color: colors.primary[800],
      border: `1px solid ${colors.primary[200]}`,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '4px', // Crisp, non-pill geometry
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: mono
          ? 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
          : 'inherit',
        lineHeight: 1.25,
        ...styles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
