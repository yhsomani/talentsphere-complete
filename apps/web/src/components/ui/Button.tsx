import React from 'react';
import { colors } from '@talentsphere/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Generous hit targets (WCAG 2.5.5) and a clear size ladder so the primary
  // CTA on any screen reads as the loudest element.
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.8125rem', height: '34px' },
    md: { padding: '9px 18px', fontSize: '0.9375rem', height: '42px' },
    lg: { padding: '13px 26px', fontSize: '1.0625rem', height: '52px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[700],
      color: '#ffffff',
      border: '1px solid transparent',
      fontWeight: 700,
      boxShadow: '0 1px 2px rgba(3, 88, 161, 0.25), 0 4px 12px rgba(3, 88, 161, 0.22)',
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[800],
      border: `1px solid ${colors.neutral[300]}`,
      fontWeight: 600,
    },
    outline: {
      backgroundColor: '#ffffff',
      color: colors.primary[700],
      border: `1.5px solid ${colors.primary[300]}`,
      fontWeight: 600,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      border: '1px solid transparent',
      fontWeight: 600,
    },
  };

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = colors.primary[800];
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow =
            '0 2px 4px rgba(3, 88, 161, 0.28), 0 8px 20px rgba(3, 88, 161, 0.28)';
        } else if (!isDisabled && variant === 'outline') {
          e.currentTarget.style.borderColor = colors.primary[600];
          e.currentTarget.style.backgroundColor = colors.primary[50];
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = colors.primary[700];
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow =
            '0 1px 2px rgba(3, 88, 161, 0.25), 0 4px 12px rgba(3, 88, 161, 0.22)';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = colors.primary[300];
          e.currentTarget.style.backgroundColor = '#ffffff';
        }
        onMouseLeave?.(e);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        transition:
          'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        letterSpacing: '-0.01em',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px #ffffff, 0 0 0 4px ${colors.primary[600]}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
