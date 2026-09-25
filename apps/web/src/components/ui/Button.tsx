import React from 'react';
import { colors } from '@talentsphere/ui';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.8125rem', height: '32px' },
    md: { padding: '8px 16px', fontSize: '0.875rem', height: '38px' },
    lg: { padding: '10px 20px', fontSize: '1rem', height: '44px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[700],
      color: '#ffffff',
      border: `1px solid ${colors.primary[800]}`,
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[800],
      border: `1px solid ${colors.neutral[300]}`,
    },
    outline: {
      backgroundColor: '#ffffff',
      color: colors.neutral[800],
      border: `1px solid ${colors.neutral[300]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: colors.semantic.error,
      color: '#ffffff',
      border: `1px solid #b91c1c`,
    },
  };

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
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
