import React from 'react';
import { colors, spacing } from '@talentsphere/ui';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, elevated = false, style, ...props }) => (
  <div
    style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: `1px solid ${colors.neutral[200]}`,
      boxShadow: elevated ? '0 1px 3px 0 rgba(0, 0, 0, 0.05)' : 'none',
      overflow: 'hidden',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: `${spacing.md} ${spacing.lg}`,
      borderBottom: `1px solid ${colors.neutral[100]}`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  style,
  ...props
}) => (
  <h2
    style={{
      fontSize: '1.125rem',
      fontWeight: 700,
      color: colors.neutral[900],
      margin: 0,
      lineHeight: 1.3,
      ...style,
    }}
    {...props}
  >
    {children}
  </h2>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  style,
  ...props
}) => (
  <p
    style={{
      fontSize: '0.8125rem',
      color: colors.neutral[500],
      margin: `${spacing.xs} 0 0`,
      lineHeight: 1.4,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: spacing.lg,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      padding: `${spacing.sm} ${spacing.lg}`,
      backgroundColor: colors.neutral[50],
      borderTop: `1px solid ${colors.neutral[200]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
